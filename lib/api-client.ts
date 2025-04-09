import { getAuth } from "firebase/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Add request tracking to prevent duplicate simultaneous requests
const pendingRequests = new Map();

// Helper function to get authentication token
const getAuthToken = async (forceRefresh = false): Promise<string | null> => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  try {
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Create headers with authorization token
const createHeaders = async (additionalHeaders: Record<string, string> = {}, skipAuth = false): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
  
  if (!skipAuth) {
    const token = await getAuthToken(false);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Define suitable types to replace 'any'
interface ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: unknown;
}

interface ResumeAnalysis {
  skills?: string[];
  experience?: Record<string, unknown>;
  education?: Record<string, unknown>;
  // Add other analysis fields as needed
}

// Generate a request key for deduplication
const getRequestKey = (url: string, method: string, body: unknown): string => {
  return `${method}:${url}:${JSON.stringify(body || {})}`;
};

// Define types for the API client
interface FetchParams {
  url: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

interface UserData {
  uid: string;
  email: string;
  name?: string;
  role?: string;
}

interface ResumeData {
  _id?: string;
  user_id: string;
  filename: string;
  filelink: string;
  fileHash: string;
  analysis: ResumeAnalysis;
  vendor_id?: string;
  vendor_name?: string;
  uploaded_at?: Date;
  updated_at?: Date;
}

interface VendorData {
  _id?: string;
  name: string;
  address?: string;
  contact_person?: string;
  country?: string;
  email?: string;
  phone?: string;
  state?: string;
  status?: string;
}

interface JobData {
  _id?: string;
  title: string;
  company: string;
  location: string;
  description: string;
  employment_type: string;
  experience_required: string;
  salary_range: string;
  status: string;
  requirements: string[];
  benefits: string[];
  skills_required: string[];
  nice_to_have_skills?: string[];
  working_hours?: string;
  mode_of_work?: string;
  deadline?: string;
  key_responsibilities?: string[];
  about_company?: string;
  created_at: Date;
  updated_at?: Date;
  total_applications?: number;
  shortlisted?: number;
  rejected?: number;
  in_progress?: number;
  metadata?: {
    created_by?: string;
    created_by_id?: string;
    last_modified_by?: string;
  };
  assigned_recruiters?: string[];
}

// Generic fetch function with authentication and deduplication
export const fetcher = async ({ 
  url, 
  method = 'GET', 
  body = null, 
  headers = {},
  skipAuth = false
}: FetchParams): Promise<unknown> => {
  // Normalize the URL to avoid duplicate slashes
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  const apiUrl = `${API_BASE_URL}${normalizedUrl}`;
  const requestKey = getRequestKey(apiUrl, method, body);
  
  // Log only for GET requests to reduce console noise
  if (method === 'GET') {
    console.log(`API Request: ${method} ${apiUrl}`);
  }
  
  // Check if there's an identical request in progress
  if (pendingRequests.has(requestKey)) {
    console.log(`Reusing pending request for: ${method} ${normalizedUrl}`);
    return pendingRequests.get(requestKey);
  }
  
  try {
    // Create a promise for this request
    const requestPromise = (async () => {
      const finalHeaders = await createHeaders(headers, skipAuth);
      
      try {
        const response = await fetch(apiUrl, {
          method,
          headers: finalHeaders,
          credentials: 'include',
          body: body ? JSON.stringify(body) : null,
          mode: 'cors'
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
            console.log("Failed to parse error response as JSON:", errorText);
          }
          
          const error = new Error(`HTTP error! status: ${response.status}`) as ApiError;
          error.status = response.status;
          error.statusText = response.statusText;
          error.data = errorData;
          
          console.error(`API Error (${response.status}):`, errorData);
          throw error;
        }

        return await response.json();
      } catch (error) {
        console.error(`API Request failed: ${method} ${normalizedUrl}`, error);
        throw error;
      } finally {
        // Remove this request from pending requests when done
        pendingRequests.delete(requestKey);
      }
    })();
    
    // Store the pending request
    pendingRequests.set(requestKey, requestPromise);
    
    return await requestPromise;
  } catch (error) {
    // Remove from pending requests on error
    pendingRequests.delete(requestKey);
    throw error;
  }
};

// API client with methods for different endpoints
const apiClient = {
  // Auth API
  auth: {
    getCurrentUser: async () => {
      try {
        const response = await fetcher({ url: '/auth/me' });
        return response;
      } catch (error) {
        if ((error as ApiError).status === 404) {
          throw new Error('User not found in database');
        }
        throw error;
      }
    },
    updateUser: (data: Partial<UserData>) => 
      fetcher({ url: '/auth/me', method: 'PUT', body: data }),
    getAllUsers: () => 
      fetcher({ url: '/auth/users' }),
    updateUserRole: (data: { uid: string; role: string }) => 
      fetcher({ url: '/auth/users/role', method: 'PUT', body: data }),
    createFromAuth: (data: {uid: string, email: string, name?: string}) => {
      return fetcher({ 
        url: '/auth/create-from-auth', 
        method: 'POST', 
        body: data, 
        skipAuth: true 
      });
    },
    makeAdmin: (data: {uid: string, email: string}) => {
      return fetcher({ 
        url: '/auth/make-admin', 
        method: 'POST', 
        body: data, 
        skipAuth: true 
      });
    },
  },
  
  // Resume API
  resumes: {
    checkDuplicate: (fileHash: string, userId: string) => fetcher({ 
      url: '/resumes/check-duplicate', 
      method: 'POST', 
      body: { fileHash, userId } 
    }),
    saveResume: (resumeData: Omit<ResumeData, '_id'>) => fetcher({ 
      url: '/resumes', 
      method: 'POST', 
      body: resumeData 
    }),
    getAllResumes: async () => {
      try {
        // Try to fetch all resumes (admin only)
        const data = await fetcher({
          url: '/resumes/admin/all',
          method: 'GET'
        });
        return data;
      } catch (error) {
        // If access is denied due to not being admin, log it clearly
        if ((error as ApiError).status === 403) {
          console.log('Access to all resumes denied: Admin privileges required');
          return []; // Return empty array instead of throwing
        }
        // For other errors, rethrow
        throw error;
      }
    },
    getUserResumes: (id: string) => {
      console.log('Getting resumes for user:', id);
      return fetcher({ 
        url: `/resumes?userId=${id}`,
        method: 'GET' 
      });
    },
    getResume: (id: string) => fetcher({ url: `/resumes/${id}` }),
    deleteResume: (id: string) => fetcher({ url: `/resumes/${id}`, method: 'DELETE' }),
    getAllForMatching: () => fetcher({ url: '/jobs/resumes/all' }),
  },
  
  // Vendor API
  vendors: {
    getAll: () => fetcher({ url: '/vendors' }),
    getById: (id: string) => fetcher({ url: `/vendors/${id}` }),
    create: (data: Omit<VendorData, '_id'>) => fetcher({ url: '/vendors', method: 'POST', body: data }),
    update: (id: string, data: Partial<VendorData>) => fetcher({ url: `/vendors/${id}`, method: 'PUT', body: data }),
    delete: (id: string) => fetcher({ url: `/vendors/${id}`, method: 'DELETE' }),
  },

  // Job API
  jobs: {
    getAll: () => fetcher({ url: '/jobs' }),
    getById: (id: string) => fetcher({ url: `/jobs/${id}` }),
    create: (data: Omit<JobData, '_id'>) => fetcher({ 
      url: '/jobs', 
      method: 'POST', 
      body: data 
    }),
    update: (id: string, data: Partial<JobData>) => fetcher({ 
      url: `/jobs/${id}`, 
      method: 'PUT', 
      body: data 
    }),
    delete: (id: string) => fetcher({ 
      url: `/jobs/${id}`, 
      method: 'DELETE' 
    }),
    getCandidates: (jobId: string) => fetcher({
      url: `/jobs/${jobId}/candidates`
    }),
    
    // Save candidates for a job
    saveCandidates: (jobId: string, candidates: Record<string, unknown>[]) => fetcher({
      url: `/jobs/${jobId}/candidates`,
      method: 'PUT',
      body: { candidates }
    }),
    
    // Update candidate status
    updateCandidateStatus: (jobId: string, candidateId: string, status: string, additionalData = {}) => fetcher({
      url: `/jobs/${jobId}/candidates/${candidateId}/status`,
      method: 'PUT',
      body: { 
        status, 
        ...additionalData 
      }
    }),
    
    // Assign recruiters to a job
    assignRecruiters: (jobId: string, recruiterIds: string[]) => fetcher({
      url: `/jobs/${jobId}/recruiters`,
      method: 'POST',
      body: { recruiterIds }
    }),
    
    // Check for new resumes for a job
    checkForNewResumes: (jobId: string) => fetcher({
      url: `/jobs/${jobId}/check-new-resumes`
    }),
  },
};

export default apiClient;

import { getAuth } from "firebase/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Define types for the API client
interface FetchParams {
  url: string;
  method?: string;
  body?: any;
  headers?: Record<string, string>;
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
  analysis: any;
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

// Add Job related interfaces
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

// Helper function to get authentication token
const getAuthToken = async (): Promise<string | null> => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  return await user.getIdToken();
};

// Create headers with authorization token
const createHeaders = async (additionalHeaders: Record<string, string> = {}): Promise<Record<string, string>> => {
  const token = await getAuthToken();
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...additionalHeaders,
  };
};

// Generic fetch function with authentication
export const fetcher = async ({ url, method = 'GET', body = null, headers = {} }: FetchParams): Promise<any> => {
  try {
    // Log the API request
    console.log(`Making API request: ${method} ${API_BASE_URL}${url}`);
    
    // Normalize the URL to avoid duplicate slashes
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    const apiUrl = `${API_BASE_URL}${normalizedUrl}`;
    
    console.log(`Full URL: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method,
      headers: await createHeaders(headers),
      credentials: 'include',
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      console.error(`API Error (${response.status}):`, errorData);
      
      // Create a more informative error
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      (error as any).statusText = response.statusText;
      (error as any).data = errorData;
      
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// API client with methods for different endpoints
const apiClient = {
  // Auth API
  auth: {
    getCurrentUser: () => fetcher({ url: '/auth/me' }),
    updateUser: (data: Partial<UserData>) => fetcher({ url: '/auth/me', method: 'PUT', body: data }),
    getAllUsers: () => fetcher({ url: '/auth/users' }),
    updateUserRole: (data: { uid: string; role: string }) => fetcher({ url: '/auth/users/role', method: 'PUT', body: data }),
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
    getAllResumes: () => fetcher({
      url: '/resumes/all',
      method: 'GET'
    }),
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
    // Get all jobs
    getAll: () => fetcher({ url: '/jobs' }),
    
    // Get a job by ID
    getById: (id: string) => fetcher({ url: `/jobs/${id}` }),
    
    // Create a new job
    create: (data: Omit<JobData, '_id'>) => fetcher({ 
      url: '/jobs', 
      method: 'POST', 
      body: data 
    }),
    
    // Update an existing job
    update: (id: string, data: Partial<JobData>) => fetcher({ 
      url: `/jobs/${id}`, 
      method: 'PUT', 
      body: data 
    }),
    
    // Delete a job
    delete: (id: string) => fetcher({ 
      url: `/jobs/${id}`, 
      method: 'DELETE' 
    }),
    
    // Get candidates for a job
    getCandidates: (jobId: string) => fetcher({
      url: `/jobs/${jobId}/candidates`
    }),
    
    // Save candidates for a job
    saveCandidates: (jobId: string, candidates: any[]) => fetcher({
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

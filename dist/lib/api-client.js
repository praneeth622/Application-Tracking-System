"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetcher = void 0;
const auth_1 = require("firebase/auth");
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
// Add request tracking to prevent duplicate simultaneous requests
const pendingRequests = new Map();
// Helper function to get authentication token
const getAuthToken = async (forceRefresh = false) => {
    const auth = (0, auth_1.getAuth)();
    const user = auth.currentUser;
    if (!user) {
        return null;
    }
    try {
        return await user.getIdToken(forceRefresh);
    }
    catch (error) {
        console.error("Error getting auth token:", error);
        return null;
    }
};
// Create headers with authorization token
const createHeaders = async (additionalHeaders = {}, skipAuth = false) => {
    const headers = {
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
// Generate a request key for deduplication
const getRequestKey = (url, method, body) => {
    return `${method}:${url}:${JSON.stringify(body || {})}`;
};
// Generic fetch function with authentication and deduplication
const fetcher = async ({ url, method = 'GET', body = null, headers = {}, skipAuth = false }) => {
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
                    }
                    catch {
                        errorData = { message: errorText };
                        console.log("Failed to parse error response as JSON:", errorText);
                    }
                    const error = new Error(`HTTP error! status: ${response.status}`);
                    error.status = response.status;
                    error.statusText = response.statusText;
                    error.data = errorData;
                    console.error(`API Error (${response.status}):`, errorData);
                    throw error;
                }
                return await response.json();
            }
            catch (error) {
                console.error(`API Request failed: ${method} ${normalizedUrl}`, error);
                throw error;
            }
            finally {
                // Remove this request from pending requests when done
                pendingRequests.delete(requestKey);
            }
        })();
        // Store the pending request
        pendingRequests.set(requestKey, requestPromise);
        return await requestPromise;
    }
    catch (error) {
        // Remove from pending requests on error
        pendingRequests.delete(requestKey);
        throw error;
    }
};
exports.fetcher = fetcher;
// API client with methods for different endpoints
const apiClient = {
    // Auth API
    auth: {
        getCurrentUser: async () => {
            try {
                const response = await (0, exports.fetcher)({ url: '/auth/me' });
                return response;
            }
            catch (error) {
                if (error.status === 404) {
                    throw new Error('User not found in database');
                }
                throw error;
            }
        },
        updateUser: (data) => (0, exports.fetcher)({ url: '/auth/me', method: 'PUT', body: data }),
        getAllUsers: () => (0, exports.fetcher)({ url: '/auth/users' }),
        updateUserRole: (data) => (0, exports.fetcher)({ url: '/auth/users/role', method: 'PUT', body: data }),
        createFromAuth: (data) => {
            return (0, exports.fetcher)({
                url: '/auth/create-from-auth',
                method: 'POST',
                body: data,
                skipAuth: true
            });
        },
        makeAdmin: (data) => {
            return (0, exports.fetcher)({
                url: '/auth/make-admin',
                method: 'POST',
                body: data,
                skipAuth: true
            });
        },
    },
    // Resume API
    resumes: {
        checkDuplicate: (fileHash, userId) => (0, exports.fetcher)({
            url: '/resumes/check-duplicate',
            method: 'POST',
            body: { fileHash, userId }
        }),
        saveResume: (resumeData) => (0, exports.fetcher)({
            url: '/resumes',
            method: 'POST',
            body: resumeData
        }),
        getAllResumes: async () => {
            try {
                // Try to fetch all resumes (admin only)
                const data = await (0, exports.fetcher)({
                    url: '/resumes/admin/all',
                    method: 'GET'
                });
                return data;
            }
            catch (error) {
                // If access is denied due to not being admin, log it clearly
                if (error.status === 403) {
                    console.log('Access to all resumes denied: Admin privileges required');
                    return []; // Return empty array instead of throwing
                }
                // For other errors, rethrow
                throw error;
            }
        },
        getUserResumes: (id) => {
            console.log('Getting resumes for user:', id);
            return (0, exports.fetcher)({
                url: `/resumes?userId=${id}`,
                method: 'GET'
            });
        },
        getResume: (id) => (0, exports.fetcher)({ url: `/resumes/${id}` }),
        deleteResume: (id) => (0, exports.fetcher)({ url: `/resumes/${id}`, method: 'DELETE' }),
        getAllForMatching: () => (0, exports.fetcher)({ url: '/jobs/resumes/all' }),
    },
    // Vendor API
    vendors: {
        getAll: () => (0, exports.fetcher)({ url: '/vendors' }),
        getById: (id) => (0, exports.fetcher)({ url: `/vendors/${id}` }),
        create: (data) => (0, exports.fetcher)({ url: '/vendors', method: 'POST', body: data }),
        update: (id, data) => (0, exports.fetcher)({ url: `/vendors/${id}`, method: 'PUT', body: data }),
        delete: (id) => (0, exports.fetcher)({ url: `/vendors/${id}`, method: 'DELETE' }),
    },
    // Job API
    jobs: {
        getAll: () => (0, exports.fetcher)({ url: '/jobs' }),
        getById: (id) => (0, exports.fetcher)({ url: `/jobs/${id}` }),
        create: (data) => (0, exports.fetcher)({
            url: '/jobs',
            method: 'POST',
            body: data
        }),
        update: (id, data) => (0, exports.fetcher)({
            url: `/jobs/${id}`,
            method: 'PUT',
            body: data
        }),
        delete: (id) => (0, exports.fetcher)({
            url: `/jobs/${id}`,
            method: 'DELETE'
        }),
        getCandidates: (jobId) => (0, exports.fetcher)({
            url: `/jobs/${jobId}/candidates`
        }),
        // Save candidates for a job
        saveCandidates: (jobId, candidates) => (0, exports.fetcher)({
            url: `/jobs/${jobId}/candidates`,
            method: 'PUT',
            body: { candidates }
        }),
        // Update candidate status
        updateCandidateStatus: (jobId, candidateId, status, additionalData = {}) => (0, exports.fetcher)({
            url: `/jobs/${jobId}/candidates/${candidateId}/status`,
            method: 'PUT',
            body: {
                status,
                ...additionalData
            }
        }),
        // Assign recruiters to a job
        assignRecruiters: (jobId, recruiterIds) => (0, exports.fetcher)({
            url: `/jobs/${jobId}/recruiters`,
            method: 'POST',
            body: { recruiterIds }
        }),
        // Check for new resumes for a job
        checkForNewResumes: (jobId) => (0, exports.fetcher)({
            url: `/jobs/${jobId}/check-new-resumes`
        }),
    },
};
exports.default = apiClient;

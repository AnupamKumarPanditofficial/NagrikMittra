import axios from 'axios';
import { Complaint } from '../types';

// The base URL of your backend server
const API_URL = 'http://localhost:5001/api';

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * ========================================================
 * Complaint Related Functions
 * ========================================================
 */
export const getComplaints = (): Promise<Complaint[]> => {
  return api.get('/complaints').then(response => response.data);
};

export const createComplaint = (complaintData: Omit<Complaint, '_id' | 'status' | 'submittedAt'>): Promise<Complaint> => {
  return api.post('/complaints', complaintData).then(response => response.data);
};


/**
 * ========================================================
 * Authentication Related Functions
 * ========================================================
 */

/**
 * Fetches the profile of the currently logged-in user.
 */
export const getUserProfile = () => {
  return api.get('/auth/profile');
};

/**
 * Updates the profile of the currently logged-in user.
 */
export const updateUserProfile = (profileData: any) => {
  return api.put('/auth/profile', profileData);
};

/**
 * Registers a new CITIZEN.
 */
export const registerUser = (registrationData: any) => {
  return api.post('/auth/register', registrationData);
};

/**
 * Registers a new MAIN-ADMIN.
 */
export const registerAdmin = (registrationData: any) => {
  return api.post('/auth/register-admin', registrationData);
};

/**
 * Logs in any user or admin.
 */
export const loginUser = (loginData: any) => {
  return api.post('/auth/login', loginData);
};

/**
 * Verifies the OTP for any user or admin.
 */
export const verifyOtp = (verificationData: { contactInfo: string; otp: string }) => {
  return api.post('/auth/verify-otp', verificationData);
};

/**
 * Resends the OTP for any user or admin.
 */
export const resendOtp = (contactInfo: string) => {
  return api.post('/auth/resend-otp', { contactInfo });
};

/**
 * Requests a password reset code.
 */
export const forgotPassword = (contactInfo: string) => {
    return api.post('/auth/forgot-password', { contactInfo });
};

/**
 * Submits the OTP and new password to reset it.
 */
export const resetPassword = (data: any) => {
    return api.post('/auth/reset-password', data);
};

/**
 * ========================================================
 * Sub-Admin Management Functions
 * ========================================================
 */

/**
 * Creates a new Sub-Admin. (Main Admin only)
 */
export const createSubAdmin = (subAdminData: any) => {
  return api.post('/auth/create-sub-admin', subAdminData);
};

/**
 * Fetches all sub-admins for the current Main Admin.
 */
export const getSubAdmins = (): Promise<any[]> => {
  return api.get('/auth/sub-admins').then(response => response.data);
};

/**
 * Updates a Sub-Admin's status. (Main Admin only)
 */
export const updateSubAdminStatus = (id: string, status: 'Active' | 'Inactive') => {
  return api.put(`/auth/sub-admin-status/${id}`, { status });
};

export const updateSubAdminProfile = (profileData: { name?: string; profilePictureUrl?: string }) => {
  return api.put('/auth/update-subadmin-profile', profileData);
};

/**
 * ========================================================
 * Request Management Functions (YEH NAYE HAIN)
 * ========================================================
 */

// Sub-admin creates a new request
export const createRequest = (requestData: { title: string; description: string }) => {
  return api.post('/requests', requestData);
};

// Sub-admin fetches their own requests
export const getMyRequests = () => {
  return api.get('/requests/my-requests');
};

// Main-admin fetches all incoming requests
export const getAllRequests = () => {
  return api.get('/requests/all');
};

// Main-admin updates a request's status
export const updateRequestStatus = (id: string, status: 'Approved' | 'Rejected') => {
  return api.put(`/requests/${id}`, { status });
};

export const registerDepartment = (data: { department: string; contactInfo: string; password: string; recaptchaToken: string }) => {
  return axios.post('/api/department/register', data);
};

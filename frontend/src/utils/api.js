import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to headers
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add loading indicator
    if (config.showLoading !== false) {
      // You can add a global loading state here
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response;
  },
  (error) => {
    // Handle errors
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        
        case 403:
          // Forbidden - user doesn't have permission
          toast.error('You do not have permission to perform this action.');
          break;
        
        case 404:
          // Not found
          toast.error('Resource not found.');
          break;
        
        case 422:
          // Validation error
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              toast.error(err.msg || 'Validation error');
            });
          } else {
            toast.error(data.message || 'Validation error');
          }
          break;
        
        case 429:
          // Rate limit exceeded
          toast.error('Too many requests. Please try again later.');
          break;
        
        case 500:
          // Server error
          toast.error('Server error. Please try again later.');
          break;
        
        default:
          // Other errors
          toast.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other errors
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgotpassword',
    resetPassword: (token) => `/auth/resetpassword/${token}`,
    verifyEmail: (token) => `/auth/verify-email/${token}`,
    resendVerification: '/auth/resend-verification',
  },
  
  // Users
  users: {
    profile: '/users/profile',
    preferences: '/users/preferences',
    changePassword: '/users/change-password',
    list: '/users',
    get: (id) => `/users/${id}`,
    create: '/users',
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
  },
  
  // Patients
  patients: {
    list: '/patients',
    get: (id) => `/patients/${id}`,
    create: '/patients',
    update: (id) => `/patients/${id}`,
    delete: (id) => `/patients/${id}`,
    search: '/patients/search',
    statistics: '/patients/statistics',
    vitalSigns: (id) => `/patients/${id}/vital-signs`,
    medicalHistory: (id) => `/patients/${id}/medical-history`,
    medications: (id) => `/patients/${id}/medications`,
    documents: (id) => `/patients/${id}/documents`,
  },
  
  // Doctors
  doctors: {
    list: '/doctors',
    get: (id) => `/doctors/${id}`,
    create: '/doctors',
    update: (id) => `/doctors/${id}`,
    delete: (id) => `/doctors/${id}`,
    search: '/doctors/search',
    schedule: (id) => `/doctors/${id}/schedule`,
    appointments: (id) => `/doctors/${id}/appointments`,
  },
  
  // Appointments
  appointments: {
    list: '/appointments',
    get: (id) => `/appointments/${id}`,
    create: '/appointments',
    update: (id) => `/appointments/${id}`,
    delete: (id) => `/appointments/${id}`,
    search: '/appointments/search',
    statistics: '/appointments/statistics',
    byDate: '/appointments/by-date',
    conflicts: '/appointments/check-conflicts',
    status: (id) => `/appointments/${id}/status`,
    notes: (id) => `/appointments/${id}/notes`,
    documents: (id) => `/appointments/${id}/documents`,
    reminders: (id) => `/appointments/${id}/reminders`,
  },
  
  // Dashboard
  dashboard: {
    overview: '/dashboard/overview',
    statistics: '/dashboard/statistics',
    recentActivity: '/dashboard/recent-activity',
    charts: '/dashboard/charts',
  },
  
  // Upload
  upload: {
    file: '/upload/file',
    image: '/upload/image',
    document: '/upload/document',
  },
};

// API helper functions
export const apiHelpers = {
  // Get request
  get: (url, config = {}) => api.get(url, config),
  
  // Post request
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  
  // Put request
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  
  // Delete request
  delete: (url, config = {}) => api.delete(url, config),
  
  // Patch request
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  
  // Upload file
  uploadFile: (url, file, onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  },
  
  // Download file
  downloadFile: (url, filename) => {
    return api.get(url, {
      responseType: 'blob',
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  },
};

// Export default api instance
export default api;
import axios from 'axios';
import { useAuthStore } from "@/stores/auth.js";
import router from "@/router";

// Dedicated axios instance for Accounting API endpoints
// VITE_ACCOUNTING_API should be like: http://127.0.0.1:8001/api/v1
// If it already includes /v1, use it as-is, otherwise append /v1
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_ACCOUNTING_API || 'http://127.0.0.1:8001/api';
  // Remove trailing slash if present
  const cleanUrl = envUrl.replace(/\/$/, '');
  // Check if it already includes /v1
  if (cleanUrl.endsWith('/v1')) {
    return cleanUrl;
  }
  // If it ends with /api, add /v1
  if (cleanUrl.endsWith('/api')) {
    return `${cleanUrl}/v1`;
  }
  // Otherwise, assume it needs /api/v1
  return `${cleanUrl}/api/v1`;
};

const accountingHttpClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  withCredentials: false,
});

// Add interceptor to include JWT token in all requests
accountingHttpClient.interceptors.request.use((config) => {
  config.headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, Promise.reject);

// Add response interceptor for error handling
accountingHttpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logout user and redirect to login on 401 Unauthorized
      const authStore = useAuthStore();
      authStore.logout(); // This already clears localStorage and resets state
      // Redirect to login page
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default accountingHttpClient;


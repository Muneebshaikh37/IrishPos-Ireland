import httpClient from '@/network/api/httpClient';
import axios from 'axios';
import { useAuthStore } from "@/stores/auth.js";
import router from "@/router";
// import httpClient from '@/services/__mocks__/mockHttpClient';

// Create a separate axios instance for auth endpoints
const authHttpClient = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_AUTH_API_URL || import.meta.env.VITE_PUBLIC_API_URL || 'https://api.example.com',
  timeout: 10000,
  withCredentials: false,
});

// Add interceptors similar to httpClient
authHttpClient.interceptors.request.use((config) => {
  // Only set Content-Type if not already set and if it's a form data request
  if (!config.headers['Content-Type'] && config.data instanceof FormData) {
    config.headers['Content-Type'] = "multipart/form-data";
  } else if (!config.headers['Content-Type'] && (config.method === 'post' || config.method === 'put' || config.method === 'patch')) {
    // For JSON requests, let axios set it automatically or set to application/json
    config.headers['Content-Type'] = "application/json";
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, Promise.reject);

// Add response interceptor for 401 handling
authHttpClient.interceptors.response.use(
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

// Export authHttpClient so it can be used directly for auth API endpoints
export { authHttpClient };

export default {
    login(credentials) {
        return authHttpClient.post('/auth/login', credentials);
    },
    register(credentials) {
        return authHttpClient.post('/auth/register', credentials);
    },
    forgotPassword(credentials) {
        return authHttpClient.post('/auth/forget-password', credentials);
    },
    verifyOtp(credentials) {
        return authHttpClient.post('/auth/forget-password-verify', credentials);
    },
    verifyRegistrationOtp(credentials) {
        return authHttpClient.post('/auth/register-verify', credentials);
    },
    resendRegistrationOtp(email) {
        return authHttpClient.post('/auth/register-resend-otp', { email });
    },
    resetPassword(credentials) {
        return authHttpClient.post(`/auth/change-password?expires=${credentials.expires}&signature=${credentials.signature}`, credentials);

    },
    logout() {
        return authHttpClient.post('/auth/logout');
    },
    getUserProfile(userId) {
        if (userId) {
            return authHttpClient.get('/v1/profile', { params: { user_id: userId } });
        }
        return authHttpClient.get('/profile');
    },
    // Secure OTP endpoints using AWS SES with IAM role
    requestSecureOtp(email) {
        return authHttpClient.post('/auth/secure/request-otp', { email });
    },
    verifySecureOtp(email, otp) {
        return authHttpClient.post('/auth/secure/verify-otp', { email, otp });
    },
};

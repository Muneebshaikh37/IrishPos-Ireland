import axios from 'axios';
import { handleResponse, handleError } from '@/network/api/responseHandler.js';
import { useAuthStore } from "@/stores/auth.js";
import router from "@/router";

// Dedicated axios instance for Packages endpoints on the auth/accounts service
const packagesHttpClient = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_AUTH_API_URL || import.meta.env.VITE_PUBLIC_API_URL || 'https://api.example.com',
  timeout: 15000,
  withCredentials: false,
});

packagesHttpClient.interceptors.request.use((config) => {
  // Use JSON for these endpoints
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  config.headers['Accept'] = 'application/json';
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, Promise.reject);

// Add response interceptor for 401 handling
packagesHttpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logout user and redirect to login on 401 Unauthorized
      const authStore = useAuthStore();
      authStore.logout();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default {
  /**
   * Get available packages for user (shop owners)
   */
  getAvailablePackages() {
    // VITE_PUBLIC_AUTH_API_URL already includes /api/v1, so we just need /packages/available
    return packagesHttpClient.get('/packages/available');
  },

  /**
   * Select package and initiate payment
   * @param {Object} payload
   * @param {string} payload.package_id
   * @param {string} [payload.payment_method] - 'muyaser' or 'offline'
   */
  selectPackage(payload) {
    // VITE_PUBLIC_AUTH_API_URL already includes /api/v1, so we just need /packages/select
    return packagesHttpClient.post('/packages/select', payload);
  },

  /**
   * Handle payment callback
   * @param {Object} callbackData
   */
  paymentCallback(callbackData) {
    // VITE_PUBLIC_AUTH_API_URL already includes /api/v1, so we just need /packages/payment/callback
    return packagesHttpClient.post('/packages/payment/callback', callbackData);
  },

  /**
   * Super Admin: List all packages
   * @param {Object} params
   * @param {string} params.superAdminId
   * @param {string} [params.search]
   * @param {number} [params.limit]
   * @param {number} [params.page]
   * @param {boolean} [params.is_active]
   */
  listPackages({ superAdminId, search = '', limit = 10, page = 1, is_active = null }) {
    const query = new URLSearchParams();
    if (superAdminId) query.set('super_admin_id', superAdminId);
    if (search) query.set('search', search);
    if (limit) query.set('limit', String(limit));
    if (page) query.set('page', String(page));
    if (is_active !== null) query.set('is_active', String(is_active));
    return packagesHttpClient.get(`/packages?${query.toString()}`);
  },

  /**
   * Super Admin: Get a single package
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.superAdminId
   */
  getPackage({ id, superAdminId }) {
    const query = new URLSearchParams();
    if (superAdminId) query.set('super_admin_id', superAdminId);
    return packagesHttpClient.get(`/packages/${id}?${query.toString()}`);
  },

  /**
   * Super Admin: Create a new package
   * @param {Object} payload
   * @param {string} payload.super_admin_id
   * @param {string} payload.name
   * @param {string} [payload.description]
   * @param {number} payload.price
   * @param {number} payload.duration_days
   * @param {string} payload.duration_type - 'daily', 'weekly', 'monthly', 'annual'
   * @param {Array} [payload.features]
   * @param {boolean} [payload.is_active]
   */
  createPackage(payload) {
    return packagesHttpClient.post('/packages', payload);
  },

  /**
   * Super Admin: Update a package
   * @param {Object} params
   * @param {string} params.id
   * @param {Object} params.data
   */
  updatePackage({ id, data }) {
    return packagesHttpClient.put(`/packages/${id}`, data);
  },

  /**
   * Super Admin: Delete a package
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.superAdminId
   */
  deletePackage({ id, superAdminId }) {
    const query = new URLSearchParams();
    if (superAdminId) query.set('super_admin_id', superAdminId);
    return packagesHttpClient.delete(`/packages/${id}?${query.toString()}`);
  },
};

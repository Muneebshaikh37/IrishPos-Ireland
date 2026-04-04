import axios from 'axios';

// Dedicated axios instance for Super Admin endpoints on the auth domain
const superAdminHttp = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_AUTH_API_URL || 'https://pucture-authentication.scraperrs.com/api',
  timeout: 15000,
  withCredentials: false,
});

superAdminHttp.interceptors.request.use((config) => {
  // Use JSON for these endpoints
  config.headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, Promise.reject);

export default {
  /**
   * List shops visible to the given super admin.
   * @param {Object} params
   * @param {string} params.superAdminId
   * @param {string} [params.search]
   * @param {number} [params.limit]
   * @param {number} [params.page]
   */
  listShops({ superAdminId, search = '', limit = 10, page = 1 }) {
    const query = new URLSearchParams();
    if (superAdminId) query.set('super_admin_id', superAdminId);
    if (search) query.set('search', search);
    if (limit) query.set('limit', String(limit));
    if (page) query.set('page', String(page));
    // VITE_PUBLIC_AUTH_API_URL already includes /api/v1, so just use /shops
    return superAdminHttp.get(`/shops?${query.toString()}`);
  },

  /**
   * Create a new shop
   * @param {Object} payload
   * @param {string} payload.super_admin_id
   * @param {string} payload.name
   * @param {string} payload.email
   * @param {string} payload.password
   * @param {string} [payload.phone]
   * @param {string} [payload.address]
   * @param {string} [payload.vat_number]
   * @param {string} [payload.package_id]
   * @param {boolean} [payload.skip_payment]
   * @param {string} [payload.notes]
   */
  createShop(payload) {
    // VITE_PUBLIC_AUTH_API_URL already includes /api/v1, so just use /shops
    return superAdminHttp.post('/shops', payload);
  },

  /**
   * Get shop details
   * @param {Object} params
   * @param {string} params.id - Shop ID
   * @param {string} params.superAdminId
   */
  getShop({ id, superAdminId }) {
    const query = new URLSearchParams();
    if (superAdminId) query.set('super_admin_id', superAdminId);
    // VITE_PUBLIC_AUTH_API_URL already includes /api/v1, so just use /shops/{id}
    return superAdminHttp.get(`/shops/${id}?${query.toString()}`);
  },

  /**
   * Update shop
   * @param {Object} params
   * @param {string} params.id - Shop ID
   * @param {Object} params.data - Shop data to update
   * @param {string} params.data.super_admin_id
   */
  updateShop({ id, data }) {
    // VITE_PUBLIC_AUTH_API_URL already includes /api/v1, so just use /shops/{id}
    return superAdminHttp.put(`/shops/${id}`, data);
  },

  /**
   * Delete shop
   * @param {Object} params
   * @param {string} params.id - Shop ID
   * @param {string} params.superAdminId
   */
  deleteShop({ id, superAdminId }) {
    const query = new URLSearchParams();
    if (superAdminId) query.set('super_admin_id', superAdminId);
    // VITE_PUBLIC_AUTH_API_URL already includes /api/v1, so just use /shops/{id}
    return superAdminHttp.delete(`/shops/${id}?${query.toString()}`);
  },

  /**
   * Start impersonation: returns a short-lived token (and optionally profile).
   * @param {Object} payload
   * @param {string} payload.super_admin_id
   * @param {string} payload.user_id - target shop admin user id
   */
  impersonate(payload) {
    // VITE_PUBLIC_AUTH_API_URL already includes /api/v1, so just use /auth/impersonate
    return superAdminHttp.post('/auth/impersonate', payload);
  },

  /**
   * Get dashboard analytics
   * @param {Object} params
   * @param {string} params.superAdminId
   */
  getDashboardAnalytics({ superAdminId }) {
    const query = new URLSearchParams();
    if (superAdminId) query.set('super_admin_id', superAdminId);
    return superAdminHttp.get(`/analytics/dashboard?${query.toString()}`);
  },

  /**
   * Get revenue analytics with date range
   * @param {Object} params
   * @param {string} params.superAdminId
   * @param {string} [params.start_date]
   * @param {string} [params.end_date]
   */
  getRevenueAnalytics({ superAdminId, start_date, end_date }) {
    const query = new URLSearchParams();
    if (superAdminId) query.set('super_admin_id', superAdminId);
    if (start_date) query.set('start_date', start_date);
    if (end_date) query.set('end_date', end_date);
    return superAdminHttp.get(`/analytics/revenue?${query.toString()}`);
  },
};



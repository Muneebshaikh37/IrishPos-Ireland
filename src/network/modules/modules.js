import axios from 'axios';
import { useAuthStore } from '@/stores/auth.js';
import router from '@/router';

// Dedicated axios instance for /admin/modules on the auth service
const modulesHttpClient = axios.create({
  baseURL:
    import.meta.env.VITE_PUBLIC_AUTH_API_URL ||
    import.meta.env.VITE_PUBLIC_API_URL ||
    'https://api.example.com',
  timeout: 15000,
  withCredentials: false,
});

modulesHttpClient.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  config.headers['Accept'] = 'application/json';

  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, Promise.reject);

modulesHttpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default {
  /**
   * GET /admin/modules — list all global modules (parents + children).
   * Each item: { id, name, parent_id, permissions: [...] }
   */
  listModules() {
    return modulesHttpClient.get('/admin/modules');
  },
};

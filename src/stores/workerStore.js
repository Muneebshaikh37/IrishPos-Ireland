import { defineStore } from 'pinia';
import axios from 'axios';
import { handleResponse } from '@/network/api/responseHandler.js';
import { useAuthStore } from "@/stores/auth.js";

export const useWorkerStore = defineStore('worker', {
  state: () => ({
    workers: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchWorkers() {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const USER_ID = authStore.getUserId;
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_PUBLIC_AUTH_API_URL}/dropdowndata/users?user_id=${USER_ID}&role=Worker`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        const result = handleResponse(response);
        this.workers = result.data?.data || [];
      } catch (error) {
        console.error('Error fetching workers:', error);
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
  },

  getters: {
    getWorkers: (state) => state.workers,
  },
});


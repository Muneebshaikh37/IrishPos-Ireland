import { defineStore } from 'pinia';
import apiService from '@/network/api/apiService.js';
import { handleResponse } from '@/network/api/responseHandler.js';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchProducts() {
      this.loading = true;
      try {
        const response = await apiService.product.product_search();
        const result = handleResponse(response);
        this.products = result.data.data || [];
      } catch (error) {
        console.error('Error fetching products:', error);
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
  },

  getters: {
    getProducts: (state) => state.products,
  },
});

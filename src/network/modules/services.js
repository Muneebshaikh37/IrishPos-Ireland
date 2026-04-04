import httpClient from '@/network/api/httpClient';
import { useAuthStore } from "@/stores/auth.js";

// Services module mirrors product endpoints for now to keep UI functional
export default {
    list() {
        const authStore = useAuthStore();
        const USER_ID = authStore.getUserId;
        const user_id = `user_id=${USER_ID}`;
        return httpClient.get(`products?${user_id}`);
    },
    create(payload) {
        return httpClient.post('/products', payload);
    },
    delete(Uuid) {
        return httpClient.delete(`/products/${Uuid}`);
    },
    show(Uuid) {
        return httpClient.get(`/products/${Uuid}`);
    },
    edit(Uuid, payload) {
        return httpClient.post(`/products/${Uuid}`, payload);
    },
    activation(Uuid) {
        return httpClient.patch(`/products/${Uuid}/toggle-activation`);
    },
};



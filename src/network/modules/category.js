import httpClient from '@/network/api/httpClient';
import { useAuthStore } from "@/stores/auth.js";

export default {
    list() {
        // Move store usage inside the method
        const authStore = useAuthStore();
        const USER_ID = authStore.getUserId;
        const user_id = `user_id=${USER_ID}`;

        return httpClient.get(`categories?${user_id}`);
    },
    create(payload) {
        return httpClient.post('/categories', payload);
    },
    delete(Uuid) {
        return httpClient.delete(`/categories/${Uuid}`);
    },
    show(Uuid) {
        return httpClient.get(`/categories/${Uuid}`);
    },
    edit(Uuid, payload) {
        return httpClient.post(`/categories/${Uuid}`, payload);
    },
    activation(Uuid) {
        const authStore = useAuthStore();
        const USER_ID = authStore.getUserId;
        return httpClient.patch(`/categories/${Uuid}/toggle-activation`, null, {
            params: { user_id: USER_ID },
        });
    },
};

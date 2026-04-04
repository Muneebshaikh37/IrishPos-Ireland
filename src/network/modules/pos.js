import httpClient from '@/network/api/httpClient';
import { useAuthStore } from "@/stores/auth.js";

export default {
    list() {
        const authStore = useAuthStore(); // Access store dynamically
        const USERID = authStore.getUserId; // Get USERID dynamically
        const user_id = `user_id=${USERID}`;
        return httpClient.get(`/registers?${user_id}`);
    },
    create(payload) {
        const authStore = useAuthStore(); // Access store dynamically
        const USERID = authStore.getUserId; // Get USERID dynamically
        const fullPayload = { ...payload, user_id: USERID }; // Include user_id in payload
        return httpClient.post('/registers/open', fullPayload);
    },
    delete(Uuid) {
        return httpClient.delete(`/categories/${Uuid}`);
    },
    show(Uuid) {
        return httpClient.get(`/categories/${Uuid}`);
    },
    edit(Uuid, payload) {
        return httpClient.put(`/categories/${Uuid}`, payload);
    },
    activation(Uuid) {
        return httpClient.patch(`/categories/${Uuid}/toggle-activation`);
    },
};

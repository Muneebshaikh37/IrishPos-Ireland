import httpClient from '@/network/api/httpClient';
import { useAuthStore } from "@/stores/auth.js";

export default {
    list() {
        const authStore = useAuthStore(); // Dynamically access the store
        const USERID = authStore.getUserId; // Retrieve USERID
        const user_id = `user_id=${USERID}`;
        return httpClient.get(`suppliers?${user_id}`);
    },
    create(payload) {
        const authStore = useAuthStore();
        const USERID = authStore.getUserId;
        const user_id = `user_id=${USERID}`;
        return httpClient.post(`/suppliers?${user_id}`, payload);
    },
    delete(Uuid) {
        return httpClient.delete(`/suppliers/${Uuid}`);
    },
    show(Uuid) {
        return httpClient.get(`/suppliers/${Uuid}`);
    },
    edit(Uuid, payload) {
        const authStore = useAuthStore();
        const USERID = authStore.getUserId;
        const user_id = `user_id=${USERID}`;
        return httpClient.post(`/suppliers/${Uuid}?${user_id}`, payload);
    },
    activation(Uuid) {
        return httpClient.patch(`/suppliers/${Uuid}/toggle-activation`);
    },
};

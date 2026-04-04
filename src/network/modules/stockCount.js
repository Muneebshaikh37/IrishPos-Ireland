import httpClient from '@/network/api/httpClient';
import { useAuthStore } from "@/stores/auth.js";

export default {
    list() {
        const authStore = useAuthStore(); // Access the store dynamically
        const USERID = authStore.getUserId; // Retrieve USERID dynamically
        const user_id = `user_id=${USERID}`;
        return httpClient.get(`stock-counts?${user_id}`);
    },
    create(payload) {
        const authStore = useAuthStore();
        const USERID = authStore.getUserId;
        const user = authStore.getUser;
        const role = (user && (user.role || (Array.isArray(user.roles) ? user.roles[0] : ''))) || '';
        const query = `user_id=${USERID}${role ? `&role=${encodeURIComponent(role)}` : ''}`;
        return httpClient.post(`/stock-counts?${query}`, payload);
    },
    delete(Uuid) {
        return httpClient.delete(`/stock-counts/${Uuid}`);
    },
    show(Uuid) {
        return httpClient.get(`/stock-counts/${Uuid}`);
    },
    edit(Uuid, payload) {
        const authStore = useAuthStore();
        const USERID = authStore.getUserId;
        const user_id = `user_id=${USERID}`;
        return httpClient.post(`/stock-counts/${Uuid}?${user_id}`, payload);
    },
};

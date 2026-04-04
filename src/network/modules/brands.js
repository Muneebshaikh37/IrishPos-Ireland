import httpClient from '@/network/api/httpClient';
import { useAuthStore } from "@/stores/auth.js";

export default {
    list() {
        const authStore = useAuthStore(); // Access store dynamically
        const USERID = authStore.getUserId; // Retrieve USERID dynamically
        const user_id = `user_id=${USERID}`;
        return httpClient.get(`brands?${user_id}`);
    },
    create(payload) {
        const authStore = useAuthStore(); // Access store dynamically
        const USERID = authStore.getUserId; // Retrieve USERID dynamically
        const fullPayload = { ...payload, user_id: USERID }; // Include user_id in payload
        return httpClient.post('brands', fullPayload);
    }
};

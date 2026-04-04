import httpClient from '@/network/api/httpClient';
import { useAuthStore } from "@/stores/auth.js";

export default {
    list() {
        const authStore = useAuthStore(); // Access store dynamically
        const USERID = authStore.getUserId; // Get USERID dynamically
        const user_id = `user_id=${USERID}`;
        return httpClient.get(`/v1/invoices?${user_id}`);
    },
    create(payload) {
        const authStore = useAuthStore(); // Access store dynamically
        const USERID = authStore.getUserId; // Get USERID dynamically
        const fullPayload = { ...payload, user_id: USERID }; // Add user_id to payload
        return httpClient.post(`/v1/invoices`, fullPayload);
    },
    show(Uuid) {
        const authStore = useAuthStore(); // Access store dynamically
        const USERID = authStore.getUserId; // Get USERID dynamically
        const user_id = `user_id=${USERID}`;
        return httpClient.get(`/v1/invoices/${Uuid}?${user_id}`);
    },
    allList(search = null) {
        const authStore = useAuthStore(); // Access store dynamically
        const USERID = authStore.getUserId; // Get USERID dynamically
        const params = {
            user_id: USERID,
            is_service: false,
        };
        if (search && search.trim()) {
            params.search = search.trim();
        }
        return httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL}/dropdowndata/products`, {
            params,
        });
    },
};

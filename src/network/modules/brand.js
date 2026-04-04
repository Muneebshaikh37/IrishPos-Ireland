import httpClient from '@/network/api/httpClient';
import { useAuthStore } from "@/stores/auth.js";

export default {
    list(product_count) {
        const authStore = useAuthStore();
        const USERID = authStore.getUserId;
        const user_id = `user_id=${USERID}`;
        return httpClient.get(`brands?${user_id}&product_count=${product_count}`);
    },
    create(payload) {
        const authStore = useAuthStore();
        const USERID = authStore.getUserId;
        const fullPayload = { ...payload, user_id: USERID };
        return httpClient.post('/brands', fullPayload);
    },
    delete(Uuid) {
        return httpClient.delete(`/brands/${Uuid}`);
    },
    show(Uuid) {
        return httpClient.get(`/brands/${Uuid}`);
    },
    update(Uuid, payload) {
        const authStore = useAuthStore();
        const USERID = authStore.getUserId;
        const fullPayload = { ...payload, user_id: USERID, _method: "PUT" };
        return httpClient.post(`/brands/${Uuid}`, fullPayload);
    },
    edit(Uuid, payload) {
        return httpClient.put(`/brands/${Uuid}`, payload);
    },
    activation(Uuid) {
        const authStore = useAuthStore();
        const USERID = authStore.getUserId;
        return httpClient.patch(`/brands/${Uuid}/toggle-activation`, null, {
            params: { user_id: USERID },
        });
    },
};

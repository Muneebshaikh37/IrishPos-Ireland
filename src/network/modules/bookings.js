import httpClient from "@/network/api/httpClient";

const baseUrl = () => import.meta.env.VITE_PUBLIC_API_URL_POS;

export default {
    list(userId, params = {}) {
        return httpClient.get(`${baseUrl()}/bookings`, {
            params: { user_id: userId, ...params },
        });
    },

    show(id, userId) {
        return httpClient.get(`${baseUrl()}/bookings/${id}`, {
            params: { user_id: userId },
        });
    },

    update(id, userId, payload) {
        return httpClient.patch(`${baseUrl()}/bookings/${id}?user_id=${userId}`, payload);
    },

    destroy(id, userId) {
        return httpClient.delete(`${baseUrl()}/bookings/${id}?user_id=${userId}`);
    },

    convertPayload(id, userId) {
        return httpClient.get(`${baseUrl()}/bookings/${id}/convert-payload`, {
            params: { user_id: userId },
        });
    },
};

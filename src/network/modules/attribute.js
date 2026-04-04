import httpClient from '@/network/api/httpClient';
import { useAuthStore } from "@/stores/auth.js";

export default {
  list() {
    const authStore = useAuthStore();
    const USER_ID = authStore.getUserId;
    const user_id = `user_id=${USER_ID}`;

    return httpClient.get(`attributes?${user_id}`);
  },
  create(payload) {
    return httpClient.post('/attributes', payload);
  },
  delete(Uuid) {
    return httpClient.delete(`/attributes/${Uuid}`);
  },
  show(Uuid) {
    return httpClient.get(`/attributes/${Uuid}`);
  },
  edit(Uuid, payload) {
    return httpClient.post(`/attributes/${Uuid}`, payload);
  },
  activation(Uuid) {
    return httpClient.patch(`/attributes/${Uuid}/toggle-activation`);
  },
};


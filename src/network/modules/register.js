import httpClient from '@/network/api/httpClient';
import { useAuthStore } from "@/stores/auth.js";

export default {
    list() {
        const authStore = useAuthStore(); // Access the store dynamically
        const USERID = authStore.getUserId; // Retrieve USERID dynamically
        const user_id = `user_id=${USERID}`;
        return httpClient.get(`/registers?${user_id}`);
    },
    invoices_list(registerId) {
        return httpClient.get(`/registers/${registerId}/invoices`);
    },
    invoice(id) {
        return httpClient.get(`/invoices/${id}`);
    },
    returns(payload) {
        return httpClient.post(`/returns`, payload);
    },
    create(payload) {
        return httpClient.post('/registers/open', payload);
    },
    invoices(payload) {
        return httpClient.post('/invoices', payload);
    },
    createTransaction(payload) {
        return httpClient.post('/registers/transaction', payload);
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

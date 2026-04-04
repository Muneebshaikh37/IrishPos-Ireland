import httpClient from '@/network/api/httpClient';
import { useAuthStore } from "@/stores/auth.js";

export default {
    list() {
        const authStore = useAuthStore();
        const USER_ID = authStore.getUserId;
        const user_id = `user_id=${USER_ID}`;
        return httpClient.get(`products?${user_id}`);
    },
    product_search() {
        const authStore = useAuthStore();
        const USER_ID = authStore.getUserId;
        const user_id = `user_id=${USER_ID}`;
        return httpClient.get(`dropdowndata/products?${user_id}`);
    },
    create(payload) {
        return httpClient.post('/products', payload);
    },
    delete(Uuid) {
        return httpClient.delete(`/products/${Uuid}`);
    },
    show(Uuid) {
        return httpClient.get(`/products/${Uuid}`);
    },
    edit(Uuid, payload) {
        return httpClient.post(`/products/${Uuid}`, payload);
    },
    activation(Uuid) {
        const authStore = useAuthStore();
        const USER_ID = authStore.getUserId;
        return httpClient.patch(`/products/${Uuid}/toggle-activation`, null, {
            params: { user_id: USER_ID },
        });
    },
    search(barcodeId) {
        const authStore = useAuthStore();
        const USER_ID = authStore.getUserId;
        const user_id = `user_id=${USER_ID}`;
        return httpClient.get(`/search-product?${user_id}&barcode=${barcodeId}`);
    },
    categoryList() {
        const authStore = useAuthStore();
        const USER_ID = authStore.getUserId;
        const user_id = `user_id=${USER_ID}`;
        return httpClient.get(`dropdowndata/categories?${user_id}`);
    },
    categoryCreate(payload) {
        return httpClient.post('/categories', payload);
    },
    subCategoryList(Uuid) {
        const authStore = useAuthStore();
        const USER_ID = authStore.getUserId;
        const user_id = `user_id=${USER_ID}`;
        return httpClient.get(`dropdowndata/categories/${Uuid}/sub-categories?${user_id}`);
    },
    subCategoryCreate(Uuid, payload) {
        return httpClient.post(`categories/${Uuid}/sub-categories`, payload);
    },
    brandsList() {
        const authStore = useAuthStore();
        const USER_ID = authStore.getUserId;
        const user_id = `user_id=${USER_ID}`;
        return httpClient.get(`dropdowndata/brands?${user_id}`);
    },
    brandsCreate(payload) {
        return httpClient.post('brands', payload);
    }
};

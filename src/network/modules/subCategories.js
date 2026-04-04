import httpClient from '@/network/api/httpClient';
// import httpClient from '@/services/__mocks__/mockHttpClient';

export default {
    list(Uuid) {
        return httpClient.get(`categories/${Uuid}/sub-categories`);
    },
    create(Uuid, payload) {
        return httpClient.post(`categories/${Uuid}/sub-categories`, payload);
    },  
};

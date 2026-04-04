import httpClient from '@/network/api/httpClient';
// import httpClient from '@/services/__mocks__/mockHttpClient';

export default {
    list() {
        return httpClient.get(`packings `);
    },   
};

import axios from 'axios';
import toast from "@/stores/utility/toast";
import pan from "@/stores/pan";
import { useAuthStore } from "@/stores/auth.js";
import router from "@/router";

const httpClient = axios.create({
    baseURL: import.meta.env.VITE_PUBLIC_API_URL || 'https://api.example.com',
    timeout: 10000,
    withCredentials: false, // Required for Laravel CSRF
});

// Add Laravel CSRF token if needed
httpClient.interceptors.request.use((config) => {
    // const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    // if (csrfToken) {
    //     config.headers['X-CSRF-TOKEN'] = csrfToken;
    // }

    // Only set multipart/form-data if the data is FormData, otherwise use application/json
    if (!(config.data instanceof FormData)) {
        // Always set application/json for non-FormData requests
        // This ensures JSON payloads are sent correctly
        config.headers['Content-Type'] = 'application/json';
        config.headers['Accept'] = 'application/json';
    } else {
        // For FormData, let the browser set the Content-Type with boundary
        delete config.headers['Content-Type'];
    }

    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, Promise.reject);

const handleErrorResponse = (error) => {
    // Ignore aborted/canceled requests - they're intentional when new requests are made
    if (error.code === 'ERR_CANCELED' || error.name === 'AbortError' || error.message?.includes('canceled')) {
        return Promise.reject(error);
    }

    const status = error.response?.status;
    switch (status) {
        case 400:
          // toast().fry(pan.serverErrors.error('Bad Request: The request could not be understood or was missing required parameters. Please verify the details and try again.'))
            break;
        case 401:
            // Logout user and redirect to login on 401 Unauthorized
            const authStore = useAuthStore();
            authStore.logout(); // This already clears localStorage and resets state
            // Redirect to login page
            router.push('/login');
            toast().fry(pan.serverErrors.error("Unauthorized: Your session has expired. Please log in again."));
            break;
        case 403:
            toast().fry(pan.serverErrors.error("Forbidden: You do not have permission to perform this action. Please check your access rights or contact support."))
            break;
        case 404:
            toast().fry(pan.serverErrors.error("Not Found: The resource you are looking for could not be found. Please check the URL or contact support."))
            break;
        case 422:
            // toast().fry(pan.serverErrors.error("Validation Error: One or more fields contain invalid data. Please review your input and try again."));
            break;
        case 500:
            toast().fry(pan.serverErrors.error("Server Error: We are currently experiencing issues on our server. Please try again later or contact our development team."))
            break;
        default:
            toast().fry(pan.serverErrors.error("An unexpected error occurred: " + (error.message || "Please try again later.")));
            break;
    }
    return Promise.reject(error.response?.data || error.message);
};

httpClient.interceptors.response.use(
    (response) => response,
    (error) => handleErrorResponse(error)
);

export default httpClient;

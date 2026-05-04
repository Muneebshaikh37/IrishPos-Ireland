/**
 * Public Booking API — no authentication required.
 * Uses plain axios (not the auth-aware httpClient) so no JWT token is sent.
 */
import axios from 'axios';

const baseURL = import.meta.env.VITE_PUBLIC_API_URL || 'https:/.example.com';

const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

export default {
    /** List all active shops on the platform */
    getShops(search = '') {
        const params = search ? { search } : {};
        return client.get('/booking/shops', { params });
    },

    /** List services offered by a specific shop */
    getServices(shopId) {
        return client.get(`/booking/${shopId}/services`);
    },

    /**
     * Get available time slots for a shop on a given date.
     * @param {string} shopId
     * @param {string} date  — "YYYY-MM-DD"
     * @param {string|null} serviceId — optional, filters booked slots per service
     */
    getSlots(shopId, date, serviceId = null) {
        const params = { date };
        if (serviceId) params.service_id = serviceId;
        return client.get(`/booking/${shopId}/slots`, { params });
    },

    /**
     * Create a new booking.
     * @param {string} shopId
     * @param {{ service_id, scheduled_date, scheduled_time, customer_name, customer_phone, customer_country_code, notes }} payload
     */
    createBooking(shopId, payload) {
        return client.post(`/booking/${shopId}`, payload);
    },

    /** Retrieve booking details by reference number */
    getConfirmation(reference) {
        return client.get(`/booking/confirm/${reference}`);
    },
};

// /src/utils/vat.js
import { authHttpClient } from "@/network/modules/auth.js";

export async function getVat(userId) {
    if (!userId) {
        console.warn("No user ID provided. Returning default VAT.");
        return 15; // Default VAT
    }

    try {
        const response = await authHttpClient.get(`/user-taxes?user_id=${userId}`);
        return response.data.data?.subject_to_vat || response.data.subject_to_vat || 15; // Return the VAT or fallback to default
    } catch (error) {
        console.error("Error fetching VAT:", error);
        return 15; // Fallback to default VAT in case of error
    }
}


// console.log("User ID:", USER_ID);
// console.log("VAT:", VAT);
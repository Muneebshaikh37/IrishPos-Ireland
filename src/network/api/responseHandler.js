// src/network/api/errorHandler.js

export function handleResponse(response) {
    // Consider 200, 201, and 204 as success statuses
    // 204 No Content is commonly used for successful DELETE operations
    const isSuccess = response.status === 200 || response.status === 201 || response.status === 204;

    return {
        success: isSuccess,
        data: response.data,
        status: response.status,
        message: response.data?.message || (isSuccess ? 'Request successful' : 'Request failed'),
    };
}

export function handleError(error) {
    // Handle axios error response structure
    const errorResponse = error?.response || error;

    // Laravel validation error (422)
    if (errorResponse?.status === 422) {
        return {
            success: false,
            data: null,
            message: errorResponse?.data?.message || 'Validation errors',
            errors: errorResponse?.data?.errors || {},
            status: 422,
        };
    }

    // Handle other error statuses
    if (errorResponse?.status) {
        return {
            success: false,
            data: errorResponse?.data || null,
            message: errorResponse?.data?.message || errorResponse?.message || 'An error occurred',
            errors: errorResponse?.data?.errors || {},
            status: errorResponse.status,
        };
    }

    // Handle cases where the errorResponse exists but doesn't have a status
    if (errorResponse) {
        return {
            success: false,
            data: errorResponse?.data || null,
            message: errorResponse?.message || error?.message || 'An error occurred',
            errors: errorResponse?.errors || errorResponse?.data?.errors || {},
            status: 400,
        };
    }

    // Default error handling for other cases
    return {
        success: false,
        data: null,
        message: error?.message || 'An error occurred',
        errors: {},
        status: 500,
    };
}

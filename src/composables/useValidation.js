import { ref } from 'vue';

export function useValidation() {
    const errors = ref({});

    const setErrors = (validationErrors) => {
        errors.value = validationErrors || {};
    };

    const clearErrors = () => {
        errors.value = {};
    };

    const getError = (field) => {
        return errors.value[field]?.[0] || ''; // Get the first error for a field
    };

    return {
        errors,
        setErrors,
        clearErrors,
        getError,
    };
}

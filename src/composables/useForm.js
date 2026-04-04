import { ref } from 'vue';

export function useForm(submitCallback) {
    const isSubmitting = ref(false);
    const errors = ref({});

    const handleSubmit = async (data) => {
        isSubmitting.value = true;
        try {
            await submitCallback(data);
        } catch (error) {
            errors.value = error.response?.data?.errors || {};
        } finally {
            isSubmitting.value = false;
        }
    };

    return {
        isSubmitting,
        handleSubmit,
        errors
    };
}

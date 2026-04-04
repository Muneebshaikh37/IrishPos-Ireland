// src/composables/useDialog.ts
import { ref } from "vue";

// Composable to manage dialog state
export function useDialog() {
    const isOpen = ref(false);

    // Open the dialog
    const openDialog = () => {
        isOpen.value = true;
    };

    // Close the dialog
    const closeDialog = () => {
        isOpen.value = false;
    };

    return {
        isOpen,
        openDialog,
        closeDialog,
    };
}

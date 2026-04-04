import { ref, watch, onMounted } from "vue";
import { NOTES, COINS } from "@/utils/denominations.js";

export function useFormUtils() {
    const registerName = ref("");
    const manualOpeningAmount = ref(0);
    const notes = ref(NOTES.map(note => ({ ...note, count: 0 })));
    const coins = ref(COINS.map(coin => ({ ...coin, count: 0 })));
    const isValid = ref(false);

    function resetCounts() {
        notes.value.forEach(note => (note.count = 0));
        coins.value.forEach(coin => (coin.count = 0));
    }

    function updateOpeningAmount() {
        const totalNotes = notes.value.reduce(
            (sum, note) => sum + note.value * note.count,
            0
        );
        const totalCoins = coins.value.reduce(
            (sum, coin) => sum + parseFloat(coin.value) * coin.count,
            0
        );

        manualOpeningAmount.value = totalNotes + totalCoins;
    }

    function validateForm() {
        isValid.value =
            registerName.value.trim() !== "" &&
            (manualOpeningAmount.value > 0 ||
                notes.value.some(note => note.count > 0) ||
                coins.value.some(coin => coin.count > 0));
    }

    function handleManualAmountInput() {
        resetCounts();
        validateForm();
    }

    onMounted(() => {
        resetCounts();
        validateForm();
    });

    watch([manualOpeningAmount, notes, coins], validateForm, { deep: true });

    return {
        registerName,
        manualOpeningAmount,
        notes,
        coins,
        isValid,
        updateOpeningAmount,
        validateForm,
        handleManualAmountInput,
        resetCounts,
    };
}

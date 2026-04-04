// stores/invoiceStore.js
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { calculateSubtotal, calculateDiscountAmount, calculateTax, calculateTotal } from '@/helpers/calculationHelper';

export const useInvoiceStore = defineStore('invoice', () => {
    // State
    const products = ref([]);
    const additionalDiscountPercent = ref(0);
    const additionalDiscountFixed = ref(0);
    const addedProductIds = ref(new Set());
    const discountMode = ref('percent'); // "percent" or "fixed"

    // Computed properties
    const subtotal = computed(() => calculateSubtotal(products.value));
    const discountAmount = computed(() => calculateDiscountAmount(products.value));
    const tax = computed(() => calculateTax(products.value));
    const total = computed(() => {
        const additionalDiscount = (discountMode.value === 'percent')
            ? (additionalDiscountPercent.value / 100) * subtotal.value
            : additionalDiscountFixed.value;
        return calculateTotal(subtotal.value, discountAmount.value, tax.value, additionalDiscount);
    });

    // Actions
    function addProductToInvoice(product) {
        if (addedProductIds.value.has(product.id)) {
            alert("This product is already in the invoice.");
            return;
        }

        // Add product to the invoice
        products.value.push({
            ...product,
            quantity: 1,
            discount: 0,
            totalPrice: product.sale_price, // Initial total price
        });

        addedProductIds.value.add(product.id);
    }

    function removeProductFromInvoice(productId) {
        const productIndex = products.value.findIndex((product) => product.id === productId);
        if (productIndex !== -1) {
            products.value.splice(productIndex, 1);
            addedProductIds.value.delete(productId);
        }
    }

    function updateAdditionalDiscountPercent(value) {
        additionalDiscountPercent.value = value;
    }

    function updateAdditionalDiscountFixed(value) {
        additionalDiscountFixed.value = value;
    }

    return {
        products,
        additionalDiscountPercent,
        additionalDiscountFixed,
        discountMode,
        addedProductIds,
        subtotal,
        discountAmount,
        tax,
        total,
        addProductToInvoice,
        removeProductFromInvoice,
        updateAdditionalDiscountPercent,
        updateAdditionalDiscountFixed,
    };
});

// src/helpers/calculationHelper.js

import toast from "@/stores/utility/toast.js";
// import {VAT, vatValue} from "@/config/constants.js";
import {decimalFormat} from "@/helpers/commonHelper.js";
import {useAuthStore} from "@/stores/auth.js";

// const authStore = useAuthStore();
// const VAT = authStore.getUserVat;
// const vatValue = authStore.getVatValue;
/**
 * Calculate the subtotal (tax exclusive).
 * @param {Array} products - List of products.
 * @returns {number} - The subtotal.
 */
export function calculateSubtotal(products) {
    // Subtotal (Tax Exclusive) = price × (1 − rate), shop convention.
    const authStore = useAuthStore();
    const vatValue = authStore.getVatValue;
    return products.reduce((total, product) => {
        const price = Number(product.selectedPacking?.sale_price ?? product.sale_price) || 0;
        const quantity = Number(product.quantity) || 1;
        const inclusive = price * quantity;
        const exclusive = vatValue > 0 ? inclusive * (1 - vatValue) : inclusive;
        const discountAmount = product.discount > 0
            ? exclusive * (product.discount / 100)
            : 0;
        return total + (exclusive - discountAmount);
    }, 0);
}
export function calculateSubtotalTaxInclusive(products) {
    // Prices are tax-EXCLUSIVE; just sum (price * qty - discount). The
    // `calculateTotal` helper layers tax on top — don't double-count here.
    return calculateSubtotal(products);
}

export function calculateProductTotal(product) {
    const price = product.selectedPacking?.sale_price || 0; // VAT-inclusive price
    const quantity = product.quantity || 1;

    // Calculate the discount amount
    const discountAmount = product.discount > 0
        ? (price * product.discount / 100) * quantity
        : 0;

    // Final price after discount (VAT-inclusive)
    const totalAfterDiscount = (price * quantity) - discountAmount;

    return totalAfterDiscount; // VAT-inclusive price after discount
}


/**
 * Calculate the total discount amount.
 * @param {Array} products - List of products.
 * @returns {number} - The total discount amount.
 */
export function calculateDiscountAmount(products) {
    return products.reduce((total, product) => {
        const discount = product.discount > 0
            ? (product.selectedPacking?.sale_price * product.quantity * product.discount) / 100
            : 0;
        return total + discount;
    }, 0);
}

/**
 * Calculate the total tax amount.
 * @param {Array} products - List of products.
 * @returns {number} - The total tax.
 */
export function calculateTax(products) {
    const authStore = useAuthStore();
    const vatValue = authStore.getVatValue;
    return products.reduce((total, product) => {
        // Tax = original (pre-discount) price × rate (shop convention).
        const price = Number(product.selectedPacking?.sale_price ?? product.sale_price) || 0;
        const quantity = Number(product.quantity) || 1;
        const vatAmount = vatValue > 0 ? (price * quantity) * vatValue : 0;
        return total + vatAmount;
    }, 0);
}

/**
 * Calculate the additional discount based on mode.
 * @param {string} discountMode - "percent" or "fixed".
 * @param {number} additionalDiscountPercent - Additional discount percentage.
 * @param {number} additionalDiscountFixed - Additional fixed discount.
 * @param {number} subtotal - The subtotal.
 * @returns {number} - The additional discount amount.
 */
export function calculateAdditionalDiscount(
    discountMode,
    additionalDiscountPercent,
    additionalDiscountFixed,
    subtotal
) {
    if (subtotal <= 0) {
        return 0; // No discount if subtotal is invalid
    }

    let additionalDiscount = 0;

    if (discountMode === "percent") {
        // Calculate percentage discount
        additionalDiscount = additionalDiscountPercent > 0
            ? subtotal * (additionalDiscountPercent / 100)
            : 0;
    } else if (discountMode === "fixed") {
        // Calculate fixed discount
        additionalDiscount = additionalDiscountFixed > 0 && additionalDiscountFixed <= subtotal
            ? additionalDiscountFixed
            : 0;
    }

    return additionalDiscount;
}


/**
 * Calculate the total (tax inclusive).
 * @param {number} subtotal - The subtotal.
 * @param {number} discountAmount - The total discount amount.
 * @param {number} tax - The total tax amount.
 * @param {number} additionalDiscountAmount - The additional discount amount.
 * @returns {number} - The final total.
 */
export function calculateTotal(subtotal, discountAmount, tax, additionalDiscountAmount) {
    let total = subtotal;

    // Apply all discounts
    total -= discountAmount; // Product-level discounts
    total -= additionalDiscountAmount; // Additional discounts (percent or fixed)

    console.log("Total before tax:", total);
    console.log("Tax:", tax);
    console.log("additionalDiscountAmount:", additionalDiscountAmount);
    console.log("discountAmount:", discountAmount);

    // Add taxes
    total += tax;

    // Ensure total is not negative
    return total > 0 ? total : 0;
}


/**
 * Calculate the percentage discount from a fixed discount amount.
 * @param {number} fixedDiscount - The fixed discount amount in SAR.
 * @param {number} total - The total amount.
 * @returns {number} - The percentage discount.
 */
export function calculatePercentFromFixed(fixedDiscount, total) {
    // Ensure total is valid to prevent division by zero
    return total > 0 ? (fixedDiscount / total) * 100 : 0;
}

/**
 * Calculate the fixed discount amount from a percentage.
 * @param {number} percentDiscount - The discount percentage.
 * @param {number} total - The total amount.
 * @returns {number} - The discount amount in SAR.
 */
export function calculateFixedFromPercent(percentDiscount, total) {
    // Ensure percentage is valid
    return total > 0 && percentDiscount > 0 ? (total * percentDiscount) / 100 : 0;
}

export  function calculateTotalforReturn(product) {
    const unitPrice = parseFloat(product.salePrice); // Parse unit price to ensure it's a number
    const discount = product.discount || 0; // Handle cases where discount might be undefined
    const returnedQuantity = product.returnedQuantity || 0; // Handle cases where returnedQuantity might be undefined

    // Calculate the total for returned items after applying the discount
    const total = returnedQuantity * (unitPrice - (unitPrice * discount / 100));

    return decimalFormat(total);
}
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
    const authStore = useAuthStore();
    const VAT = authStore.getUserVat;
    const vatValue = authStore.getVatValue;
    return products.reduce((total, product) => {
        const price = product.selectedPacking?.sale_price || 0; // VAT-inclusive price
        const quantity = product.quantity || 1;
        let priceExcludingVAT = 0;
        if (product.vat !== 0) {
            // Correct VAT extraction from inclusive price
            priceExcludingVAT = price / (1 + vatValue);
        } else {
            priceExcludingVAT = price;
        }
        const discountAmount = product.discount > 0
            ? (priceExcludingVAT * quantity) * (product.discount / 100)
            : 0;
        const discountedSubtotal = (priceExcludingVAT * quantity) - discountAmount;
        return total + discountedSubtotal;
    }, 0);
}
export function calculateSubtotalTaxInclusive(products) {

    return products.reduce((total, product) => {
        const price = product.selectedPacking?.sale_price || 0; // VAT-inclusive price
        const quantity = product.quantity || 1;


        let priceExcludingVAT = 0 ;

        // If VAT is applicable (1 = VAT-inclusive price)
        if (product.vat !== 0) {
            // Exclude VAT from price by dividing by 1.15 (removing 15% VAT)
            const vat = (price / 100) * VAT ;
            priceExcludingVAT = price
        } else {
            // If no VAT, price is tax-exclusive already
            priceExcludingVAT = price;
        }

        // Apply discount after VAT removal (if discount is applied)
        const discountAmount = product.discount > 0
            ? (priceExcludingVAT * quantity) * (product.discount / 100)
            : 0;

        // Subtotal after discount
        const discountedSubtotal = (priceExcludingVAT * quantity) - discountAmount;

        return total + discountedSubtotal; // Return the total after applying the discount
    }, 0);
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
        // VAT-inclusive unit price; support both product structures
        const price = (product.selectedPacking?.sale_price ?? product.sale_price) || 0;
        const quantity = product.quantity || 1;
        const discountAmount = product.discount > 0
            ? price * (product.discount / 100) * quantity
            : 0;
        const discountedPrice = (price * quantity) - discountAmount;
        // Correct VAT extraction from inclusive price
        const vatAmount = product.vat !== 0 && product.vat !== "0.00" ? discountedPrice * (vatValue / (1 + vatValue)) : 0;
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
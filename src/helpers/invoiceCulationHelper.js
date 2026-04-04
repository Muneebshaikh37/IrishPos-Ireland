// src/helpers/calculationHelper.js

/**
 * Calculate the subtotal (tax exclusive).
 * @param {Array} products - List of products.
 * @returns {number} - The subtotal.
 */
export function calculateSubtotal(products) {
    // console.log("products", products)
    return products.reduce((sum, product) => sum + (product.cost_price * (product.quantity || 0)), 0);
}

/**
 * Calculate the total discount amount.
 * @param {Array} products - List of products.
 * @returns {number} - The total discount amount.
 */
export function calculateDiscountAmount(products) {
    return products.reduce((sum, product) =>
            sum + product.vat,
        0
    );
}

/**
 * Calculate the total tax amount.
 * @param {Array} products - List of products.
 * @returns {number} - The total tax.
 */
export function calculateTax(products) {
    return products.reduce((sum, product) => sum + product.vat, 0);
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
    if (discountMode === "percent") {
        return subtotal * (additionalDiscountPercent / 100);
    }
    return additionalDiscountFixed;
}

/**
 * Calculate the total (tax inclusive).
 * @param {number} subtotal - The subtotal.
 * @param {number} discountAmount - The total discount amount.
 * @param {number} tax - The total tax.
 * @param {number} additionalDiscountAmount - The additional discount amount.
 * @returns {number} - The total.
 */
export function calculateTotal(products) {
    return products.reduce((sum, product) => sum + product.totalPrice + product.vat, 0);
}


/**
 * Calculate the percentage from a fixed discount amount.
 * @param {number} fixedDiscount - The discount amount in SAR.
 * @param {number} subtotal - The subtotal amount.
 * @returns {number} - The percentage discount.
 */
export function calculatePercentFromFixed(fixedDiscount, subtotal) {
    return subtotal > 0 ? (fixedDiscount / subtotal) * 100 : 0;
}

/**
 * Calculate the fixed discount amount from a percentage.
 * @param {number} percentDiscount - The discount percentage.
 * @param {number} subtotal - The subtotal amount.
 * @returns {number} - The discount amount in SAR.
 */
export function calculateFixedFromPercent(percentDiscount, subtotal) {
    return (subtotal * percentDiscount) / 100;
}


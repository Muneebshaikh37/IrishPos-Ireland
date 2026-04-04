import { formatMoney } from "@/utils/currency";

export function formatPrice(amount) {
    if (isNaN(amount)) {
        console.error("Invalid amount provided for price formatting.");
        return formatMoney(0);
    }

    // Ensure the amount is rounded to 2 decimal places
    const roundedAmount = Math.round(amount * 100) / 100;

    return formatMoney(roundedAmount, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
export function decimalFormat(value) {
    if (isNaN(value)) {
        console.error("Invalid value provided for decimal formatting.");
        return "0.00";
    }

    const amount = parseFloat(value);
    return amount.toFixed(2);
}
export function roundToTwoDecimals(amount) {
    if (isNaN(amount)) {
        console.error("Invalid amount provided for rounding.");
        return 0.00;
    }

    // Round to two decimal places
    return Math.round(amount * 100) / 100;
}

import { formatMoney } from "@/utils/currency";

export default function currencyFormatter(value: any) {
    return formatMoney(value, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}
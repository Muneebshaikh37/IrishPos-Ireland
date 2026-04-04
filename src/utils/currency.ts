export const CURRENCY_OPTIONS = ["SAR", "USD", "EUR"] as const;

export type SupportedCurrency = (typeof CURRENCY_OPTIONS)[number];

export const CURRENCY_SYMBOL_MAP: Record<SupportedCurrency, string> = {
  SAR: "SR",
  USD: "$",
  EUR: "EUR",
};

const DEFAULT_CURRENCY: SupportedCurrency = "EUR";

export function getCurrencyCode(): SupportedCurrency {
  const stored = (localStorage.getItem("currency_code") || DEFAULT_CURRENCY).toUpperCase();
  if ((CURRENCY_OPTIONS as readonly string[]).includes(stored)) {
    return stored as SupportedCurrency;
  }
  return DEFAULT_CURRENCY;
}

export function setCurrencyCode(currency: string | null | undefined): SupportedCurrency {
  const normalized = (currency || DEFAULT_CURRENCY).toUpperCase();
  const safe = (CURRENCY_OPTIONS as readonly string[]).includes(normalized)
    ? (normalized as SupportedCurrency)
    : DEFAULT_CURRENCY;
  localStorage.setItem("currency_code", safe);
  return safe;
}

export function getCurrencySymbol(currency?: string | null): string {
  const code = (currency || getCurrencyCode()).toUpperCase() as SupportedCurrency;
  return CURRENCY_SYMBOL_MAP[code] || CURRENCY_SYMBOL_MAP[DEFAULT_CURRENCY];
}

export function formatMoney(
  amount: number | string,
  opts?: { currency?: string | null; locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const numericAmount = Number(amount);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;
  const currency = (opts?.currency || getCurrencyCode()).toUpperCase();
  const locale = opts?.locale || (localStorage.getItem("locale") || "en");

  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: opts?.minimumFractionDigits ?? 2,
    maximumFractionDigits: opts?.maximumFractionDigits ?? 2,
  }).format(safeAmount);
}


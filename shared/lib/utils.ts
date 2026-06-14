import { SERVICE_FEE_RATE } from "@/shared/config";

export function cn(
  ...classes: (string | undefined | null | false)[]
): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString("fr-FR") + " €";
}

export function formatPriceCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateBookingTotal(pricePerDay: number, days: number) {
  const subtotal = pricePerDay * days;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee;
  return { subtotal, serviceFee, total, days };
}

export function pluralize(
  count: number,
  singular: string,
  plural: string
): string {
  return count === 1 ? singular : plural;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

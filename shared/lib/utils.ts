import { Fragment, createElement, type ReactNode } from "react";
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

/**
 * Convertit un Date en "YYYY-MM-DD" à partir de ses composants *locaux*.
 * `d.toISOString().split("T")[0]` est un piège : il passe par l'UTC, donc pour
 * un fuseau en avance sur UTC (France UTC+1/+2), un Date à minuit local
 * "retombe" sur la veille (ex. 1er août 00:00 local → 31 juillet 22:00 UTC).
 */
export function toLocalIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

/**
 * Interpole des {placeholders} dans un texte en nœuds React, sans jamais
 * passer par du HTML brut : chaque valeur (ex. un nom de bateau saisi par
 * un propriétaire) reste un nœud texte React, donc échappée par défaut.
 * À utiliser à la place de `dangerouslySetInnerHTML` pour ce genre de gabarit.
 */
export function interpolate(template: string, values: Record<string, ReactNode>): ReactNode {
  return template.split(/(\{\w+\})/g).map((part, i) => {
    const match = /^\{(\w+)\}$/.exec(part);
    if (match && match[1] in values) {
      return createElement(Fragment, { key: i }, values[match[1]]);
    }
    return part;
  });
}

/**
 * Vérifie qu'une adresse e-mail a une forme plausible (quelque chose@quelque
 * chose.quelque chose, sans espace) — rejette par ex. "test", "test@exemple"
 * ou "test.com" saisis sans @ ni domaine valide.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Formate une date en français — "07/07/2026" par défaut.
 *
 * @param value Date, chaîne ISO, timestamp… tout ce que `new Date()` accepte.
 * @param options Options Intl pour varier le rendu (ex. { month: "long" } → "7 juillet 2026").
 * @returns La date formatée, ou null si la valeur est absente ou invalide.
 */
export function formatDateFr(
  value: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string | null {
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("fr-FR", options);
}

export function formatTimeFr(
  value: string | number | Date | null | undefined,
): string | null {
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date
    .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    .replace(":", "h");
}

/**
 * Helpers de conversion pour les valeurs de date des filtres.
 *
 * Le format d'échange est la chaîne ISO `YYYY-MM-DD` (celle des query params et
 * des colonnes `date` Postgres). Les conversions passent par date-fns et non par
 * `new Date("YYYY-MM-DD")`, interprété en UTC : le rendu décalerait d'un jour
 * pour les fuseaux négatifs (Antilles, Amérique…).
 *
 * NB : `toIsoDate` fait doublon avec `dayKey` (@playground/shared-types), que
 * packages/ui ne peut pas importer — il ne dépend pas du paquet shared.
 */

import { format, isValid, parse } from "date-fns";

const ISO_FORMAT = "yyyy-MM-dd";
const FR_FORMAT = "dd/MM/yyyy";

/** `YYYY-MM-DD` → Date locale (minuit), ou `undefined` si vide/invalide. */
export function parseIsoDate(value: string): Date | undefined {
  const date = parse(value, ISO_FORMAT, new Date());
  return isValid(date) ? date : undefined;
}

/** Date → `YYYY-MM-DD` (chaîne vide si absente). */
export function toIsoDate(date: Date | undefined): string {
  return date ? format(date, ISO_FORMAT) : "";
}

/** `YYYY-MM-DD` → `JJ/MM/AAAA` (chaîne vide si vide/invalide). */
export function formatIsoDateFr(value: string): string {
  const date = parseIsoDate(value);
  return date ? format(date, FR_FORMAT) : "";
}

import { z } from "zod";

/**
 * Email — règle unique de validité d'une adresse pour tout le projet.
 *
 * Les espaces en bord d'adresse ne sont pas une erreur mais un défaut à
 * corriger : le schéma les retire (`.trim()`) au lieu de refuser la valeur.
 * Une adresse copiée-collée avec une espace est donc acceptée et normalisée.
 * Les espaces internes restent, elles, invalides — `trim` ne touche que les bords.
 *
 * ⚠️ Plus stricte qu'`<input type="email">`, qui suit la spec HTML : le
 * navigateur accepte `a@b` ou `a@localhost` (domaine sans TLD), pas nous. La
 * bulle native peut donc rester muette là où notre message signale une erreur —
 * jamais l'inverse.
 */

/** Message affiché à l'utilisateur — un seul libellé pour toute l'app. */
export const EMAIL_ERROR_MESSAGE =
  "Adresse email invalide (exemple : contact@structure.fr)";

/**
 * Adresse email valide et non vide, débarrassée de ses espaces de bord.
 *
 * `.trim()` étant une transformation, la valeur nettoyée n'est disponible que
 * dans le résultat du parse : les appelants doivent utiliser `result.data`, pas
 * la valeur d'entrée, sans quoi la normalisation est perdue.
 */
export const EmailSchema = z
  .string()
  .trim()
  .email({ message: EMAIL_ERROR_MESSAGE });

/**
 * Message d'erreur d'une adresse, ou `undefined` s'il n'y a rien à signaler.
 *
 * Une valeur vide ne renvoie pas d'erreur : le « champ obligatoire ou non » ne
 * se décide pas ici mais au niveau du formulaire. Un champ requis vérifie donc
 * la présence de son côté et délègue le format à cette fonction.
 */
export function getEmailError(
  value: string | null | undefined,
): string | undefined {
  if (!value) return undefined;
  return EmailSchema.safeParse(value).success ? undefined : EMAIL_ERROR_MESSAGE;
}

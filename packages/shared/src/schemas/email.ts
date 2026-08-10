import { z } from "zod";

/**
 * Email — règle unique de validité d'une adresse pour tout le projet.
 */

/** Message affiché à l'utilisateur — un seul libellé pour toute l'app. */
export const EMAIL_ERROR_MESSAGE =
  "Adresse email invalide (exemple : contact@structure.fr)";

/** Adresse email valide et non vide. */
export const EmailSchema = z.string().email({ message: EMAIL_ERROR_MESSAGE });

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

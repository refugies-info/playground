export { isConnectionError } from "@playground/supabase";

/**
 * Détecte l'exception de redirection levée par `redirect()` de Next.js.
 *
 * `getCurrentUser()` (`@/lib/auth`) redirige aussi bien vers `/login` (absence
 * de session) que vers `/service-unavailable` (Supabase injoignable ou profil
 * illisible). Dans un route handler, ces redirections n'ont pas de sens : elles
 * lèvent une exception qu'il faut interpréter explicitement.
 *
 * On ne peut pas utiliser `isRedirectError()` de Next.js ici : elle n'est pas
 * exportée par `next/navigation`, et `unstable_rethrow()` est une API marquée
 * instable. La forme du digest `NEXT_REDIRECT;<type>;<destination>;<status>;`
 * est en revanche stable et documentée dans le code de Next.js.
 *
 * @returns le chemin de redirection, ou `null` si l'erreur n'en est pas une.
 */
export function getRedirectPath(error: unknown): string | null {
  if (
    typeof error !== "object" ||
    error === null ||
    !("digest" in error) ||
    typeof (error as { digest: unknown }).digest !== "string"
  ) {
    return null;
  }

  const [code, type, destination] = (error as { digest: string }).digest.split(
    ";",
  );
  if (code !== "NEXT_REDIRECT") return null;
  if (type !== "replace" && type !== "push") return null;
  if (!destination) return null;

  return destination;
}

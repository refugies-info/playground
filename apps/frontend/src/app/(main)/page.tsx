import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

/**
 * Root route for authenticated users.
 *
 * Redirects to the appropriate dashboard based on user role:
 * - translators → /translations
 * - everyone else → /documents
 *
 * Role is read from profiles (source of truth for RBAC).
 */
export default async function MainPage() {
  const { role } = await getCurrentUser();

  if (role === "translator") {
    redirect("/translations");
  }

  redirect("/documents");
}

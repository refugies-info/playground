import "server-only";
import { isAdmin, logger } from "@playground/shared-types";
import { getCurrentUser } from "@/lib/auth";

/** Throws unless the current user is an admin. Shared by admin server actions. */
export async function assertAdmin(): Promise<void> {
  const currentUser = await getCurrentUser();
  if (!isAdmin(currentUser.role)) {
    logger.warn(
      { userId: currentUser.id, role: currentUser.role },
      "Unauthorized attempt to access admin action",
    );
    throw new Error("Non autorisé : Droits d'administrateur requis.");
  }
}

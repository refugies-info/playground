import type { Database } from "@playground/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Verifies if the user has permission to modify the workflow.
 * Rules:
 * - Admins, editors, and translators can modify everything.
 */
export async function verifyWorkflowPermission(
  supabase: SupabaseClient<Database>,
  workflowId: string,
  userId: string,
  userRole?: string,
): Promise<boolean> {
  // Admins and editors have full write access
  if (userRole === "admin" || userRole === "editor") {
    return true;
  }

  // Translators can only edit their own translation_records
  if (userRole === "translator") {
    // Check if there is a translation record for this workflow authored by the user
    const { data: translation, error: tError } = await supabase
      .from("translation_records")
      .select("id")
      .eq("workflow_id", workflowId)
      .eq("author_id", userId)
      .maybeSingle();

    // If no translation record found for this user/workflow, deny access
    // This also naturally denies access to editorial workflows
    if (tError || !translation) {
      return false;
    }

    return true;
  }

  // Other roles have no write access
  return false;
}

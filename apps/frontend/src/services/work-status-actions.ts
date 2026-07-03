"use server";

import { logger, type WorkStatus } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

/**
 * Change manuel de l'état de traitement d'une fiche.
 *
 * Écrit directement `editorial_records.work_status` (source du
 * `computed_work_status` exposé par la vue `workflows_enriched`).
 * Loggue l'événement dans l'audit trail (from → to).
 */
export async function updateWorkStatusAction(
  workflowId: string,
  workStatus: WorkStatus | null,
): Promise<{ success: boolean; error?: string }> {
  const [currentUser, cookieStore] = await Promise.all([
    getCurrentUser(),
    cookies(),
  ]);

  if (!["admin", "editor"].includes(currentUser.role || "")) {
    return { success: false, error: "Permissions insuffisantes" };
  }

  const supabase = createSupabaseServerClient(cookieStore);

  // work_status vit sur editorial_records, pas sur workflows.
  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("editorial_record_id, editorial_records ( work_status )")
    .eq("id", workflowId)
    .single();

  if (workflowError || !workflow?.editorial_record_id) {
    logger.error(
      workflowError,
      "Error fetching workflow for work_status update",
    );
    return { success: false, error: "Fiche introuvable" };
  }
  const { error } = await supabase
    .from("editorial_records")
    .update({ work_status: workStatus })
    .eq("id", workflow.editorial_record_id);

  if (error) {
    logger.error(error, "Error updating work_status");
    return { success: false, error: error.message };
  }

  revalidatePath("/documents/[id]", "page");
  revalidatePath("/documents", "page");

  return { success: true };
}

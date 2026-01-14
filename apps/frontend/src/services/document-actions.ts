"use server";

import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";

export async function saveDocument(
  workflowId: string,
  markdown: string,
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  try {
    // First, get the workflow to check for existing editorial_record and get ingestion_record_id
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select(
        `
        id,
        editorial_record_id,
        ingestion_record_id
      `,
      )
      .eq("id", workflowId)
      .single();

    if (workflowError || !workflow) {
      logger.error(workflowError, "Error fetching workflow for save");
      return { success: false, error: "Workflow not found" };
    }

    // Check if we need an ingestion_record_id (required for creating new editorial_records)
    if (workflow.editorial_record_id) {
      // Update existing editorial_record
      const { error: updateError } = await supabase
        .from("editorial_records")
        .update({
          markdown,
          updated_at: new Date().toISOString(),
        })
        .eq("id", workflow.editorial_record_id);

      if (updateError) {
        logger.error(updateError, "Error updating editorial_record");
        return { success: false, error: "Failed to update editorial record" };
      }
    } else {
      // Create new editorial_record - we need ingestion_record_id
      if (!workflow.ingestion_record_id) {
        return {
          success: false,
          error: "No ingestion record found for this workflow",
        };
      }

      const { error: insertError } = await supabase
        .from("editorial_records")
        .insert({
          ingestion_record_id: workflow.ingestion_record_id,
          markdown,
        });

      if (insertError) {
        logger.error(insertError, "Error creating editorial_record");
        return { success: false, error: "Failed to create editorial record" };
      }
    }

    return { success: true };
  } catch (error) {
    logger.error(error, "Unexpected error saving document");
    return { success: false, error: "Unexpected error occurred" };
  }
}

export async function toggleWorkflowStatus(
  workflowId: string,
  currentStatus: string,
): Promise<{
  success: boolean;
  newStatus?: string;
  newProgress?: string;
  error?: string;
}> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  try {
    const newStatus =
      currentStatus === "compliant" ? "non_compliant" : "compliant";

    // Determine the new progress based on status transition
    let newProgress: string;
    if (currentStatus === "non_compliant" && newStatus === "compliant") {
      // Non-conforme → Conforme: document needs to be processed before publication
      newProgress = "to_process";
    } else if (currentStatus === "compliant" && newStatus === "non_compliant") {
      // Conforme → Non-conforme: document is archived
      newProgress = "archived";
    } else {
      // Fallback: keep existing progress (shouldn't happen in normal flow)
      newProgress = currentStatus === "compliant" ? "to_process" : "archived";
    }

    const { error: updateError } = await supabase
      .from("workflows")
      .update({ status: newStatus, progress: newProgress })
      .eq("id", workflowId);

    if (updateError) {
      logger.error(updateError, "Error updating workflow status");
      return { success: false, error: "Failed to update workflow status" };
    }

    return { success: true, newStatus, newProgress };
  } catch (error) {
    logger.error(error, "Unexpected error removing workflow status");
    return { success: false, error: "Unexpected error occurred" };
  }
}

/**
 * Server action to get the webhook secret for preview authentication
 * This allows secure transmission of the webhook secret without exposing it client-side
 * The Main App expects the raw secret, not an HMAC signature
 */
export async function getPreviewSecret(): Promise<{
  success: boolean;
  secret?: string;
  error?: string;
}> {
  const webhookSecret = process.env.RI_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error("Missing RI_WEBHOOK_SECRET for preview");
    return { success: false, error: "Configuration serveur manquante" };
  }

  return { success: true, secret: webhookSecret };
}

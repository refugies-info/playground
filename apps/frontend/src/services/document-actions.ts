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
    if (!workflow.ingestion_record_id && !workflow.editorial_record_id) {
      return {
        success: false,
        error: "No ingestion record found for this workflow",
      };
    }

    const editorialRecordId = workflow.editorial_record_id;

    if (editorialRecordId) {
      // Update existing editorial_record
      const { error: updateError } = await supabase
        .from("editorial_records")
        .update({
          markdown,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editorialRecordId);

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

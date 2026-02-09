import { extractTitleFromMarkdown, logger } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";

/**
 * Result of saving a document.
 */
export interface SaveDocumentResult {
  editorialRecordId: string;
  isNew: boolean;
  progressUpdated: boolean;
  metadata: Record<string, unknown>;
}

/**
 * Saves or updates an editorial document.
 *
 * This step:
 * 1. Gets the workflow to check for existing editorial_record
 * 2. Updates existing record or creates new one
 * 3. Extracts title from markdown and syncs it to metadata
 * 4. Ensures progress is set to 'draft'
 *
 * @param workflowId - The workflow ID to save document for
 * @param markdown - The markdown content to save
 * @returns Result with editorial record ID and operation status
 */
export async function saveDocumentStep(
  workflowId: string,
  markdown: string,
): Promise<StepResult<SaveDocumentResult>> {
  "use step";

  try {
    const supabase = getSupabaseClient();

    // 1. Get the workflow and related records to get existing metadata
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select(
        `
        id, 
        editorial_record_id, 
        ingestion_record_id, 
        work_status,
        editorial_records (metadata),
        ingestion_records (metadata)
      `,
      )
      .eq("id", workflowId)
      .single();

    if (workflowError || !workflow) {
      logger.error(workflowError, "Error fetching workflow for save");
      return { success: false, error: "Workflow not found" };
    }

    // 2. Extract title and prepare metadata
    const title = await extractTitleFromMarkdown(markdown);

    // Supabase join can return array or object
    const existingEditorialMetadata = Array.isArray(workflow.editorial_records)
      ? workflow.editorial_records[0]?.metadata
      : (workflow.editorial_records as Record<string, unknown>)?.metadata;

    const ingestionMetadata = Array.isArray(workflow.ingestion_records)
      ? workflow.ingestion_records[0]?.metadata
      : (workflow.ingestion_records as Record<string, unknown>)?.metadata;

    const baseMetadata = (existingEditorialMetadata ||
      ingestionMetadata ||
      {}) as Record<string, unknown>;
    const updatedMetadata = {
      ...baseMetadata,
      title,
      "intitule-formation": title, // Sync for LHEO compatibility
    };

    let editorialRecordId: string;
    let isNew = false;

    if (workflow.editorial_record_id) {
      // Update existing editorial_record
      const { error: updateError } = await supabase
        .from("editorial_records")
        .update({
          markdown,
          metadata: updatedMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", workflow.editorial_record_id);

      if (updateError) {
        logger.error(updateError, "Error updating editorial_record");
        return { success: false, error: "Failed to update editorial record" };
      }

      editorialRecordId = workflow.editorial_record_id;
    } else {
      // Create new editorial_record - we need ingestion_record_id
      if (!workflow.ingestion_record_id) {
        return {
          success: false,
          error: "No ingestion record found for this workflow",
        };
      }

      const { data: newRecord, error: insertError } = await supabase
        .from("editorial_records")
        .insert({
          ingestion_record_id: workflow.ingestion_record_id,
          markdown,
          metadata: updatedMetadata,
        })
        .select("id")
        .single();

      if (insertError || !newRecord) {
        logger.error(insertError, "Error creating editorial_record");
        return { success: false, error: "Failed to create editorial record" };
      }

      editorialRecordId = newRecord.id;
      isNew = true;
    }

    // Ensure work_status is set to 'draft' after any save (doc-first)
    let progressUpdated = false;
    if (workflow.work_status !== "draft") {
      const { error: progressError } = await supabase
        .from("workflows")
        .update({ work_status: "draft" })
        .eq("id", workflowId);

      if (progressError) {
        logger.error(
          progressError,
          "Error updating workflow work_status to draft",
        );
      } else {
        progressUpdated = true;
      }
    }

    logger.info(
      { workflowId, editorialRecordId, isNew, progressUpdated, title },
      "Document saved successfully",
    );

    return {
      success: true,
      data: {
        editorialRecordId,
        isNew,
        progressUpdated,
        metadata: updatedMetadata,
      },
    };
  } catch (error) {
    logger.error(error, "Unexpected error in saveDocumentStep");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

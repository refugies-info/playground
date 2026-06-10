import { extractTitleFromMarkdown, logger } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";

/**
 * Result of saving a document.
 */
export interface SaveDocumentResult {
  editorialRecordId: string;
  progressUpdated: boolean;
  metadata: Record<string, unknown>;
}

/**
 * Saves an editorial document directly to Supabase.
 *
 * This function:
 * 1. Gets the workflow to retrieve the existing editorial_record (fails if absent)
 * 2. Extracts title from markdown and syncs it to metadata
 * 3. Updates the editorial_record with new content and metadata
 * 4. Ensures work_status is set to 'draft'
 *
 * @param workflowId - The workflow ID to save document for
 * @param markdown - The markdown content to save
 * @returns Result with editorial record ID and operation status
 */
export async function saveDocumentStep(
  workflowId: string,
  markdown: string,
  _userId: string,
): Promise<StepResult<SaveDocumentResult>> {
  try {
    const supabase = getSupabaseClient();

    // 1. Get the workflow and related records to get existing metadata
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select(
        `
        editorial_record_id,
        editorial_records (metadata, work_status),
        ingestion_records!status_ingestion_record_id_fkey (metadata)
      `,
      )
      .eq("id", workflowId)
      .single();

    if (workflowError || !workflow) {
      logger.error(workflowError, "Error fetching workflow for save");
      return { success: false, error: "Workflow not found" };
    }

    if (!workflow.editorial_record_id) {
      return {
        success: false,
        error: "No editorial record found for this workflow",
      };
    }

    // Supabase join can return array or object
    const editorialRecord = Array.isArray(workflow.editorial_records)
      ? workflow.editorial_records[0]
      : (workflow.editorial_records as {
          metadata: Record<string, unknown>;
          work_status: string;
        } | null);

    const existingEditorialMetadata = editorialRecord?.metadata;

    // Ingestion record metadata used as title fallback only
    const ingestionRecord = Array.isArray(workflow.ingestion_records)
      ? workflow.ingestion_records[0]
      : (workflow.ingestion_records as {
          metadata: Record<string, unknown>;
        } | null);
    const ingestionMetadata = ingestionRecord?.metadata;

    // 2. Extract title and prepare metadata
    const markdownTitle = await extractTitleFromMarkdown(markdown);
    const fallbackTitle =
      (existingEditorialMetadata?.title as string | undefined) ||
      (existingEditorialMetadata?.["intitule-formation"] as
        | string
        | undefined) ||
      (ingestionMetadata?.title as string | undefined) ||
      (ingestionMetadata?.["intitule-formation"] as string | undefined) ||
      "Sans titre";
    const title = markdownTitle || fallbackTitle;

    // Don't copy ingestion metadata - start fresh from editorial overrides
    const updatedMetadata = {
      ...(existingEditorialMetadata || {}),
      title,
      "intitule-formation": title, // Sync for LHEO compatibility
    };

    // 3. Update existing editorial_record
    // Also ensure work_status is set to 'draft' if not already
    const currentWorkStatus = editorialRecord?.work_status;
    const shouldUpdateStatus = currentWorkStatus !== "draft";

    const updatePayload: Record<string, unknown> = {
      markdown,
      metadata: updatedMetadata,
      updated_at: new Date().toISOString(),
    };

    if (shouldUpdateStatus) {
      updatePayload.work_status = "draft";
    }

    const { error: updateError } = await supabase
      .from("editorial_records")
      .update(updatePayload)
      .eq("id", workflow.editorial_record_id);

    if (updateError) {
      logger.error(updateError, "Error updating editorial_record");
      return { success: false, error: "Failed to update editorial record" };
    }

    logger.info(
      { workflowId, editorialRecordId: workflow.editorial_record_id, title },
      "Document saved successfully",
    );

    return {
      success: true,
      data: {
        editorialRecordId: workflow.editorial_record_id,
        progressUpdated: shouldUpdateStatus,
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

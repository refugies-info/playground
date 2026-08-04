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
 * Saves an editorial document directly to Supabase.
 *
 * This function:
 * 1. Gets the workflow to retrieve the existing editorial_record (fails if absent)
 * 2. Extracts title from markdown and syncs it to metadata
 * 3. Updates existing record or creates new one
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
        id, 
        editorial_record_id, 
        ingestion_record_id, 
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

    // 3. Update or create editorial_record
    // Also ensure work_status is set to 'draft' if not already

    let editorialRecordId: string;
    let isNew = false;
    let progressUpdated = false;

    if (workflow.editorial_record_id) {
      // Update existing editorial_record

      const updatePayload: Record<string, unknown> = {
        markdown,
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("editorial_records")
        .update(updatePayload)
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
      // New record starts as draft (metadata left to default)
      const { data: newRecord, error: insertError } = await supabase
        .from("editorial_records")
        .insert({
          ingestion_record_id: workflow.ingestion_record_id,
          markdown,
        })
        .select("id")
        .single();

      if (insertError || !newRecord) {
        logger.error(insertError, "Error creating editorial_record");
        return { success: false, error: "Failed to create editorial record" };
      }

      editorialRecordId = newRecord.id;
      isNew = true;
      progressUpdated = true; // Implicitly established status
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

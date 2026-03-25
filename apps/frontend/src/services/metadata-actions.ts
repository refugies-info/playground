"use server";

import { logger, validateField } from "@playground/shared-types";
import { createSupabaseServerClient, type Json } from "@playground/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyWorkflowPermission } from "./permission-helper";

// =============================================================================
// Helper: Get or Create Editorial Record
// =============================================================================

/**
 * Ensures an editorial_record exists for the given workflow.
 * - If editorial_record_id exists, returns it
 * - If not, creates a new editorial_record with the user as author
 * - Updates the workflow with the new editorial_record_id
 *
 * @param supabase - Supabase client
 * @param workflowId - The workflow ID
 * @param userId - The user ID (for author attribution)
 * @returns The editorial_record_id or an error response
 */
async function getOrCreateEditorialRecord(
  supabase: SupabaseClient,
  workflowId: string,
  userId: string,
): Promise<
  | { success: true; editorialRecordId: string }
  | { success: false; error: string }
> {
  // 1. Fetch workflow to get current editorial_record_id and ingestion_record_id
  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("editorial_record_id, ingestion_record_id")
    .eq("id", workflowId)
    .single();

  if (workflowError || !workflow) {
    logger.error(workflowError, "Error fetching workflow");
    return { success: false, error: "Workflow non trouvé" };
  }

  // 2. If editorial_record already exists, return it
  if (workflow.editorial_record_id) {
    return { success: true, editorialRecordId: workflow.editorial_record_id };
  }

  // 3. Need to create editorial_record — check ingestion_record exists
  if (!workflow.ingestion_record_id) {
    return {
      success: false,
      error: "Aucun enregistrement d'ingestion trouvé",
    };
  }

  logger.info({ workflowId }, "Creating missing editorial_record");

  // 4. Create editorial_record with user as author
  const { data: newRecord, error: createError } = await supabase
    .from("editorial_records")
    .insert({
      ingestion_record_id: workflow.ingestion_record_id,
      work_status: "draft",
      author_id: userId,
    })
    .select("id")
    .single();

  if (createError || !newRecord) {
    logger.error(createError, "Error creating editorial_record");
    return {
      success: false,
      error: "Erreur lors de la création de l'enregistrement éditorial",
    };
  }

  const editorialRecordId = newRecord.id;

  // 5. Update workflow with new editorial_record_id (with error handling)
  const { error: updateError } = await supabase
    .from("workflows")
    .update({ editorial_record_id: editorialRecordId })
    .eq("id", workflowId);

  if (updateError) {
    logger.error(
      { workflowId, editorialRecordId, error: updateError },
      "Failed to update workflow with new editorial_record_id — orphaned record created",
    );
    // Note: We still return the editorialRecordId because the record was created
    // The next request will find it via the workflow query (if the update eventually succeeds)
    // This is a recoverable state, but should be monitored
  }

  return { success: true, editorialRecordId };
}

/**
 * Save a single metadata field to the editorial_records table.
 * Uses RPC for partial JSONB update.
 *
 * @param workflowId - The workflow ID (documentId)
 * @param key - The metadata field key
 * @param value - The metadata field value
 * @returns { success: boolean; error?: string }
 */
export async function saveMetadataFieldAction(
  workflowId: string,
  key: string,
  value: unknown,
): Promise<{ success: boolean; error?: string }> {
  // 1. Validate input
  if (!workflowId || !key) {
    return { success: false, error: "Paramètres manquants" };
  }

  // 2. Validate field value with Zod
  const validation = validateField(key, value);
  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  // 3. Authenticate user
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    logger.error(userError, "Error getting user for metadata save");
    return { success: false, error: "Utilisateur non authentifié" };
  }

  // 4. Verify permission
  const hasPermission = await verifyWorkflowPermission(
    supabase,
    workflowId,
    user.id,
    user.user_metadata?.role,
  );

  if (!hasPermission) {
    logger.warn(
      { userId: user.id, workflowId },
      "Unauthorized attempt to modify metadata",
    );
    return {
      success: false,
      error: "Vous n'avez pas la permission de modifier ce document",
    };
  }

  // 5. Ensure editorial_record exists
  const recordResult = await getOrCreateEditorialRecord(
    supabase,
    workflowId,
    user.id,
  );

  if (!recordResult.success) {
    return { success: false, error: recordResult.error };
  }

  const editorialRecordId = recordResult.editorialRecordId;

  // 6. Use RPC to update only the specific key
  // Distinguish between null (explicit clear) and undefined (delete key)
  const shouldDeleteKey = value === undefined;
  const jsonValue = value === undefined ? null : (value as Json);

  const { error: rpcError } = await supabase.rpc("update_metadata_field", {
    record_id: editorialRecordId,
    field_key: key,
    field_value: jsonValue,
    delete_key: shouldDeleteKey,
  });

  if (rpcError) {
    logger.error(rpcError, "Error saving metadata via RPC");
    return { success: false, error: "Erreur lors de la sauvegarde" };
  }

  // 6. Revalidate the metadata page
  revalidatePath(`/documents/${workflowId}/metadata`);

  logger.info({ workflowId, key }, "Metadata field saved successfully");

  return { success: true };
}

/**
 * Save multiple metadata fields at once.
 *
 * @param workflowId - The workflow ID (documentId)
 * @param fields - Object with key-value pairs to save
 * @returns { success: boolean; error?: string }
 */
export async function saveMetadataFieldsAction(
  workflowId: string,
  fields: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  // 1. Validate input
  if (!workflowId || !fields || Object.keys(fields).length === 0) {
    return { success: false, error: "Paramètres manquants" };
  }

  // 2. Validate all field values
  for (const [key, value] of Object.entries(fields)) {
    const validation = validateField(key, value);
    if (!validation.success) {
      return { success: false, error: `${key}: ${validation.error}` };
    }
  }

  // 3. Authenticate user
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    logger.error(userError, "Error getting user for metadata save");
    return { success: false, error: "Utilisateur non authentifié" };
  }

  // 4. Verify permission
  const hasPermission = await verifyWorkflowPermission(
    supabase,
    workflowId,
    user.id,
    user.user_metadata?.role,
  );

  if (!hasPermission) {
    logger.warn(
      { userId: user.id, workflowId },
      "Unauthorized attempt to modify metadata",
    );
    return {
      success: false,
      error: "Vous n'avez pas la permission de modifier ce document",
    };
  }

  // 5. Ensure editorial_record exists
  const recordResult = await getOrCreateEditorialRecord(
    supabase,
    workflowId,
    user.id,
  );

  if (!recordResult.success) {
    return { success: false, error: recordResult.error };
  }

  const editorialRecordId = recordResult.editorialRecordId;

  // 6. Save each field via RPC
  for (const [key, value] of Object.entries(fields)) {
    const jsonValue =
      value === undefined || value === null ? null : (value as Json);

    const { error: rpcError } = await supabase.rpc("update_metadata_field", {
      record_id: editorialRecordId,
      field_key: key,
      field_value: jsonValue,
    });

    if (rpcError) {
      logger.error(rpcError, "Error saving metadata via RPC");
      return {
        success: false,
        error: `Erreur lors de la sauvegarde de ${key}`,
      };
    }
  }

  // 6. Revalidate
  revalidatePath(`/documents/${workflowId}/metadata`);

  logger.info(
    { workflowId, fields: Object.keys(fields) },
    "Metadata fields saved successfully",
  );

  return { success: true };
}

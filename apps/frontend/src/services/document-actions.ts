"use server";

import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { buildPublishPayload } from "../lib/payload-builder";

export async function saveDocument(
  workflowId: string,
  markdown: string,
): Promise<{ success: boolean; error?: string }> {
  // Cookies are required here to forward the user's session to Supabase
  // This ensures the action is performed by the authenticated user
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  try {
    // First, get the workflow to check for existing editorial_record and get progress
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select(
        `
        id,
        editorial_record_id,
        ingestion_record_id,
        progress
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

    // If the document was published, set progress to 'modified'
    // This indicates the document has local changes not yet republished
    if (workflow.progress === "published") {
      const { error: progressError } = await supabase
        .from("workflows")
        .update({ progress: "modified" })
        .eq("id", workflowId);

      if (progressError) {
        logger.error(
          progressError,
          "Error updating workflow progress to modified",
        );
        // Don't fail the save operation for this
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

/**
 * Server action to publish a document to refugies.info via webhook
 * 1. Gets authenticated user email
 * 2. Calls the publication webhook
 * 3. Stores the publication record
 * 4. Updates workflow progress to 'published'
 */

export async function publishDocument(
  workflowId: string,
  title: string,
  markdown: string,
  metadata?: Record<string, unknown>,
): Promise<{
  success: boolean;
  publicationId?: string;
  remoteId?: string;
  isUpdate?: boolean;
  publishedUrl?: string;
  error?: string;
}> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  try {
    // 1. Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      logger.error(userError, "Error getting user for publication");
      return { success: false, error: "Utilisateur non authentifié" };
    }

    // 2. Get webhook configuration (Simplified)
    const baseUrl = process.env.RI_BASE_URL;
    const webhookSecret = process.env.RI_WEBHOOK_SECRET;

    if (!baseUrl || !webhookSecret) {
      logger.error(
        "Missing publication configuration (RI_BASE_URL or RI_WEBHOOK_SECRET)",
      );
      return {
        success: false,
        error: "Configuration de publication manquante",
      };
    }

    // Construct the full webhook URL
    // Remove trailing slash if present to avoid double slashes
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const webhookUrl = `${cleanBaseUrl}/api/webhook/dispositif`;

    // 3. Check for existing publication (to determine CREATE vs UPDATE)
    // Fetch workflow to get the current publication_record_id
    const { data: workflow } = await supabase
      .from("workflows")
      .select("publication_record_id")
      .eq("id", workflowId)
      .single();

    let existingPublication = null;
    const publicationRecordId = workflow?.publication_record_id;

    if (publicationRecordId) {
      const { data: pubRecord } = await supabase
        .from("publication_records")
        .select("id, remote_id, target")
        .eq("id", publicationRecordId)
        .single();

      // Only consider it an update if the target matches
      if (pubRecord && pubRecord.target === cleanBaseUrl) {
        existingPublication = pubRecord;
      }
    }

    const existingRemoteId = existingPublication?.remote_id;
    const isUpdate = !!existingRemoteId;

    // 4. Build the payload using shared builder
    const basePayload = buildPublishPayload(
      {
        title,
        editorialContent: markdown,
        metadata,
      },
      user.email,
    );

    // If updating, include the remote_id as _id so the webhook updates instead of creates
    const payload = isUpdate
      ? {
          ...basePayload,
          dispositif: {
            ...basePayload.dispositif,
            _id: existingRemoteId,
          },
        }
      : basePayload;

    // 5. Call the webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "webhook-secret": webhookSecret,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error(
        { status: response.status, error: errorData },
        "Publication webhook failed",
      );
      return {
        success: false,
        error: errorData.message || `Erreur ${response.status}`,
      };
    }

    const result = await response.json();
    const remoteId = result.id;

    if (!remoteId) {
      logger.error(result, "Publication webhook did not return an ID");
      return { success: false, error: "ID de publication non reçu" };
    }

    // 6. Store or update publication record
    if (isUpdate && existingPublication) {
      // Update the existing record's updated_at and payload
      const { error: updateRecordError } = await supabase
        .from("publication_records")
        .update({
          updated_at: new Date().toISOString(),
          // biome-ignore lint/suspicious/noExplicitAny: Payload structure is complex but valid JSON
          payload: payload as any,
          published_by: user.id,
        })
        .eq("id", existingPublication.id);

      if (updateRecordError) {
        logger.error(updateRecordError, "Error updating publication record");
      }
    } else {
      // Create new publication record
      // Note: we don't store workflow_id in publication_records anymore
      const { data: newRecord, error: insertError } = await supabase
        .from("publication_records")
        .insert({
          target: cleanBaseUrl,
          remote_id: remoteId,
          status: "published",
          // biome-ignore lint/suspicious/noExplicitAny: Payload structure is complex but valid JSON
          payload: payload as any,
          published_by: user.id,
        })
        .select("id")
        .single();

      if (insertError) {
        logger.error(insertError, "Error storing publication record");
      } else if (newRecord) {
        // Link the new publication record to the workflow
        const { error: linkError } = await supabase
          .from("workflows")
          .update({
            publication_record_id: newRecord.id,
          })
          .eq("id", workflowId);

        if (linkError) {
          logger.error(
            linkError,
            "Error linking publication record to workflow",
          );
        }
      }
    }

    // 7. Update workflow progress
    const { error: updateError } = await supabase
      .from("workflows")
      .update({ progress: "published" })
      .eq("id", workflowId);

    if (updateError) {
      logger.error(updateError, "Error updating workflow progress");
    }

    return {
      success: true,
      publicationId:
        isUpdate && existingPublication
          ? existingPublication.id
          : (result as any).id, // Using result ID if available, otherwise just success
      remoteId,
      isUpdate,
      publishedUrl: `${cleanBaseUrl}/dispositif/${remoteId}`,
    };
  } catch (error) {
    logger.error(error, "Unexpected error publishing document");
    return {
      success: false,
      error: "Erreur inattendue lors de la publication",
    };
  }
}

/**
 * Server action to archive a document
 * 1. Checks if document was previously published
 * 2. Calls webhook with status 'Archivé'
 * 3. Updates record and workflow status
 */
export async function archiveDocument(
  workflowId: string,
  title: string,
  markdown: string,
  metadata?: Record<string, unknown>,
): Promise<{
  success: boolean;
  error?: string;
}> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  try {
    // 1. Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    // 2. Get webhook config
    const baseUrl = process.env.RI_BASE_URL;
    const webhookSecret = process.env.RI_WEBHOOK_SECRET;

    if (!baseUrl || !webhookSecret) {
      return { success: false, error: "Configuration serveur manquante" };
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const webhookUrl = `${cleanBaseUrl}/api/webhook/dispositif`;

    // 3. Find existing publication (MUST exist to archive)
    const { data: workflow } = await supabase
      .from("workflows")
      .select("publication_record_id")
      .eq("id", workflowId)
      .single();

    const publicationRecordId = workflow?.publication_record_id;

    if (!publicationRecordId) {
      return {
        success: false,
        error: "Document jamais publié (pas d'enregistrement)",
      };
    }

    const { data: existingPublication } = await supabase
      .from("publication_records")
      .select("id, remote_id, target")
      .eq("id", publicationRecordId)
      .single();

    if (!existingPublication || existingPublication.target !== cleanBaseUrl) {
      return {
        success: false,
        error: "Document jamais publié (cible incorrecte)",
      };
    }

    const remoteId = existingPublication.remote_id;

    // 4. Build payload with status 'Archivé'
    const payload = buildPublishPayload(
      {
        title,
        editorialContent: markdown,
        metadata,
      },
      user.email,
      "Archivé", // Override status
    );

    // Include _id for update
    const updatePayload = {
      ...payload,
      dispositif: {
        ...payload.dispositif,
        _id: remoteId,
      },
    };

    // 5. Call webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "webhook-secret": webhookSecret,
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error(
        { status: response.status, error: errorData },
        "Archive webhook failed",
      );
      return {
        success: false,
        error: errorData.message || `Erreur ${response.status}`,
      };
    }

    // 6. Update existing publication record to archived status
    await supabase
      .from("publication_records")
      .update({
        status: "archived",
        // biome-ignore lint/suspicious/noExplicitAny: Payload structure is complex but valid JSON
        payload: updatePayload as any,
        published_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingPublication.id);

    // 7. Update workflow status to 'archived'
    await supabase
      .from("workflows")
      .update({ progress: "archived" })
      .eq("id", workflowId);

    return { success: true };
  } catch (error) {
    logger.error(error, "Error archiving document");
    return { success: false, error: "Erreur interne" };
  }
}

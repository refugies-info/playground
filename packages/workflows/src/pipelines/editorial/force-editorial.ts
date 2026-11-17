/**
 * @file pipelines/editorial/force-editorial.ts
 *
 * Workflow for AI-powered content rewrite of a single document.
 * Replaces the old SSE-based streaming route with a durable workflow.
 *
 * The step handles: conversation management, Letta agent call, persistence.
 *
 * ## Return value
 *
 * On retourne uniquement `{ content }` — le résultat minimal pour le client.
 * `persistResult` est intentionnellement omis : il est déjà persisté en base
 * par le step (letta_reports + editorial_records) et sa structure complexe
 * (champs optionnels, objets imbriqués) cause des erreurs de validation
 * dans le SDK Vercel Workflow au moment de désérialiser `run.returnValue`.
 */

import {
  forceEditorialStep,
  notifyClearLanguageErrorStep,
} from "../../steps/editorial/force-editorial-step";

export interface ForceEditorialWorkflowResult {
  content: string;
}

export async function forceEditorialWorkflow(
  workflowId: string,
  userId: string,
  model?: string,
): Promise<ForceEditorialWorkflowResult> {
  "use workflow";

  try {
    const { content } = await forceEditorialStep(workflowId, userId, model);
    return { content };
  } catch (error) {
    await notifyClearLanguageErrorStep(
      workflowId,
      userId,
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}

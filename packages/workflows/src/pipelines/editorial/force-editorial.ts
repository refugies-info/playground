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

import { forceEditorialStep } from "../../steps/editorial/force-editorial-step";

export interface ForceEditorialWorkflowResult {
  content: string;
}

export async function forceEditorialWorkflow(
  workflowId: string,
  userId: string,
): Promise<ForceEditorialWorkflowResult> {
  "use workflow";

  const { content } = await forceEditorialStep(workflowId, userId);
  return { content };
}

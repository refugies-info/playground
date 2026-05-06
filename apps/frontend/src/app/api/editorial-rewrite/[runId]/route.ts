/**
 * GET & DELETE /api/editorial-rewrite/[runId]
 *
 * Gère le cycle de vie d'un Vercel Workflow de réécriture IA.
 *
 * ## GET — Attendre le résultat
 *
 * ```
 * Client (AIFloatingButton)
 *   │
 *   ├─ GET /api/editorial-rewrite/[runId]
 *   │    ├─ getRun(runId).returnValue          ← bloque jusqu'à complétion
 *   │    │   ├─ Workflow en cours → attend (jusqu'à maxDuration=300s)
 *   │    │   └─ Workflow terminé → résout immédiatement
 *   │    ├─ return { content }                 ← succès
 *   │    │
 *   │    └─ catch (run expiré / erreur)
 *   │         ├─ getContentFromLettaReports()  ← fallback DB
 *   │         │   └─ editorial_records → workflows → letta_reports (report_type=editorial)
 *   │         ├─ Si contenu trouvé → return { content }
 *   │         └─ Sinon → clearActiveRunId() + return 500
 *   │
 *   └─ Note : active_run_id n'est PAS nettoyé ici.
 *        L'utilisateur n'a pas encore accepté/rejeté.
 *        Le cleanup se fait via DELETE (accept, reject, cancel).
 * ```
 *
 * ## DELETE — Annuler / Nettoyer
 *
 * ```
 * Client (handleCancel, handleAccept, handleReject)
 *   │
 *   ├─ DELETE /api/editorial-rewrite/[runId]
 *   │    ├─ getRun(runId).cancel()             ← no-op si déjà terminé
 *   │    ├─ clearActiveRunId(runId)            ← UPDATE editorial_records SET active_run_id = NULL
 *   │    └─ return { success: true }
 * ```
 *
 * ## Cycle de vie de active_run_id
 *
 * ```
 * POST (start)        → active_run_id = runId     ← écrit
 * GET  (résultat)     → active_run_id inchangé    ← préservé (user n'a pas décidé)
 * Refresh             → activeRunId lu par layout  ← reprise automatique via GET
 * DELETE (accept)     → active_run_id = NULL       ← nettoyé
 * DELETE (reject)     → active_run_id = NULL       ← nettoyé
 * DELETE (cancel)     → active_run_id = NULL       ← nettoyé
 * GET    (erreur)     → active_run_id = NULL       ← nettoyé (pas de contenu à reprendre)
 * ```
 */

import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import type { ForceEditorialWorkflowResult } from "@playground/workflows";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getRun } from "workflow/api";
import { getUserProfile } from "@/lib/auth";
import { verifyWorkflowPermission } from "@/services/permission-helper";

// Couvre les appels Letta les plus longs (1-3 min typiquement).
export const maxDuration = 300;

type RouteParams = { params: Promise<{ runId: string }> };

/**
 * Crée un client Supabase pour ce handler.
 * Factorisé pour éviter de recréer le client dans chaque helper.
 */
async function getSupabase() {
  const cookieStore = await cookies();
  return createSupabaseServerClient(cookieStore);
}

/**
 * Vérifie l'auth + la permission d'accès au workflow associé à ce runId.
 *
 * Le `runId` n'est pas un secret cryptographique — sans ce check, n'importe
 * quel utilisateur authentifié pourrait lire (GET) ou annuler (DELETE) la
 * réécriture IA d'un document auquel il n'a pas accès.
 *
 * Retourne `{ ok: true, supabase }` si autorisé, sinon une `NextResponse`
 * d'erreur (401 / 403 / 404) à retourner directement.
 */
async function authorizeRunId(
  runId: string,
): Promise<
  | { ok: true; supabase: Awaited<ReturnType<typeof getSupabase>> }
  | { ok: false; response: NextResponse }
> {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 },
      ),
    };
  }

  // Trouver le workflow_id via l'editorial_record qui a ce active_run_id.
  const { data: record } = await supabase
    .from("editorial_records")
    .select("id")
    .eq("active_run_id", runId)
    .maybeSingle();

  if (!record) {
    // Pas d'editorial_record actif pour ce runId — soit déjà nettoyé,
    // soit runId invalide. On répond 404 pour ne pas leaker.
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Run introuvable ou déjà nettoyé" },
        { status: 404 },
      ),
    };
  }

  const { data: workflow } = await supabase
    .from("workflows")
    .select("id")
    .eq("editorial_record_id", record.id)
    .maybeSingle();

  if (!workflow) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Workflow introuvable" },
        { status: 404 },
      ),
    };
  }

  const profile = await getUserProfile(supabase, user.id);
  const hasPermission = await verifyWorkflowPermission(
    supabase,
    workflow.id,
    user.id,
    profile?.role ?? undefined,
  );

  if (!hasPermission) {
    logger.warn(
      { userId: user.id, runId, workflowId: workflow.id },
      "[editorial-rewrite] Unauthorized access to runId",
    );
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Vous n'avez pas la permission d'accéder à ce run" },
        { status: 403 },
      ),
    };
  }

  return { ok: true, supabase };
}

/**
 * Nettoie le active_run_id en base (fire-and-forget).
 * Utilise `eq('active_run_id', runId)` plutôt qu'un ID spécifique
 * pour ne pas avoir besoin de connaître l'editorial_record_id.
 */
async function clearActiveRunId(runId: string) {
  try {
    const supabase = await getSupabase();
    await supabase
      .from("editorial_records")
      .update({ active_run_id: null })
      .eq("active_run_id", runId);
  } catch {
    // Non-bloquant — le cleanup est best-effort.
  }
}

/**
 * Fallback : lit le contenu depuis letta_reports quand run.returnValue a expiré.
 *
 * ⚠️ Risque : sans filtre temporel, on retournerait le DERNIER rapport éditorial
 * complet du workflow — qui peut être très ancien (généré il y a des semaines)
 * et n'a aucun rapport avec le run en cours. L'éditeur verrait alors un contenu
 * obsolète présenté comme un nouveau résultat.
 *
 * Stratégie : on filtre les rapports par `created_at >= editorial_records.updated_at`,
 * `updated_at` ayant été touché par le POST au moment de l'écriture d'`active_run_id`.
 * Filet de sécurité supplémentaire : fenêtre absolue de 30 min (largement plus que
 * `maxDuration=300s`).
 */
const MAX_FALLBACK_AGE_MS = 30 * 60 * 1000; // 30 min

async function getContentFromLettaReports(
  runId: string,
): Promise<string | null> {
  try {
    const supabase = await getSupabase();

    // Trouver le workflow_id via l'editorial_record qui a ce active_run_id
    const { data: record } = await supabase
      .from("editorial_records")
      .select("id, ingestion_record_id, updated_at")
      .eq("active_run_id", runId)
      .maybeSingle();

    if (!record) return null;

    // Trouver le workflow_id via la FK inverse
    const { data: workflow } = await supabase
      .from("workflows")
      .select("id")
      .eq("editorial_record_id", record.id)
      .maybeSingle();

    if (!workflow) return null;

    // Borne basse : le run a démarré au moment de l'écriture d'active_run_id
    // (= editorial_records.updated_at). On accepte une légère marge (1 min)
    // pour couvrir l'ordre INSERT-vs-UPDATE des réplications Postgres.
    const runStartedAt = record.updated_at
      ? new Date(record.updated_at).getTime() - 60_000
      : Date.now() - MAX_FALLBACK_AGE_MS;

    // Filet de sécurité : pas plus vieux que MAX_FALLBACK_AGE_MS
    const minTimestamp = Math.max(
      runStartedAt,
      Date.now() - MAX_FALLBACK_AGE_MS,
    );

    // Lire le dernier rapport éditorial complet généré APRÈS le démarrage du run
    const { data: report } = await supabase
      .from("letta_reports")
      .select("markdown, created_at")
      .eq("workflow_id", workflow.id)
      .eq("report_type", "editorial")
      .eq("status", "complete")
      .gte("created_at", new Date(minTimestamp).toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!report) {
      logger.warn(
        { runId, workflowId: workflow.id, minTimestamp },
        "[editorial-rewrite] No recent letta_report — refusing stale fallback",
      );
      return null;
    }

    return report.markdown;
  } catch {
    return null;
  }
}

/**
 * GET /api/editorial-rewrite/[runId]
 *
 * Attend la complétion du workflow via run.returnValue.
 * Si le run a expiré (utilisateur revient le lendemain), fallback sur letta_reports.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { runId } = await params;

  if (!runId) {
    return NextResponse.json({ error: "runId manquant" }, { status: 400 });
  }

  const auth = await authorizeRunId(runId);
  if (!auth.ok) return auth.response;

  try {
    logger.info({ runId }, "[editorial-rewrite] Awaiting returnValue");

    const run = getRun<ForceEditorialWorkflowResult>(runId);
    const { content } = await run.returnValue;

    logger.info(
      { runId, contentLength: content.length },
      "[editorial-rewrite] Completed",
    );

    // On ne nettoie PAS active_run_id ici — l'utilisateur n'a pas encore
    // accepté ou rejeté la suggestion. Le cleanup se fait via DELETE
    // (cancel, accept, reject côté client).
    return NextResponse.json({ content });
  } catch (err) {
    // Fallback : le run a peut-être expiré côté Vercel,
    // mais le workflow a terminé et le contenu est dans letta_reports.
    logger.warn(
      { runId },
      "[editorial-rewrite] run.returnValue failed — trying letta_reports fallback",
    );

    const fallbackContent = await getContentFromLettaReports(runId);
    if (fallbackContent) {
      logger.info(
        { runId },
        "[editorial-rewrite] Recovered content from letta_reports",
      );
      return NextResponse.json({ content: fallbackContent });
    }

    const rawMessage = err instanceof Error ? err.message : String(err);
    logger.error({ runId, rawMessage }, "[editorial-rewrite] Workflow failed");

    await clearActiveRunId(runId);

    // Message structuré pour que l'éditorial puisse copier/coller au support.
    const userMessage = [
      "L'IA n'a pas pu améliorer le document.",
      "",
      `Erreur : ${rawMessage}`,
      `Run : ${runId}`,
      `Date : ${new Date().toISOString()}`,
    ].join("\n");

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/editorial-rewrite/[runId]
 *
 * Annule le Vercel Workflow via run.cancel().
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { runId } = await params;

  if (!runId) {
    return NextResponse.json({ error: "runId manquant" }, { status: 400 });
  }

  const auth = await authorizeRunId(runId);
  if (!auth.ok) return auth.response;

  try {
    const run = getRun(runId);
    await run.cancel();
    logger.info({ runId }, "[editorial-rewrite] Workflow cancelled");
  } catch (err) {
    // Le workflow est peut-être déjà terminé — pas bloquant.
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    logger.warn(
      { runId, message },
      "[editorial-rewrite] Cancel failed (non-blocking)",
    );
  }

  await clearActiveRunId(runId);
  return NextResponse.json({ success: true });
}

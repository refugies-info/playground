/**
 * POST /api/agents/metadata/stream
 *
 * Génère un rapport de métadonnées via l'agent Letta et le diffuse en SSE.
 *
 * ## Sécurité
 *
 * Cette route consomme des crédits IA et écrit un rapport en base : elle exige
 * donc une session valide **et** la permission d'écrire sur le workflow visé,
 * comme les routes `editorial-rewrite`. L'ancienne version ouvrait une
 * génération à tout appelant anonyme.
 *
 * ## Flux
 *
 * ```
 * Client
 *   │
 *   ├─ POST /api/agents/metadata/stream { flowId, content }
 *   │    ├─ Auth (getCurrentUser → getSupabaseAdmin → verifyWorkflowPermission)
 *   │    ├─ resolveMetadataContext(flowId)   ← conversation_id + métadonnées à hydrater
 *   │    ├─ generateMetadataReport(...)      ← streaming Letta
 *   │    ├─ accumulate + diffuser chaque fragment en SSE
 *   │    └─ start(persistMetadataWorkflow, [flowId, agentId, contenu complet, usage])
 *   │
 *   └─ ← text/event-stream, terminé par `data: [DONE]` ou `data: {"type":"error"}`
 * ```
 *
 * ## Réponses
 *
 * | Code | Body                  | Cause                                  |
 * |------|-----------------------|----------------------------------------|
 * | 200  | flux SSE              | Génération démarrée                    |
 * | 400  | `{ error }`           | Body invalide                          |
 * | 401  | `{ error }`           | Absence de session valide              |
 * | 503  | `{ error }`           | Supabase injoignable (pas un défaut d'auth) |
 * | 403  | `{ error }`           | Permission refusée sur ce workflow     |
 * | 404  | `{ error }`           | Workflow ou conversation introuvable   |
 * | 500  | `{ error }`           | Configuration serveur incomplète       |
 *
 * ## Contrat du flux
 *
 * - Les fragments `assistant_message` sont diffusés **au fil de l'eau**.
 * - Le contenu **persisté** est la concaténation complète de ces fragments.
 * - Une erreur de streaming ou de persistance émet un événement `error`
 *   **avant** `[DONE]`, afin que le client ne puisse pas confondre une
 *   génération perdue avec une génération réussie.
 */

import {
  accumulateUsage,
  createLettaClient,
  generateMetadataReport,
  type LettaUsage,
} from "@playground/agents";
import { logger } from "@playground/shared-types";
import {
  createSupabaseServerClient,
  getSupabaseAdmin,
} from "@playground/supabase";
import { persistMetadataWorkflow } from "@playground/workflows";
import { start } from "@workflow/core/runtime";
import matter from "gray-matter";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getRedirectPath } from "@/lib/errors";
import { verifyWorkflowPermission } from "@/services/permission-helper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Request body schema for the metadata stream endpoint.
 * Expects markdown with frontmatter containing metadata from previous phases.
 *
 * flowId is required to link the generated report to the editorial record.
 */
const requestBodySchema = z.object({
  flowId: z.string().uuid(),
  content: z.string().min(1, "Markdown content cannot be empty"),
});

interface MetadataContext {
  conversationId: string;
  /** Markdown injecté dans le message envoyé à l'agent. */
  fullContent: string;
}

/**
 * Charge la conversation et les métadonnées nécessaires à la génération.
 *
 * Priorité des métadonnées : `editorial_records` > `ingestion_records`.
 * Une erreur de lecture n'est pas bloquante : on retombe sur le contenu reçu.
 */
async function resolveMetadataContext(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  flowId: string,
  content: string,
): Promise<MetadataContext | null> {
  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("conversation_id, editorial_record_id, ingestion_record_id")
    .eq("id", flowId)
    .single();

  if (workflowError || !workflow?.conversation_id) {
    logger.error(
      { error: workflowError, flowId },
      "Workflow not found or missing conversation_id",
    );
    return null;
  }

  let metadata: Record<string, unknown> | null = null;

  if (workflow.editorial_record_id) {
    const { data: record, error: recordError } = await supabase
      .from("editorial_records")
      .select("metadata")
      .eq("id", workflow.editorial_record_id)
      .single();

    if (
      !recordError &&
      record?.metadata &&
      typeof record.metadata === "object"
    ) {
      metadata = record.metadata as Record<string, unknown>;
    } else {
      logger.warn(
        { error: recordError, editorialRecordId: workflow.editorial_record_id },
        "Could not fetch metadata from editorial_record",
      );
    }
  }

  if (!metadata && workflow.ingestion_record_id) {
    const { data: record, error: recordError } = await supabase
      .from("ingestion_records")
      .select("metadata")
      .eq("id", workflow.ingestion_record_id)
      .single();

    if (
      !recordError &&
      record?.metadata &&
      typeof record.metadata === "object"
    ) {
      metadata = record.metadata as Record<string, unknown>;
    } else {
      logger.warn(
        { error: recordError, ingestionRecordId: workflow.ingestion_record_id },
        "Could not fetch metadata from ingestion_record",
      );
    }
  }

  return {
    conversationId: workflow.conversation_id,
    fullContent: metadata ? matter.stringify(content, metadata) : content,
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (_) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const parseResult = requestBodySchema.safeParse(body);
  if (!parseResult.success) {
    return new Response(
      JSON.stringify({
        error: "Validation error",
        details: parseResult.error.flatten(),
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { flowId, content } = parseResult.data;

  // ─── 1. Authentification ──────────────────────────────────────────────────
  // `getCurrentUser` redirige vers `/login` (absence de session) ou vers
  // `/service-unavailable` (Supabase injoignable, profil illisible). Une
  // redirection n'a pas de sens dans un route handler : elle lève une
  // exception qu'il faut interpréter explicitement.
  //
  // Les deux cas ne doivent PAS être confondus : présenter une panne
  // d'infrastructure comme un défaut d'authentification ferait perdre du temps
  // au diagnostic et fausserait la supervision.
  const cookieStore = await cookies();
  const supabaseServer = createSupabaseServerClient(cookieStore);

  let currentUser: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    currentUser = await getCurrentUser();
  } catch (error) {
    const redirectPath = getRedirectPath(error);

    if (redirectPath === "/service-unavailable") {
      logger.error(
        { error, flowId },
        "[metadata/stream] Auth backend unavailable",
      );
      return new Response(JSON.stringify({ error: "Service indisponible" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Redirection vers /login, ou échec inattendu : traité comme une absence
    // de session valide.
    logger.warn(
      { error, flowId, redirectPath },
      "[metadata/stream] Unauthenticated",
    );
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ─── 2. Autorisation sur ce workflow ──────────────────────────────────────
  const hasPermission = await verifyWorkflowPermission(
    supabaseServer,
    flowId,
    currentUser.id,
    currentUser.role ?? undefined,
  );

  if (!hasPermission) {
    logger.warn(
      { userId: currentUser.id, flowId },
      "[metadata/stream] Unauthorized",
    );
    return new Response(
      JSON.stringify({
        error: "Vous n'avez pas la permission de modifier ce document",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  const agentId = process.env.PLAYGROUND_AGENT_ID;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!agentId || !url || !key) {
    logger.error(
      { missingAgentId: !agentId, missingUrl: !url, missingKey: !key },
      "Metadata Agent Stream configuration error",
    );
    return new Response("Server configuration error", { status: 500 });
  }

  // ─── 3. Contexte du workflow ──────────────────────────────────────────────
  const supabase = getSupabaseAdmin(url, key);
  const context = await resolveMetadataContext(supabase, flowId, content);

  if (!context) {
    return new Response(
      JSON.stringify({ error: "Workflow or conversation not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
        );
      };

      // Le contenu persisté est la concaténation de TOUS les fragments : ne
      // jamais écraser avec le dernier reçu (bug corrigé ici).
      const accumulatedParts: string[] = [];
      const usage: LettaUsage = {};

      try {
        const client = createLettaClient();

        for await (const chunk of generateMetadataReport(
          client,
          context.fullContent,
          context.conversationId,
        )) {
          accumulateUsage(usage, chunk);

          if (
            chunk.message_type === "assistant_message" &&
            typeof chunk.content === "string"
          ) {
            accumulatedParts.push(chunk.content);
          }

          // Diffusion progressive : le client reçoit chaque fragment tel quel.
          send(chunk);
        }

        const accumulated = accumulatedParts.join("");

        if (!accumulated) {
          send({
            type: "error",
            message: "Aucun contenu généré — le rapport n'a pas été enregistré",
          });
          controller.close();
          return;
        }

        // La persistance doit réussir avant d'annoncer la fin du flux : sinon un
        // échec silencieux laisserait le client croire au succès.
        try {
          await start(persistMetadataWorkflow, [
            flowId,
            agentId,
            accumulated,
            usage,
          ]);
          logger.info({ flowId }, "Triggered persistMetadataWorkflow");
        } catch (persistError) {
          logger.error(
            { error: persistError, flowId },
            "Failed to trigger persistMetadataWorkflow",
          );
          send({
            type: "error",
            message: "Le rapport a été généré mais n'a pas pu être enregistré",
          });
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        logger.error({ error, flowId }, "Error in metadata agent stream");
        send({
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

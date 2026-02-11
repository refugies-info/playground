import {
  createLettaClient,
  generateIngestionReport,
  parseIngestionResponse,
} from "@playground/agents";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin, type Json } from "@playground/supabase";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }

  return getSupabaseAdmin(url, key);
}

const TARGET_TOTAL = 50;

export async function calculateNeededAuditsStep() {
  "use step";
  const supabase = getSupabaseClient();

  const { count, error } = await supabase
    .from("ingestion_records")
    .select("*", { count: "exact", head: true })
    .not("ingestion_report_id", "is", null);

  if (error) {
    throw new Error(`Failed to count audited records: ${error.message}`);
  }

  const currentCount = count || 0;
  const needed = Math.max(0, TARGET_TOTAL - currentCount);

  logger.info(
    { currentCount, target: TARGET_TOTAL, needed },
    "Conformity audit status",
  );

  return { currentCount, target: TARGET_TOTAL, needed };
}

export async function runConformityAuditStep(needed: number) {
  "use step";

  if (needed <= 0) {
    logger.info("No audits needed to reach target.");
    return { succeeded: 0, failed: 0, needed };
  }

  const supabase = getSupabaseClient();

  // Fetch ingestion records without reports
  const { data: targets, error: fetchError } = await supabase
    .from("ingestion_records")
    .select("id, markdown")
    .is("ingestion_report_id", null)
    .limit(needed);

  if (fetchError) {
    throw new Error(`Failed to fetch ingestion records: ${fetchError.message}`);
  }

  if (!targets || targets.length === 0) {
    logger.info("No ingestion records available for auditing.");
    return { succeeded: 0, failed: 0, needed };
  }

  const agentId = process.env.PLAYGROUND_AGENT_ID;
  if (!agentId) {
    throw new Error("PLAYGROUND_AGENT_ID is not defined");
  }

  const lettaClient = createLettaClient();
  const conversation = await lettaClient.conversations.create({
    agent_id: agentId,
  });
  const conversationId = conversation.id;

  let succeeded = 0;
  let failed = 0;

  for (const target of targets) {
    let finalContent = "";
    try {
      for await (const chunk of generateIngestionReport(
        lettaClient,
        target.markdown,
        conversationId,
      )) {
        if (chunk.message_type === "assistant_message") {
          finalContent += chunk.content;
        }
      }

      if (!finalContent) {
        throw new Error("No assistant response received");
      }

      const parsed = parseIngestionResponse(finalContent, agentId);

      const { data: report, error: reportError } = await supabase
        .from("letta_reports")
        .insert({
          agent_id: agentId,
          report_type: "ingestion",
          markdown: parsed.content,
          metadata: parsed.metadata as Json,
          status: parsed.status,
          raw_response: parsed.rawResponse ?? null,
        })
        .select("id")
        .single();

      if (reportError || !report) {
        throw new Error(`Failed to insert report: ${reportError?.message}`);
      }

      const { error: updateError } = await supabase
        .from("ingestion_records")
        .update({ ingestion_report_id: report.id })
        .eq("id", target.id);

      if (updateError) {
        throw new Error(`Failed to link report: ${updateError.message}`);
      }

      succeeded += 1;
    } catch (error) {
      failed += 1;
      logger.error({ error, targetId: target.id }, "Error auditing record");
    }
  }

  return { succeeded, failed, needed };
}

export async function conformityAuditWorkflow() {
  "use workflow";
  const { needed } = await calculateNeededAuditsStep();
  const result = await runConformityAuditStep(needed);
  return result;
}

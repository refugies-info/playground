import {
  type LettaUsage,
  NoFrontmatterSchema,
  parseAgentResponse,
} from "@playground/agents";
import { LETTA_MODEL_NAME, logger } from "@playground/shared-types";
import type { Json } from "@playground/supabase";
import type { LettaReportType, StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";

/**
 * Result of persisting an editorial report.
 */
export interface PersistEditorialReportResult {
  reportId: string;
  linked: boolean;
  editorialRecordId?: string;
}

/**
 * Persists an editorial agent response to letta_reports and links it to the editorial_record.
 *
 * This step:
 * 1. Parses the raw agent response (no frontmatter expected)
 * 2. Inserts a record into `letta_reports` table
 * 3. Links the report to the `editorial_record` via `content_report_id`
 *
 * The report is always stored for debugging purposes, even if linking fails.
 *
 * @param flowId - The workflow ID to associate with this report
 * @param agentId - The Letta agent ID that generated the response
 * @param responseContent - The raw response content from the agent
 * @param usage - Optional usage statistics (tokens)
 * @returns Result with report ID and linking status
 */
export async function persistEditorialReportStep(
  flowId: string,
  agentId: string,
  responseContent: string,
  usage?: LettaUsage,
): Promise<StepResult<PersistEditorialReportResult>> {
  "use step";

  const reportType: LettaReportType = "editorial";

  try {
    const supabase = getSupabaseClient();

    // Parse editorial response - no frontmatter expected for editorial reports
    const result = parseAgentResponse(
      responseContent,
      agentId,
      NoFrontmatterSchema,
      usage,
    );

    // 1. Insert the letta_report first (always, for debugging)
    const { data: report, error: reportError } = await supabase
      .from("letta_reports")
      .insert({
        agent_id: agentId,
        report_type: reportType,
        markdown: result.content,
        metadata: result.metadata as Json,
        status: result.status,
        raw_response: result.rawResponse,
        workflow_id: flowId,
        token_cost: usage?.totalTokens ?? null,
        model: LETTA_MODEL_NAME,
      })
      .select("id")
      .single();

    if (reportError) {
      return {
        success: false,
        error: `Failed to insert letta_report: ${reportError.message}`,
      };
    }

    logger.info(
      { reportId: report.id, flowId, type: reportType },
      "Editorial report stored successfully",
    );

    // 2. Get the editorial_record_id from the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select("editorial_record_id, ingestion_record_id") // Select ingestion_record_id as well
      .eq("id", flowId)
      .single();

    if (workflowError) {
      const msg = `Workflow lookup failed: ${workflowError.message}`;
      logger.warn({ flowId, reportId: report.id, error: workflowError }, msg);
      return {
        success: false,
        error: msg,
        data: { reportId: report.id, linked: false },
      };
    }

    let editorialRecordId = workflow?.editorial_record_id;

    // 2b. If no editorial_record_id, try to create one from ingestion_record
    if (!editorialRecordId) {
      if (!workflow?.ingestion_record_id) {
        const msg =
          "Workflow has no editorial_record_id and no ingestion_record_id to create one";
        logger.warn({ flowId, reportId: report.id }, msg);
        return {
          success: false,
          error: msg,
          data: { reportId: report.id, linked: false },
        };
      }

      logger.info(
        { flowId },
        "Creating missing editorial_record from ingestion_record for persistence",
      );

      // Fetch ingestion content to initialize editorial record
      const { data: ingestionRecord } = await supabase
        .from("ingestion_records")
        .select("markdown, metadata")
        .eq("id", workflow.ingestion_record_id)
        .single();

      if (!ingestionRecord) {
        const msg =
          "Failed to fetch ingestion record to create editorial record";
        return {
          success: false,
          error: msg,
          data: { reportId: report.id, linked: false },
        };
      }

      // Create new editorial_record
      const { data: newRecord, error: insertError } = await supabase
        .from("editorial_records")
        .insert({
          ingestion_record_id: workflow.ingestion_record_id,
          markdown: ingestionRecord.markdown,
        })
        .select("id")
        .single();

      if (insertError || !newRecord) {
        const msg = `Failed to create editorial record: ${insertError?.message}`;
        logger.error({ error: insertError }, msg);
        return {
          success: false,
          error: msg,
          data: { reportId: report.id, linked: false },
        };
      }

      editorialRecordId = newRecord.id;

      // Link workflow to new editorial record (critical step!)
      // Note: We don't wait for this to finish to proceed, but we should await it to ensure consistency if we want to retrieve it later from workflow
      /* 
         Actually, we must await it or the next run might fail again. 
         But here we just need the ID to link the report. 
         The workflow trigger `on_editorial_record_change` (if any) handles consistency but we manually set the ID here.
      */
      // Wait, there is a trigger `on_editorial_record_insert` that updates the workflow?
      // Let's manually update to be safe and explicit.
      await supabase
        .from("workflows")
        .update({ editorial_record_id: editorialRecordId })
        .eq("id", flowId);
    }

    // 3. Link the report to the editorial_record
    const { error: updateError } = await supabase
      .from("editorial_records")
      .update({ content_report_id: report.id })
      .eq("id", editorialRecordId);

    if (updateError) {
      logger.error(
        { error: updateError, reportId: report.id },
        "Failed to link report to editorial_record",
      );
      // We found/created the ID but failed to link. Return the ID so the pipeline might decide what to do.
      return {
        success: false,
        error: `Link failed: ${updateError.message}`,
        data: {
          reportId: report.id,
          linked: false,
          editorialRecordId: editorialRecordId,
        },
      };
    }

    logger.info(
      {
        reportId: report.id,
        editorialRecordId: editorialRecordId,
        type: reportType,
      },
      "Editorial report linked to editorial_record",
    );

    return {
      success: true,
      data: {
        reportId: report.id,
        linked: true,
        editorialRecordId: editorialRecordId,
      },
    };
  } catch (error) {
    logger.error(error, "Unexpected error in persistEditorialReportStep");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

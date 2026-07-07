import {
  type LettaUsage,
  MetadataMetadataSchema,
  parseAgentResponse,
} from "@playground/agents";
import { LETTA_MODEL_NAME, logger } from "@playground/shared-types";
import type { Json } from "@playground/supabase";
import type { LettaReportType, StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";

/**
 * Result of persisting a metadata report.
 */
export interface PersistMetadataReportResult {
  reportId: string;
  linked: boolean;
  editorialRecordId?: string;
}

/**
 * Persists a metadata agent response to letta_reports and links it to the
 * editorial_record and its active ingestion_record.
 *
 * This step:
 * 1. Parses the raw agent response (expects frontmatter with metadata scores)
 * 2. Inserts a record into `letta_reports` table
 * 3. Links the report to the `editorial_record` via `metadata_report_id`
 * 4. Links the report to the active `ingestion_record` via `metadata_report_id`
 *
 * The report is always stored for debugging purposes, even if linking fails.
 *
 * @param flowId - The workflow ID to associate with this report
 * @param agentId - The Letta agent ID that generated the response
 * @param responseContent - The raw response content from the agent
 * @param usage - Optional usage statistics (tokens)
 * @returns Result with report ID and linking status
 */
export async function persistMetadataReportStep(
  flowId: string,
  agentId: string,
  responseContent: string,
  usage?: LettaUsage,
): Promise<StepResult<PersistMetadataReportResult>> {
  "use step";

  const reportType: LettaReportType = "metadata";

  try {
    const supabase = getSupabaseClient();

    // Parse metadata response - expects frontmatter with scores
    const result = parseAgentResponse(
      responseContent,
      agentId,
      MetadataMetadataSchema,
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
      "Metadata report stored successfully",
    );

    // 2. Get the editorial_record_id from the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select("editorial_record_id, ingestion_record_id")
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
        "Creating missing editorial_record from ingestion_record for persistence (metadata)",
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

      // Create new editorial_record (metadata left to default)
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

      await supabase
        .from("workflows")
        .update({ editorial_record_id: editorialRecordId })
        .eq("id", flowId);
    }

    // 3. Link the report to the editorial_record
    const { error: updateError } = await supabase
      .from("editorial_records")
      .update({ metadata_report_id: report.id })
      .eq("id", editorialRecordId);

    if (updateError) {
      logger.error(
        { error: updateError, reportId: report.id },
        "Failed to link report to editorial_record",
      );
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

    if (workflow.ingestion_record_id) {
      const { error: linkIngestionError } = await supabase
        .from("ingestion_records")
        .update({ metadata_report_id: report.id })
        .eq("id", workflow.ingestion_record_id);

      if (linkIngestionError) {
        logger.error(
          {
            error: linkIngestionError,
            reportId: report.id,
            ingestionRecordId: workflow.ingestion_record_id,
          },
          "Failed to link metadata report to ingestion_record",
        );
        return {
          success: false,
          error: `Ingestion link failed: ${linkIngestionError.message}`,
          data: {
            reportId: report.id,
            linked: false,
            editorialRecordId: editorialRecordId,
          },
        };
      }
    }

    logger.info(
      {
        reportId: report.id,
        editorialRecordId: editorialRecordId,
        type: reportType,
      },
      "Metadata report linked to editorial_record",
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
    logger.error(error, "Unexpected error in persistMetadataReportStep");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

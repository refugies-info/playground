import { createLettaClient } from "@playground/agents";
import { parseLheoXml } from "@playground/rco";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin, insertRcoRecord } from "@playground/supabase";
import { processXmlWorkflow } from "@playground/workflows";
import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { buildWorkflowDashboardUrl } from "@/lib/workflow-utils";

export async function POST(request: Request) {
  const { xmlContent } = await request.json();

  if (!xmlContent) {
    return NextResponse.json(
      { error: "XML content is required" },
      { status: 400 },
    );
  }

  try {
    // 1. Parse Metadata for RCO insertion
    const metadata = await parseLheoXml(xmlContent);

    // 2. Initialize Supabase Admin
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Server configuration error: Missing Supabase credentials" },
        { status: 500 },
      );
    }

    const supabase = getSupabaseAdmin(url, key);

    // 3. Insert RCO Record (triggers content_flow creation)
    const {
      rcoRecordId,
      flowId,
      error: dbError,
    } = await insertRcoRecord(supabase, xmlContent, metadata);

    if (dbError || !rcoRecordId || !flowId) {
      return NextResponse.json(
        { error: "Failed to create RCO record", details: dbError },
        { status: 500 },
      );
    }

    // 3.5 Create Letta Conversation
    const agentId = process.env.PLAYGROUND_AGENT_ID;
    if (!agentId) {
      throw new Error("PLAYGROUND_AGENT_ID is not defined");
    }

    const lettaClient = createLettaClient();
    const conversation = await lettaClient.conversations.create({
      agent_id: agentId,
    });
    const conversationId = conversation.id;

    // Link conversation to workflow immediately
    const { error: convLinkError } = await supabase
      .from("workflows")
      .update({ conversation_id: conversationId })
      .eq("id", flowId);

    if (convLinkError) {
      logger.error(
        { error: convLinkError, flowId, conversationId },
        "Failed to link conversation to workflow",
      );
    }

    // 4. Start the workflow
    const result = await start(processXmlWorkflow, [
      flowId,
      rcoRecordId,
      conversationId,
    ]);
    const workflowId = result.runId;

    // 5. Link Workflow to Content Flow
    const { error: linkError } = await supabase
      .from("workflows")
      .update({
        vercel_workflow_id: workflowId,
      })
      .eq("id", flowId);

    if (linkError) {
      // Non-blocking error, but should be logged.

      logger.error(linkError, "Failed to link workflow");
    }

    // 6. Build dashboard URL for observability
    const dashboardUrl = buildWorkflowDashboardUrl(workflowId);

    return NextResponse.json({
      message: "Workflow started",
      workflowId,
      flowId,
      rcoRecordId,
      dashboardUrl,
    });
  } catch (error) {
    logger.error(error, "Workflow start error");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

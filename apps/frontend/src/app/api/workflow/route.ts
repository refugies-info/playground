import { parseLheoXml } from "@playground/rco";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin, insertRcoRecord } from "@playground/supabase";
import { processXmlWorkflow } from "@playground/workflows";
import { NextResponse } from "next/server";
import { start } from "workflow/api";

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
      contentFlowId,
      error: dbError,
    } = await insertRcoRecord(supabase, xmlContent, metadata);

    if (dbError || !rcoRecordId || !contentFlowId) {
      return NextResponse.json(
        { error: "Failed to create RCO record", details: dbError },
        { status: 500 },
      );
    }

    // 4. Start the workflow
    const result = await start(processXmlWorkflow, [
      contentFlowId,
      rcoRecordId,
    ]);
    const workflowId = result.runId;

    // 5. Link Workflow to Content Flow
    const { error: linkError } = await supabase
      .from("vercel_workflows")
      .insert({
        content_flow_id: contentFlowId,
        vercel_workflow_id: workflowId,
      });

    if (linkError) {
      // Non-blocking error, but should be logged.

      logger.error(linkError, "Failed to link workflow");
    }

    return NextResponse.json({
      message: "Workflow started",
      workflowId,
      contentFlowId,
      rcoRecordId,
    });
  } catch (error) {
    logger.error(error, "Workflow start error");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

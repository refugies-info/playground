import { start } from "workflow/api";
import { processXmlWorkflow } from "@playground/workflows";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { xmlContent } = await request.json();

  if (!xmlContent) {
    return NextResponse.json({ error: "XML content is required" }, { status: 400 });
  }

  // Start the workflow
  const result = await start(processXmlWorkflow, [xmlContent]);

  const workflowId = result.runId;

  return NextResponse.json({
    message: "Workflow started",
    workflowId
  });
}

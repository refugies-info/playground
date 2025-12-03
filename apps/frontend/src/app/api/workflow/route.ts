import { start } from "workflow/api";
import { processXmlWorkflow } from "@/workflows/process-xml";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { xmlContent } = await request.json();

  if (!xmlContent) {
    return NextResponse.json({ error: "XML content is required" }, { status: 400 });
  }

  // Start the workflow
  const result = await start(processXmlWorkflow, [xmlContent]);
  // @ts-ignore: workflowId might not be in the type definition yet but is returned at runtime
  const workflowId = result.workflowId;

  return NextResponse.json({
    message: "Workflow started",
    workflowId
  });
}

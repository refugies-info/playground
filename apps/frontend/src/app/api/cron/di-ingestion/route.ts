import { logger } from "@playground/shared-types";
import { diIngestionWorkflow } from "@playground/workflows";
import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { buildWorkflowDashboardUrl } from "@/lib/workflow-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    logger.error("CRON_SECRET is not set, cron cannot run.");
    return false;
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : authHeader;

  return token === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await start(diIngestionWorkflow, []);
    const dashboardUrl = buildWorkflowDashboardUrl(result.runId);
    return NextResponse.json({
      message: "DI ingestion workflow started",
      workflowId: result.runId,
      dashboardUrl,
    });
  } catch (error) {
    logger.error(error, "DI ingestion cron failed");
    return NextResponse.json(
      { error: "Failed to start DI ingestion workflow" },
      { status: 500 },
    );
  }
}

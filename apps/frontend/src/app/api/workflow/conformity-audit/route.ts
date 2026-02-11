import { logger } from "@playground/shared-types";
import { conformityAuditWorkflow } from "@playground/workflows";
import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { buildWorkflowDashboardUrl } from "@/lib/workflow-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.DI_INGESTION_CRON_SECRET;

  if (!secret) {
    logger.error("DI_INGESTION_CRON_SECRET is not set, API cannot run.");
    return false;
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : authHeader;

  return token === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await start(conformityAuditWorkflow, []);
    const dashboardUrl = buildWorkflowDashboardUrl(result.runId);
    return NextResponse.json({
      message: "Conformity audit workflow started",
      workflowId: result.runId,
      dashboardUrl,
    });
  } catch (error) {
    logger.error(error, "Conformity audit workflow failed to start");
    return NextResponse.json(
      { error: "Failed to start conformity audit workflow" },
      { status: 500 },
    );
  }
}

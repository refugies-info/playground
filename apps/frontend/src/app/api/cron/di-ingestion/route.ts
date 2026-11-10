import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import { findRunningIngestion } from "@playground/supabase/ingestion-runs";
import { diIngestionWorkflow } from "@playground/workflows";
import { start } from "@workflow/core/runtime";
import { NextResponse } from "next/server";
import { getIngestionSource } from "@/lib/ingestion-source";
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
    if (getIngestionSource() !== "di") {
      return NextResponse.json({
        message: "DI ingestion disabled: active source is RCO",
      });
    }
    if (await findRunningIngestion(getSupabaseAdmin())) {
      return NextResponse.json(
        { message: "An ingestion is already running" },
        { status: 409 },
      );
    }
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

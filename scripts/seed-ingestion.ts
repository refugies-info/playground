import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { logger } from "@playground/shared-types";

/**
 * Seed ingestion by calling the workflow API endpoint.
 * This triggers the real Vercel Workflow, making runs visible in the inspector.
 */
async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const rcoXmlPath = path.resolve(__dirname, "../packages/rco/samples/rco.xml");

  // 1. Verify XML exists
  if (!fs.existsSync(rcoXmlPath)) {
    logger.error(`RCO XML not found at ${rcoXmlPath}`);
    process.exit(1);
  }

  const xmlContent = fs.readFileSync(rcoXmlPath, "utf-8");
  logger.info({ xmlPath: rcoXmlPath }, "Loaded XML content");

  // 2. Call the workflow API endpoint
  const workflowUrl = `${baseUrl}/api/workflow`;
  logger.info({ workflowUrl }, "Calling workflow API...");

  try {
    const response = await fetch(workflowUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ xmlContent }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error(
        { status: response.status, error: errorData },
        "Workflow API call failed",
      );
      process.exit(1);
    }

    interface WorkflowResponse {
      workflowId: string;
      flowId: string;
      rcoRecordId: string;
      dashboardUrl?: string;
    }

    const result = (await response.json()) as WorkflowResponse;
    logger.info(
      {
        workflowId: result.workflowId,
        flowId: result.flowId,
        rcoRecordId: result.rcoRecordId,
        dashboardUrl: result.dashboardUrl,
      },
      "Workflow started successfully!",
    );

    logger.info(`
╔══════════════════════════════════════════════════════════════════╗
║  Workflow is now running!                                        ║
║  Check the inspector at: http://localhost:3456                   ║
║  Or the dashboard at: ${result.dashboardUrl?.slice(0, 45) || "N/A"}
╚══════════════════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    logger.error(error, "Failed to call workflow API");
    logger.info(`
╔══════════════════════════════════════════════════════════════════╗
║  ERROR: Make sure the dev server is running (pnpm dev)           ║
║  The workflow API is served by Next.js at /api/workflow          ║
╚══════════════════════════════════════════════════════════════════╝
    `);
    process.exit(1);
  }
}

main().catch((err) => {
  logger.error(err, "Unhandled error");
  process.exit(1);
});

import { logger } from "@playground/shared-types";

/**
 * Slack notifications via Incoming Webhooks.
 *
 * One webhook per channel, configured by environment variable:
 *   - SLACK_WEBHOOK_LOGS_BOMO → #logs-bomo: successful RCO publications
 *   - SLACK_WEBHOOK_DEV       → #dev: publication and Airtable failures
 */

const ENV_WEBHOOK_LOGS_BOMO = "SLACK_WEBHOOK_LOGS_BOMO";
const ENV_WEBHOOK_DEV = "SLACK_WEBHOOK_DEV";

function getEnvironmentLabel(): string {
  const baseUrl = (process.env.RI_BASE_URL || "").toLowerCase();
  if (baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")) {
    return "dev";
  }
  if (baseUrl.includes("staging")) {
    return "staging";
  }
  return "prod";
}

/** Editor link for the document, or null when BOMO_BASE_URL is unset. */
function getBomoDocumentUrl(workflowId: string): string | null {
  const baseUrl = process.env.BOMO_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return null;
  return `${baseUrl}/documents/${workflowId}`;
}

/** POSTs a text message to a Slack Incoming Webhook. Never throws. */
async function postSlackMessage(
  webhookUrl: string | undefined,
  envName: string,
  text: string,
): Promise<void> {
  if (!webhookUrl) {
    logger.warn({ envName }, "Slack webhook not configured, skipping message");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      logger.error(
        { status: response.status, envName },
        "Slack webhook returned a non-OK status",
      );
    }
  } catch (error) {
    logger.error({ error, envName }, "Error sending Slack notification");
  }
}

/** Notifies #logs-bomo that an RCO document was published. */
export async function notifyPublicationSuccess(params: {
  workflowId: string;
  title: string;
  publishedUrl: string;
  userEmail: string;
  isUpdate: boolean;
}): Promise<void> {
  const verb = params.isUpdate ? "mise à jour" : "publiée";
  const bomoUrl = getBomoDocumentUrl(params.workflowId);
  const text = [
    `:white_check_mark: [${getEnvironmentLabel()}] Fiche RCO ${verb} : *${params.title}*`,
    params.publishedUrl,
    ...(bomoUrl ? [`fiche BOMO : ${bomoUrl}`] : []),
    `par ${params.userEmail}`,
  ].join("\n");

  await postSlackMessage(
    process.env[ENV_WEBHOOK_LOGS_BOMO],
    ENV_WEBHOOK_LOGS_BOMO,
    text,
  );
}

/** Notifies #dev that an RCO publication failed. */
export async function notifyPublicationError(params: {
  workflowId: string;
  errorMessage: string;
  errorCode?: string;
  /** First stack line (error origin), rendered as a code block. */
  errorOrigin?: string;
  userEmail?: string;
}): Promise<void> {
  const bomoUrl = getBomoDocumentUrl(params.workflowId);
  const text = [
    `:rotating_light: [${getEnvironmentLabel()}] Échec de publication RCO`,
    ...(bomoUrl
      ? [`fiche BOMO : ${bomoUrl}`]
      : [`workflow: \`${params.workflowId}\``]),
    ...(params.userEmail ? [`par ${params.userEmail}`] : []),
    ...(params.errorCode ? [`code: \`${params.errorCode}\``] : []),
    `erreur: ${params.errorMessage}`,
    ...(params.errorOrigin ? [`origine: \`${params.errorOrigin}\``] : []),
  ].join("\n");

  await postSlackMessage(process.env[ENV_WEBHOOK_DEV], ENV_WEBHOOK_DEV, text);
}

/**
 * Notifies #dev that an Airtable tracking row could not be created.
 */
export async function notifyAirtableError(params: {
  /** French title of the document. */
  title: string;
  language: string;
  errorMessage: string;
  publishedUrl?: string;
}): Promise<void> {
  const text = [
    `:rotating_light: [${getEnvironmentLabel()}] Suivi Airtable échoué (SUIVI TRAD)`,
    `fiche : *${params.title}* — ${params.language.toUpperCase()}`,
    ...(params.publishedUrl ? [params.publishedUrl] : []),
    `erreur: ${params.errorMessage}`,
  ].join("\n");

  await postSlackMessage(process.env[ENV_WEBHOOK_DEV], ENV_WEBHOOK_DEV, text);
}

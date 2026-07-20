import { logger } from "@playground/shared-types";

/**
 * Notifications Slack via Incoming Webhooks.
 *
 * Deux webhooks (un par channel), configurés par variables d'environnement :
 *   - SLACK_WEBHOOK_LOGS_BOMO → channel #logs-bomo : fiches RCO publiées (succès)
 *   - SLACK_WEBHOOK_DEV       → channel #dev       : erreurs de publication
 *
 * Fire-and-forget : toute erreur d'envoi est loggée puis avalée — une
 * notification Slack ne doit jamais casser la publication qu'elle rapporte.
 */

const ENV_WEBHOOK_LOGS_BOMO = "SLACK_WEBHOOK_LOGS_BOMO";
const ENV_WEBHOOK_DEV = "SLACK_WEBHOOK_DEV";

/**
 * Libellé d'environnement affiché dans les notifications Slack.
 *
 * Dérivé de RI_BASE_URL (cible réelle de la publication) plutôt que de
 * NODE_ENV, qui ne distingue pas staging de production.
 */
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

/**
 * Lien direct vers la fiche dans l'éditeur BOMO pour l'environnement courant.
 *
 * Base = BOMO_BASE_URL (ex. http://localhost:3001 en dev). Retourne null si la
 * variable n'est pas configurée — le lien est alors simplement omis du message.
 */
function getBomoDocumentUrl(workflowId: string): string | null {
  const baseUrl = process.env.BOMO_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return null;
  return `${baseUrl}/documents/${workflowId}`;
}

/**
 * POST un message texte sur un Incoming Webhook Slack.
 * Ne throw jamais : les échecs sont loggés.
 */
async function postSlackMessage(
  webhookUrl: string | undefined,
  envName: string,
  text: string,
): Promise<void> {
  if (!webhookUrl) {
    logger.warn(
      { envName },
      "Slack webhook non configuré — notification ignorée",
    );
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
        "Le webhook Slack a répondu avec un statut non-OK",
      );
    }
  } catch (error) {
    logger.error(
      { error, envName },
      "Échec de l'envoi de la notification Slack",
    );
  }
}

/**
 * Notifie #logs-bomo qu'une fiche RCO a été publiée avec succès.
 */
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

/**
 * Notifie #dev qu'une publication RCO a échoué.
 */
export async function notifyPublicationError(params: {
  workflowId: string;
  errorMessage: string;
  errorCode?: string;
  /** 1re ligne de stack (origine de l'erreur), affichée en bloc code. */
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

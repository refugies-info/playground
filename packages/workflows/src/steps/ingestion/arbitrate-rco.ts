/**
 * @file arbitrate-rco.ts
 *
 * Arbitration of one RCO record, called by forceAuditReportStep.
 *
 *   [1] checkCompliance          → deterministic rules (no AI)
 *   [2] rco-compliance agent     → only the criteria the rules left open
 *   [3] findDuplicateCandidates  → Orama shortlist of RI dispositifs (no AI)
 *   [4] rco-duplicates agent     → only when the shortlist is not empty
 *
 * A record refused by the rules never reaches an agent.
 */

import {
  askComplianceAgent,
  askDuplicatesAgent,
  createLettaClient,
  type DuplicateAnswer,
  type LettaUsage,
} from "@playground/agents";
import dispositifsSnapshot from "@playground/agents/samples/dispositifs.json";
import {
  applyAiDecisions,
  type CriterionResult,
  checkCompliance,
  createDispositifIndex,
  criteriaForAi,
  type DuplicateCandidate,
  findDuplicateCandidates,
  overallVerdict,
  type RcoActionDocument,
  type RiDispositif,
  toArbitrationDocument,
} from "@playground/offre-info";
import { FatalError } from "@workflow/errors";

const VERDICT_ICONS = { accepted: "✅", refused: "❌", ai: "🤖" } as const;

const requiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new FatalError(`${name} is not defined (pnpm agents:sync)`);
  return value;
};

// ponytail: Dec 2025 snapshot of RI dispositifs, read getDispositifs() from
// @playground/mongo once MONGODB_URI is available to the workflows.
const dispositifIndex = createDispositifIndex(
  dispositifsSnapshot as RiDispositif[],
);

const addUsage = (total: number, usage?: LettaUsage) =>
  total + (usage?.totalTokens ?? 0);

const complianceTable = (results: CriterionResult[]) =>
  [
    "| Critère | Décision | Raison |",
    "| --- | --- | --- |",
    ...results.map(
      ({ criterion, verdict, reason }) =>
        `| ${criterion} | ${VERDICT_ICONS[verdict]} ${verdict} | ${reason.replaceAll("|", "/")} |`,
    ),
  ].join("\n");

const duplicateSection = (
  candidates: DuplicateCandidate[],
  answer: DuplicateAnswer | null,
) => {
  if (candidates.length === 0) return "Aucun dispositif RI proche.";
  const conclusion = answer
    ? `**${answer.duplicate ? `Doublon de ${answer.dispositifId}` : "Pas de doublon"}** — ${answer.reason}`
    : "Non analysé : la fiche est refusée par les règles.";
  const list = candidates
    .map((c) => `- [${c.title}](${c.url}) · ${c.sponsor || "?"}`)
    .join("\n");
  return `${conclusion}\n\nCandidats présélectionnés :\n\n${list}`;
};

export async function arbitrateRcoRecord(action: RcoActionDocument) {
  const complianceAgentId = requiredEnv("RCO_COMPLIANCE_AGENT_ID");
  const duplicatesAgentId = requiredEnv("RCO_DUPLICATES_AGENT_ID");
  const letta = createLettaClient();
  const document = toArbitrationDocument(action);
  let tokens = 0;
  const rawAnswers: Record<string, unknown> = {};

  let compliance = checkCompliance(action);
  const refusedByRules = overallVerdict(compliance) === "refused";
  if (overallVerdict(compliance) === "ai") {
    const { answer, usage } = await askComplianceAgent(
      letta,
      complianceAgentId,
      action.id,
      criteriaForAi(compliance).map((criterion) => criterion.criterion),
      document,
    );
    compliance = applyAiDecisions(compliance, answer.decisions);
    rawAnswers.compliance = answer;
    tokens = addUsage(tokens, usage);
  }

  const candidates = await findDuplicateCandidates(
    await dispositifIndex,
    action,
  );
  let duplicateAnswer: DuplicateAnswer | null = null;
  if (candidates.length > 0 && !refusedByRules) {
    const { answer, usage } = await askDuplicatesAgent(
      letta,
      duplicatesAgentId,
      action.id,
      document,
      candidates,
    );
    duplicateAnswer = answer;
    rawAnswers.duplicates = answer;
    tokens = addUsage(tokens, usage);
  }

  const verdict = overallVerdict(compliance);
  const duplicate = duplicateAnswer?.duplicate ?? false;
  return {
    agentId: complianceAgentId,
    tokens,
    rawResponse: JSON.stringify(rawAnswers),
    // An agent that skipped a criterion leaves it "ai": the report is unusable.
    status: verdict === "ai" ? ("incomplete" as const) : ("complete" as const),
    complianceStatus:
      verdict === "ai"
        ? "error"
        : verdict === "accepted" && !duplicate
          ? "compliant"
          : "non_compliant",
    metadata: {
      compliant: verdict === "accepted",
      duplicate,
      duplicateOf: duplicateAnswer?.dispositifId ?? null,
      criteria: compliance,
    },
    markdown: [
      `## Conformité éditoriale : ${VERDICT_ICONS[verdict]} ${verdict}`,
      complianceTable(compliance),
      "## Doublons",
      duplicateSection(candidates, duplicateAnswer),
    ].join("\n\n"),
  };
}

/**
 * @file arbitrate-rco.ts
 *
 * Arbitration of one RCO record, called by forceAuditReportStep.
 *
 *   [1] checkCompliance       → deterministic rules (no AI)
 *   [2] rco-compliance agent  → only the criteria the rules left open
 *   [3] duplicate shortlist   → RI dispositifs (RI endpoint) + playground
 *                               documents to process or in draft (SQL)
 *   [4] rco-duplicates agent  → only when the shortlist is not empty
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
import {
  actionDepartments,
  applyAiDecisions,
  type ComplianceCriterion,
  type CriterionResult,
  checkCompliance,
  criteriaForAi,
  type DuplicateCandidate,
  overallVerdict,
  type RcoActionDocument,
  type RiDispositif,
  toArbitrationDocument,
  toCandidate,
  type Verdict,
} from "@playground/offre-info";
import { FatalError } from "@workflow/errors";
import { getSupabaseClient } from "./utils";

// The editorial team reads the report: French only.
const VERDICT_LABELS: Record<Verdict, string> = {
  accepted: "✅ Validé",
  refused: "❌ Refusé",
  ai: "🤖 À arbitrer",
};

const OVERALL_LABELS: Record<Verdict, string> = {
  accepted: "✅ Conforme",
  refused: "❌ Non conforme",
  ai: "🤖 À arbitrer",
};

const CRITERION_LABELS: Record<ComplianceCriterion, string> = {
  agreement: "Conventionnement",
  funder: "Financeur",
  audience: "Public visé",
  sessions: "Sessions",
  hours: "Volume horaire",
  scheme_type: "Type de dispositif",
};

const DUPLICATE_VERDICT_LABELS = {
  duplicate: "Doublon",
  ambiguous: "Doublon possible",
} as const;

const SOURCE_LABELS = {
  "refugies-info": "Refugies.info",
  playground: "BOMO",
} as const;

const CANDIDATE_LIMIT = 10;
const RI_DUPLICATES_PATH = "/api/agent/dispositifs/duplicates";
const RI_TIMEOUT_MS = 10_000;

const requiredEnv = (name: string, hint = "pnpm agents:sync") => {
  const value = process.env[name];
  if (!value) throw new FatalError(`${name} is not defined (${hint})`);
  return value;
};

const addUsage = (total: number, usage?: LettaUsage) =>
  total + (usage?.totalTokens ?? 0);

const tableCell = (value: string) =>
  value.replaceAll("|", "/").replaceAll("\n", " ");

const complianceTable = (results: CriterionResult[]) =>
  [
    "| Critère | Décision | Raison |",
    "| --- | --- | --- |",
    ...results.map(
      ({ criterion, verdict, reason }) =>
        `| ${CRITERION_LABELS[criterion]} | ${VERDICT_LABELS[verdict]} | ${tableCell(reason)} |`,
    ),
  ].join("\n");

const resolveMatches = (
  candidates: DuplicateCandidate[],
  answer: DuplicateAnswer | null,
) => {
  const candidatesById = new Map(candidates.map((c) => [c.id, c]));
  return (answer?.matches ?? []).flatMap((match) => {
    // An id the agent made up has no fiche to link to.
    const candidate = candidatesById.get(match.candidateId);
    return candidate
      ? [{ ...match, ...candidate, verdict: match.verdict }]
      : [];
  });
};

type ResolvedMatch = ReturnType<typeof resolveMatches>[number];

const duplicateSection = (
  refusedByRules: boolean,
  answer: DuplicateAnswer | null,
  matches: ResolvedMatch[],
) => {
  if (refusedByRules) {
    return "Non analysé : la fiche est refusée par les règles de conformité.";
  }
  if (matches.length === 0) return "Aucun doublon détecté.";
  return [
    answer?.reason ?? "",
    [
      "| Fiche | Source | Structure | Verdict | Raison |",
      "| --- | --- | --- | --- | --- |",
      ...matches.map(
        (match) =>
          `| [${tableCell(match.title || "Sans titre")}](${match.url}) | ${SOURCE_LABELS[match.source]} | ${tableCell(match.sponsor || "—")} | ${DUPLICATE_VERDICT_LABELS[match.verdict]} | ${tableCell(match.reason)} |`,
      ),
    ].join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
};

type RiDuplicateCandidate = RiDispositif & { score: number };

async function findRiCandidates(
  action: RcoActionDocument,
): Promise<DuplicateCandidate[]> {
  const baseUrl = requiredEnv("RI_BASE_URL", "RI webhook").replace(/\/$/, "");
  const secret = requiredEnv("RI_WEBHOOK_SECRET", "RI webhook");
  const document = toArbitrationDocument(action);
  // ponytail: same contract as riWebhookRequest (apps/frontend, PR #360);
  // reuse it once it lives in a package the workflows can import.
  const response = await fetch(`${baseUrl}${RI_DUPLICATES_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "webhook-secret": secret },
    body: JSON.stringify({
      title: action.nom,
      description: action.objectif_formation,
      structureName: action.organisme_responsable?.nom,
      commune: document.villes.find(Boolean),
      departments: actionDepartments(action),
      limit: CANDIDATE_LIMIT,
    }),
    signal: AbortSignal.timeout(RI_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(
      `RI duplicate search failed: ${response.status} ${await response.text().catch(() => "")}`,
    );
  }
  const { candidates } = (await response.json()) as {
    candidates: RiDuplicateCandidate[];
  };
  return candidates.map((candidate) => ({
    ...toCandidate(candidate, "refugies-info"),
    score: candidate.score,
  }));
}

async function findPlaygroundCandidates(
  action: RcoActionDocument,
  workflowId: string,
): Promise<DuplicateCandidate[]> {
  const { data, error } = await getSupabaseClient().rpc(
    "search_playground_duplicate_candidates",
    {
      p_title: action.nom,
      p_structure_name: action.organisme_responsable?.nom ?? "",
      p_exclude_workflow_id: workflowId,
      p_limit: CANDIDATE_LIMIT,
    },
  );
  if (error) {
    throw new Error(`Playground duplicate search failed: ${error.message}`);
  }
  return data.map((row) => ({
    ...toCandidate(
      {
        id: row.id,
        titreInformatif: row.title,
        mainSponsorNom: row.structure_name,
        city: row.commune ? [row.commune] : [],
      },
      "playground",
    ),
    score: row.score,
  }));
}

export async function arbitrateRcoRecord(
  action: RcoActionDocument,
  workflowId: string,
) {
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

  let candidates: DuplicateCandidate[] = [];
  let duplicateAnswer: DuplicateAnswer | null = null;
  if (!refusedByRules) {
    candidates = (
      await Promise.all([
        findRiCandidates(action),
        findPlaygroundCandidates(action, workflowId),
      ])
    ).flat();
  }
  if (candidates.length > 0) {
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

  const matches = resolveMatches(candidates, duplicateAnswer);
  // An ambiguous match is a duplicate until the editorial team says otherwise.
  const duplicate = matches.length > 0;
  const verdict = overallVerdict(compliance);
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
      duplicates: matches.map(
        ({ id, source, url, title, sponsor, verdict, reason }) => ({
          id,
          source,
          url,
          title,
          sponsor,
          verdict,
          reason,
        }),
      ),
      criteria: compliance,
    },
    markdown: [
      `## Analyse de conformité éditoriale : ${OVERALL_LABELS[verdict]}`,
      complianceTable(compliance),
      `## Analyse de doublon${duplicate ? " : ❌ Doublon détecté" : ""}`,
      duplicateSection(refusedByRules, duplicateAnswer, matches),
    ].join("\n\n"),
  };
}

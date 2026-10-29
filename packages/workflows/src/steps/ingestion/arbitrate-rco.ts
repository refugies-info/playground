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
 * A record refused by the rules still gets its open criteria judged, so the
 * editorial team can contest a refusal, but skips the duplicate search.
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
  CRITERION_LABELS,
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
import {
  type ArbitrationCriterion,
  type ArbitrationReport,
  COMPARED_ELEMENT_LABELS,
  COMPARED_ELEMENTS,
  comparedValueHeader,
  DUPLICATE_VERDICT_LABELS,
  type DuplicateMatch,
  SIMILARITY_LABELS,
} from "@playground/shared-types";
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

const complianceTable = (criteria: ArbitrationCriterion[]) =>
  [
    "| Étape | Donnée trouvée & analysée | Décision |",
    "| --- | --- | --- |",
    ...criteria.map(
      ({ label, verdict, reason }) =>
        `| ${label} | ${tableCell(reason)} | ${VERDICT_LABELS[verdict]} |`,
    ),
  ].join("\n");

const candidateLocation = (candidate: DuplicateCandidate) =>
  [...candidate.cities, ...candidate.departments].join(", ") ||
  (candidate.source === "refugies-info" ? "France entière" : "—");

const toDuplicateMatches = (
  candidates: DuplicateCandidate[],
  answer: DuplicateAnswer | null,
): DuplicateMatch[] => {
  const candidatesById = new Map(candidates.map((c) => [c.id, c]));
  return (answer?.matches ?? []).flatMap(
    ({ candidateId, verdict, reason, similarity }) => {
      // An id the agent made up has no fiche to link to.
      const candidate = candidatesById.get(candidateId);
      return candidate
        ? [
            {
              id: candidate.id,
              source: candidate.source,
              url: candidate.url,
              title: candidate.title || "Sans titre",
              sponsor: candidate.sponsor || "—",
              location: candidateLocation(candidate),
              verdict,
              reason,
              similarity,
            },
          ]
        : [];
    },
  );
};

const rcoValues = (
  action: RcoActionDocument,
): ArbitrationReport["rcoValues"] => ({
  sponsor: action.organisme_responsable?.nom || "—",
  location:
    [
      ...new Set(toArbitrationDocument(action).villes.filter(Boolean)),
      ...actionDepartments(action),
    ].join(", ") || "—",
  title: action.nom || "Sans titre",
});

const comparisonTable = (
  match: DuplicateMatch,
  rco: ArbitrationReport["rcoValues"],
) =>
  [
    `| Élément comparé | ${comparedValueHeader(match.source)} | Valeur RCO | Similarité |`,
    "| --- | --- | --- | --- |",
    ...COMPARED_ELEMENTS.map(
      (element) =>
        `| ${COMPARED_ELEMENT_LABELS[element]} | ${tableCell(match[element])} | ${tableCell(rco[element])} | ${SIMILARITY_LABELS[match.similarity[element]]} |`,
    ),
  ].join("\n");

const duplicateSection = (report: ArbitrationReport) => {
  if (!report.duplicatesChecked) {
    return "Non analysé : la fiche est refusée par les règles de conformité.";
  }
  if (!report.duplicate) return "Aucun doublon détecté.";
  return [
    report.duplicateSummary ?? "",
    ...report.duplicates.map((match) =>
      [
        `### [${match.title}](${match.url}) : ${DUPLICATE_VERDICT_LABELS[match.verdict]}`,
        match.reason,
        comparisonTable(match, report.rcoValues),
      ].join("\n\n"),
    ),
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
  const pendingCriteria = criteriaForAi(compliance);
  if (pendingCriteria.length > 0) {
    const { answer, usage } = await askComplianceAgent(
      letta,
      complianceAgentId,
      action.id,
      pendingCriteria.map((criterion) => criterion.criterion),
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

  const verdict = overallVerdict(compliance);
  const unsettled = criteriaForAi(compliance).length > 0;
  const duplicates = toDuplicateMatches(candidates, duplicateAnswer);
  const report: ArbitrationReport = {
    compliant: verdict === "accepted",
    duplicate: duplicates.length > 0,
    duplicatesChecked: !refusedByRules,
    duplicateSummary: duplicateAnswer?.reason ?? null,
    criteria: compliance.map((result) => ({
      ...result,
      label: CRITERION_LABELS[result.criterion],
    })),
    duplicates,
    rcoValues: rcoValues(action),
  };
  return {
    agentId: complianceAgentId,
    tokens,
    rawResponse: JSON.stringify(rawAnswers),
    // An agent that skipped a criterion leaves it "ai": the report is unusable.
    status: unsettled ? ("incomplete" as const) : ("complete" as const),
    complianceStatus: unsettled
      ? "error"
      : report.compliant && !report.duplicate
        ? "compliant"
        : "non_compliant",
    metadata: report,
    markdown: [
      `## Analyse de conformité éditoriale : ${OVERALL_LABELS[verdict]}`,
      complianceTable(report.criteria),
      `## Analyse de doublons${report.duplicate ? " : ❌ Doublon détecté" : ""}`,
      duplicateSection(report),
    ].join("\n\n"),
  };
}

/**
 * Metadata of an RCO arbitration report (letta_reports.metadata), rendered as
 * tables on the arbitration page. Labels are French: the editorial team reads them.
 */

// "refugies-info": published dispositif; "playground": BOMO document still
// being processed (to process or draft).
export type DuplicateSource = "refugies-info" | "playground";

// An ambiguous match counts as a duplicate until the editorial team decides.
export type DuplicateVerdict = "duplicate" | "ambiguous";

export type CriterionVerdict = "accepted" | "refused" | "ai";

export interface ArbitrationCriterion {
  criterion: string;
  /** Question shown in the "Étape" column */
  label: string;
  verdict: CriterionVerdict;
  reason: string;
}

export interface DuplicateMatch {
  id: string;
  source: DuplicateSource;
  url: string;
  title: string;
  sponsor: string;
  location: string;
  verdict: DuplicateVerdict;
  reason: string;
}

export interface ArbitrationReport {
  compliant: boolean;
  duplicate: boolean;
  /** False when the rules refused the fiche before the duplicate search */
  duplicatesChecked: boolean;
  duplicateSummary: string | null;
  criteria: ArbitrationCriterion[];
  duplicates: DuplicateMatch[];
}

export const DUPLICATE_SOURCE_LABELS: Record<DuplicateSource, string> = {
  "refugies-info": "Refugies.info",
  playground: "BOMO",
};

export const DUPLICATE_VERDICT_LABELS: Record<DuplicateVerdict, string> = {
  duplicate: "Doublon",
  ambiguous: "Doublon possible",
};

// Reports generated before RI-1642 have no labels nor duplicate list.
export const isArbitrationReport = (
  metadata: unknown,
): metadata is ArbitrationReport => {
  const report = metadata as Partial<ArbitrationReport> | null;
  return (
    Array.isArray(report?.duplicates) &&
    Array.isArray(report?.criteria) &&
    report.criteria.every((criterion) => typeof criterion.label === "string")
  );
};

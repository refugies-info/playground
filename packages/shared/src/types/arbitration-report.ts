/**
 * Metadata of an RCO arbitration report (letta_reports.metadata), rendered as
 * tables on the arbitration page. Labels are French: the editorial team reads them.
 */

// "refugies-info": published dispositif; "playground": BOMO document still
// being processed (to process or draft).
export type DuplicateSource = "refugies-info" | "playground";

// An ambiguous match counts as a duplicate until the editorial team decides.
export type DuplicateVerdict = "duplicate" | "ambiguous";

// Elements the duplicates agent compares between the RCO fiche and a candidate.
export type ComparedElement = "sponsor" | "location" | "title";

export type Similarity = "identical" | "close" | "different";

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
  similarity: Record<ComparedElement, Similarity>;
}

export interface ArbitrationReport {
  compliant: boolean;
  duplicate: boolean;
  /** False when the rules refused the fiche before the duplicate search */
  duplicatesChecked: boolean;
  duplicateSummary: string | null;
  criteria: ArbitrationCriterion[];
  duplicates: DuplicateMatch[];
  /** The RCO fiche side of the duplicate comparison */
  rcoValues: Record<ComparedElement, string>;
}

export const DUPLICATE_SOURCE_LABELS: Record<DuplicateSource, string> = {
  "refugies-info": "Refugies.info",
  playground: "BOMO",
};

export const DUPLICATE_VERDICT_LABELS: Record<DuplicateVerdict, string> = {
  duplicate: "Doublon",
  ambiguous: "Doublon possible",
};

export const COMPARED_ELEMENT_LABELS: Record<ComparedElement, string> = {
  sponsor: "Structure",
  location: "Localisation",
  title: "Titre",
};

export const COMPARED_ELEMENTS = Object.keys(
  COMPARED_ELEMENT_LABELS,
) as ComparedElement[];

// The editorial wording says "Valeur RI"; BOMO candidates get their own name.
export const comparedValueHeader = (source: DuplicateSource) =>
  `Valeur ${source === "playground" ? "BOMO" : "RI"}`;

export const SIMILARITY_LABELS: Record<Similarity, string> = {
  identical: "Identique",
  close: "Proche",
  different: "Différent",
};

// Older reports lack labels, duplicate list or RCO values: markdown fallback.
export const isArbitrationReport = (
  metadata: unknown,
): metadata is ArbitrationReport => {
  const report = metadata as Partial<ArbitrationReport> | null;
  return (
    Array.isArray(report?.duplicates) &&
    typeof report.rcoValues === "object" &&
    Array.isArray(report?.criteria) &&
    report.criteria.every((criterion) => typeof criterion.label === "string")
  );
};

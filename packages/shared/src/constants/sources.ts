// One external source, three identifiers:
// - "rco" / "di": `ingestion_runs.source` and the provider key in workflows;
// - "RCO" / "DI": `services.origin` SQL enum, which API wrote the row;
// - "carif-oref": Data Inclusion's own label for the data it receives from
//   Carif-Oref (RCO). The RCO provider writes the same `source` in its
//   documents so an RCO fiche keeps the history of its DI version.
export const CARIF_OREF_SOURCE = "carif-oref";

export type SourceSystem = "DI" | "RCO";

export const SOURCE_SYSTEM_LABELS: Record<SourceSystem, string> = {
  DI: "Data Inclusion",
  RCO: "RCO",
};

export const SOURCE_FILTER_OPTIONS: { label: string; value: SourceSystem }[] =
  Object.entries(SOURCE_SYSTEM_LABELS).map(([value, label]) => ({
    label,
    value: value as SourceSystem,
  }));

export const isSourceSystem = (value: unknown): value is SourceSystem =>
  typeof value === "string" &&
  Object.keys(SOURCE_SYSTEM_LABELS).includes(value);

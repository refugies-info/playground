export type IngestionSource = "di" | "rco";

// Only one source feeds the catalogue. Set INGESTION_SOURCE=di to fall back if RCO fails.
export const getIngestionSource = (): IngestionSource =>
  process.env.INGESTION_SOURCE?.trim().toLowerCase() === "di" ? "di" : "rco";

export type IngestionSource = "di" | "rco";

// Only one source feeds the catalogue. Switch back to "di" if RCO fails.
export const getIngestionSource = (): IngestionSource =>
  process.env.INGESTION_SOURCE === "rco" ? "rco" : "di";

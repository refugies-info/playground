// Keyed by the fiche's `services.origin` ("RCO"), not the ingestion run source key used in steps/ingestion/ingest-source.ts.
import { SOURCE_MODEL_HANDLE } from "@playground/shared-types";
import { arbitrateRcoRecord } from "./rco/arbitrate";
import { generateRcoMetadata } from "./rco/metadata";
import { generateRcoPlainLanguage } from "./rco/plain-language";

const RCO_EDITORIAL_SOURCE = {
  defaultModel: SOURCE_MODEL_HANDLE,
  arbitrate: arbitrateRcoRecord,
  generateMetadata: generateRcoMetadata,
  generatePlainLanguage: generateRcoPlainLanguage,
};

export type EditorialSource = typeof RCO_EDITORIAL_SOURCE;

// A Map, so inherited keys like "constructor" never resolve to a source.
const SOURCES_BY_ORIGIN = new Map<string, EditorialSource>([
  ["RCO", RCO_EDITORIAL_SOURCE],
]);

export const getEditorialSource = (
  origin: string | null | undefined,
): EditorialSource | undefined =>
  origin ? SOURCES_BY_ORIGIN.get(origin) : undefined;

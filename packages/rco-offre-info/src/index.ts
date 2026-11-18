export { fetchActionDetail } from "./api/action";
export { getRcoClientFromEnv } from "./api/client";
export { normalizeSession } from "./api/normalize";
export {
  applyAiDecisions,
  CRITERION_LABELS,
  checkCompliance,
  criteriaForAi,
  overallVerdict,
  toArbitrationDocument,
  type Verdict,
} from "./lheo/arbitrage/compliance-rules";
export {
  actionCities,
  actionDepartments,
  actionPostalCodes,
  type DuplicateCandidate,
  hasCertainDuplicate,
  type RiDispositif,
  toCandidate,
} from "./lheo/arbitrage/duplicate-candidates";
export {
  buildActionDocument,
  type RcoActionDocument,
  toSourceUrl,
} from "./lheo/document";
export {
  actionToMarkdown,
  withoutMarkdownBodyFields,
} from "./lheo/markdown";
export {
  METADATA_LABELS,
  type MetadataKey,
} from "./lheo/metadata/metadata-config";
export {
  type MappedField,
  mapMetadata,
  metadataKeysForAi,
  toMetadataDocument,
} from "./lheo/metadata/metadata-rules";
export {
  renderPlainLanguageFiche,
  toPlainLanguageDocument,
} from "./lheo/plain-language/plain-language-rules";
export type { RcoStructureDocument } from "./lheo/structure";
export { type RcoBatchResult, rcoProvider } from "./provider";

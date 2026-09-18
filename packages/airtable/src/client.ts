import { logger } from "@playground/shared-types";
import Airtable, { type FieldSet } from "airtable";

/**
 * Configures and returns an Airtable table handle.
 *
 * Mirrors karfur's connector pattern:
 * apps/server/src/connectors/airtable/airtable.ts
 *
 * Requires AIRTABLE_TOKEN and AIRTABLE_BASE_TRAD env vars.
 *
 * @param tableName - The Airtable table name (e.g., "SUIVI TRAD")
 * @returns Airtable table instance, or null if env vars are missing
 */
function getAirtableTranslationTable(tableName: string) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_TRAD;

  if (!token || !baseId) {
    logger.warn(
      "Missing AIRTABLE_TOKEN or AIRTABLE_BASE_TRAD env vars, skipping Airtable tracking",
    );
    return null;
  }

  return new Airtable({ apiKey: token }).base(baseId).table(tableName);
}

export type CreateAirtableRecordResult =
  | { sent: true }
  | { sent: false; error: string };

const MISSING_ENV_ERROR =
  "AIRTABLE_TRANSLATE_TABLE_NOT_FOUND - impossible de charger la table de traduction Airtable";

/**
 * Creates a record in an Airtable table.
 *
 * Uses the official Airtable npm package (same as karfur).
 * Non-blocking: reports errors but never throws.
 *
 * @param tableName - The Airtable table name (e.g., "SUIVI TRAD")
 * @param fields - The record fields to create
 * @returns The outcome, with the error message when the record was not created
 */
export async function createAirtableRecord(
  tableName: string,
  fields: Partial<FieldSet>,
): Promise<CreateAirtableRecordResult> {
  const table = getAirtableTranslationTable(tableName);

  if (!table) {
    return { sent: false, error: MISSING_ENV_ERROR };
  }

  try {
    await table.create([{ fields }], { typecast: true });
    logger.info({ tableName }, "[Airtable] Record created successfully");
    return { sent: true };
  } catch (error) {
    logger.error({ error, tableName }, "[Airtable] Failed to create record");
    return {
      sent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

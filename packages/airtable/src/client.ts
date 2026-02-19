import { logger } from "@playground/shared-types";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

/**
 * Creates a record in an Airtable table.
 *
 * Uses the Airtable REST API directly with fetch (no npm dependency needed).
 * Requires AIRTABLE_TOKEN and AIRTABLE_BASE_TRAD env vars.
 *
 * @param tableName - The Airtable table name (e.g., "SUIVI TRAD")
 * @param fields - The record fields to create
 * @returns true if successful, false otherwise
 */
export async function createAirtableRecord(
  tableName: string,
  fields: Record<string, unknown>,
): Promise<boolean> {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_TRAD;

  if (!token || !baseId) {
    logger.warn(
      "Missing AIRTABLE_TOKEN or AIRTABLE_BASE_TRAD env vars, skipping Airtable tracking",
    );
    return false;
  }

  const url = `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(tableName)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [{ fields }],
        typecast: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error(
        { status: response.status, error: errorData, tableName },
        "[Airtable] Failed to create record",
      );
      return false;
    }

    logger.info({ tableName }, "[Airtable] Record created successfully");
    return true;
  } catch (error) {
    logger.error(
      { error, tableName },
      "[Airtable] Unexpected error creating record",
    );
    return false;
  }
}

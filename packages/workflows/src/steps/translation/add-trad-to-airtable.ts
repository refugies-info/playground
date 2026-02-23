import { countMarkdownWords, createAirtableRecord } from "@playground/airtable";
import { extractTitleFromMarkdown, logger } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";

/**
 * Airtable field schema for translation tracking.
 * Matches the "SUIVI TRAD" table in the Airtable base.
 */
type AirtableTradFields = {
  "Quel traducteur ?": string;
  Dispositif: string;
  Lien: string;
  Langues: string;
  "Travail effectué": "à revoir" | "à traduire";
  "Nb mots": number;
};

/**
 * Result of the Airtable tracking step.
 */
export interface AddTradToAirtableResult {
  sent: boolean;
}

const AIRTABLE_TABLE_NAME = "SUIVI TRAD";

/**
 * Sends translation tracking data to Airtable for billing purposes.
 *
 * This step:
 * 1. Fetches the FR editorial record content
 * 2. Extracts the title and counts words from the FR markdown
 * 3. Looks up the published URL (if available)
 * 4. Creates a record in the Airtable "SUIVI TRAD" table
 *
 * This step is **non-blocking**: it never fails the parent workflow.
 * If Airtable is unreachable or env vars are missing, it logs a warning and returns success.
 *
 * Inspired by karfur's `addTradToAirtable` in traductions.service.ts.
 *
 * @param editorialRecordId - The source editorial record ID (for FR content)
 * @param language - The target language code (e.g., "en", "ar")
 * @param userId - The user ID of the person who triggered the translation (resolved to username)
 * @returns Result indicating if the record was sent
 */
export async function addTradToAirtableStep(
  editorialRecordId: string,
  language: string,
  userId?: string,
): Promise<StepResult<AddTradToAirtableResult>> {
  "use step";

  try {
    const supabase = getSupabaseClient();

    // 0. Resolve translator name from user profile
    let translatorName = "IA";
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, email")
        .eq("id", userId)
        .single();

      if (profile?.username) {
        translatorName = profile.username;
      } else if (profile?.email) {
        translatorName = profile.email;
      }
    }

    // 1. Fetch FR content from editorial record
    const { data: editorialRecord, error: fetchError } = await supabase
      .from("editorial_records")
      .select("id, markdown")
      .eq("id", editorialRecordId)
      .single();

    if (fetchError || !editorialRecord?.markdown) {
      logger.warn(
        { editorialRecordId, error: fetchError },
        "[addTradToAirtable] Could not fetch editorial record, skipping Airtable tracking",
      );
      return { success: true, data: { sent: false } };
    }

    // 2. Extract title and count words from FR content
    const title =
      (await extractTitleFromMarkdown(editorialRecord.markdown)) ||
      "Sans titre";
    const wordCount = countMarkdownWords(editorialRecord.markdown);

    // 3. Build the link to the fiche
    // Try to find the published remote_id to construct the URL
    let lien = "";
    const baseUrl = process.env.RI_BASE_URL || "https://refugies.info";
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");

    const { data: publication } = await supabase
      .from("publication_records")
      .select("remote_id")
      .eq("editorial_record_id", editorialRecordId)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (publication?.remote_id) {
      lien = `${cleanBaseUrl}/fr/dispositif/${publication.remote_id}`;
    }

    // 4. Create Airtable record
    const fields: AirtableTradFields = {
      "Quel traducteur ?": translatorName,
      Dispositif: title,
      Lien: lien,
      Langues: language.toUpperCase(),
      "Travail effectué": "à traduire",
      "Nb mots": wordCount,
    };

    const sent = await createAirtableRecord(AIRTABLE_TABLE_NAME, fields);

    return { success: true, data: { sent } };
  } catch (error) {
    // Non-blocking: log the error but don't fail the workflow
    logger.error(
      error,
      "[addTradToAirtable] Unexpected error, skipping Airtable tracking",
    );
    return { success: true, data: { sent: false } };
  }
}

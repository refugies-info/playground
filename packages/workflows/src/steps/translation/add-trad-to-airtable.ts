import { countMarkdownWords, createAirtableRecord } from "@playground/airtable";
import { extractTitleFromMarkdown, logger } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { notifyAirtableError } from "../common/slack";
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
  Type: "demarche" | "dispositif";
  "Travail effectué": "à revoir" | "à traduire";
  "Nb mots": number;
};

/**
 * Input for the Airtable tracking step.
 */
export interface AddTradToAirtableInput {
  translationId: string;
  publicationRecordId: string;
  remoteId: string;
  publisherId: string;
  publisherEmail: string;
}

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
 * @param input - The published translation context
 * @returns Result indicating if the record was sent
 */
export async function addTradToAirtableStep(
  input: AddTradToAirtableInput,
): Promise<StepResult<AddTradToAirtableResult>> {
  "use step";

  const {
    translationId,
    publicationRecordId,
    remoteId,
    publisherId,
    publisherEmail,
  } = input;

  try {
    const supabase = getSupabaseClient();

    // 1. Fetch the published translation record
    const { data: translation, error: translationError } = await supabase
      .from("translation_records")
      .select("id, language, editorial_record_id")
      .eq("id", translationId)
      .single();

    if (translationError || !translation) {
      logger.warn(
        { translationId, error: translationError },
        "[addTradToAirtable] Could not fetch translation record, skipping Airtable tracking",
      );
      return { success: true, data: { sent: false } };
    }

    // 2. Bill the first publication only. Like karfur, which skips
    const { data: previousPublication } = await supabase
      .from("publication_records")
      .select("id")
      .eq("translation_record_id", translationId)
      .eq("status", "published")
      .neq("id", publicationRecordId)
      .limit(1)
      .maybeSingle();

    if (previousPublication) {
      logger.info(
        { translationId, language: translation.language },
        "[addTradToAirtable] Translation already published, skipping duplicate Airtable entry",
      );
      return { success: true, data: { sent: false } };
    }

    // 3. The billed translator is whoever clicked "publier" — same rule as
    // karfur, which passes the publishing expert's username to Airtable.
    const translatorName = await resolvePublisherName(
      supabase,
      publisherId,
      publisherEmail,
    );

    // 4. Fetch FR content from the editorial record (words are billed on the FR source)
    const { data: editorialRecord, error: fetchError } = await supabase
      .from("editorial_records")
      .select("id, markdown")
      .eq("id", translation.editorial_record_id)
      .single();

    if (fetchError || !editorialRecord?.markdown) {
      logger.warn(
        {
          editorialRecordId: translation.editorial_record_id,
          error: fetchError,
        },
        "[addTradToAirtable] Could not fetch editorial record, skipping Airtable tracking",
      );
      return { success: true, data: { sent: false } };
    }

    const title =
      (await extractTitleFromMarkdown(editorialRecord.markdown)) ||
      "Sans titre";
    const wordCount = countMarkdownWords(editorialRecord.markdown);

    // 5. Build the link to the fiche
    const baseUrl = process.env.RI_BASE_URL || "https://refugies.info";
    const lien = `${baseUrl.replace(/\/$/, "")}/fr/dispositif/${remoteId}`;

    // 6. Create Airtable record
    const fields: AirtableTradFields = {
      "Quel traducteur ?": translatorName,
      Dispositif: title,
      Lien: lien,
      Langues: translation.language.toUpperCase(),
      // The playground only ingests French courses, which are dispositifs
      Type: "dispositif",
      // The AI writes the first translation, so a human only ever reviews it
      "Travail effectué": "à revoir",
      "Nb mots": wordCount,
    };

    const result = await createAirtableRecord(AIRTABLE_TABLE_NAME, fields);

    if (!result.sent) {
      logger.error(
        {
          translationId,
          title,
          language: translation.language,
          error: result.error,
        },
        "[addTradToAirtable] Airtable tracking row NOT created",
      );
      await notifyAirtableError({
        title,
        language: translation.language,
        errorMessage: result.error,
        publishedUrl: lien,
      });
      return { success: true, data: { sent: false } };
    }

    logger.info(
      {
        translationId,
        title,
        language: translation.language,
        translator: translatorName,
        wordCount,
        lien,
      },
      "[addTradToAirtable] Airtable tracking row created",
    );

    return { success: true, data: { sent: true } };
  } catch (error) {
    // Non-blocking: log the error but don't fail the workflow
    logger.error(
      error,
      "[addTradToAirtable] Unexpected error, skipping Airtable tracking",
    );
    return { success: true, data: { sent: false } };
  }
}

/**
 * Returns the display name of the user who published the translation.
 *
 * @param supabase - Supabase client
 * @param publisherId - The publishing user ID
 * @param publisherEmail - Their session email, used as a fallback
 * @returns The username, the email otherwise, or "Inconnu" as a last resort
 */
async function resolvePublisherName(
  supabase: ReturnType<typeof getSupabaseClient>,
  publisherId: string,
  publisherEmail: string,
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, email")
    .eq("id", publisherId)
    .maybeSingle();

  return profile?.username || profile?.email || publisherEmail || "Inconnu";
}

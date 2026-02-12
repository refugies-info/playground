import {
  createLettaClient,
  findOrCreateConversation,
  sendMessageToConversation,
  TRANSLATE_SLASH_COMMAND,
} from "@playground/agents";
import { LETTA_AGENTS_CONFIG, logger } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";

/**
 * Result of generating a translation.
 */
export interface GenerateTranslationResult {
  translationRecordId: string;
  language: string;
  generated: boolean;
}

/**
 * Generates a translation for a specific language using a Letta agent.
 *
 * This step:
 * 1. Checks if a Letta agent is configured for the language
 * 2. Fetches the source editorial record content
 * 3. Sends the content to the agent
 * 4. Updates the translation record with the agent's response
 *
 * @param editorialRecordId - The source editorial record ID
 * @param language - The target language code
 * @param workflowId - The workflow ID (for context/logging)
 * @returns Result indicating if translation was generated
 */
export async function generateTranslationStep(
  editorialRecordId: string,
  language: string,
  workflowId: string,
): Promise<StepResult<GenerateTranslationResult>> {
  "use step";

  const agentId = LETTA_AGENTS_CONFIG[language];

  if (!agentId) {
    logger.info(
      { language, workflowId },
      "No Letta agent configured for language, skipping generation",
    );
    return {
      success: true,
      data: {
        translationRecordId: "",
        language,
        generated: false,
      },
    };
  }

  try {
    const supabase = getSupabaseClient();

    // 1. Fetch source content from editorial record
    const { data: editorialRecord, error: fetchError } = await supabase
      .from("editorial_records")
      .select("id, markdown, metadata")
      .eq("id", editorialRecordId)
      .single();

    if (fetchError || !editorialRecord) {
      logger.error(
        { fetchError, editorialRecordId },
        "Failed to fetch editorial record for translation generation",
      );
      return {
        success: false,
        error: "Failed to fetch source editorial record",
      };
    }

    // 2. Find or create the translation record
    let { data: translationRecord, error: trFetchError } = await supabase
      .from("translation_records")
      .select("id")
      .eq("editorial_record_id", editorialRecordId)
      .eq("language", language)
      .maybeSingle();

    if (trFetchError) {
      logger.error(trFetchError, "Error fetching translation record");
      return { success: false, error: "Error fetching translation record" };
    }

    if (!translationRecord) {
      // Create if missing (fallback)
      const { data: newTr, error: createError } = await supabase
        .from("translation_records")
        .insert({
          editorial_record_id: editorialRecordId,
          language,
          work_status: "to_process",
          workflow_id: workflowId,
        })
        .select("id")
        .single();

      if (createError || !newTr) {
        logger.error(
          createError,
          "Failed to create missing translation record",
        );
        return {
          success: false,
          error: "Failed to create translation record during generation",
        };
      }
      translationRecord = newTr;
    }

    // 3. Call Letta Agent
    logger.info(
      { language, agentId, workflowId },
      "Calling Letta agent for translation",
    );

    const client = createLettaClient();
    const conversationName = `translation-${editorialRecordId}-${language}`;

    let conversationId: string;
    try {
      conversationId = await findOrCreateConversation(
        client,
        agentId,
        conversationName,
      );
    } catch (convError) {
      logger.error(
        { convError, agentId, language },
        "Failed to find or create Letta conversation",
      );
      return {
        success: false,
        error: "Failed to initialize translation conversation",
      };
    }

    // Construct prompt/content for the agent
    const contentToTranslate = `${TRANSLATE_SLASH_COMMAND}\n${editorialRecord.markdown || ""}`;

    if (!editorialRecord.markdown) {
      logger.warn(
        { editorialRecordId },
        "Source markdown is empty, skipping AI translation",
      );
      return {
        success: true,
        data: {
          translationRecordId: translationRecord.id,
          language,
          generated: false,
        },
      };
    }

    // We assume the agent is instructed to translate input text.
    // We send just the markdown.
    let translatedContent = "";
    try {
      const result = await sendMessageToConversation(
        client,
        conversationId,
        contentToTranslate,
      );
      translatedContent = result.content;
    } catch (agentError) {
      logger.error(
        { agentError, agentId, language, conversationId },
        "Letta agent call failed",
      );
      return {
        success: false,
        error: `Letta agent call failed for language ${language}`,
      };
    }

    if (!translatedContent) {
      logger.error(
        { agentId, language, conversationId },
        "Received empty response from Letta agent",
      );
      return { success: false, error: "Empty response from AI agent" };
    }

    // 4. Update translation record
    const { error: updateError } = await supabase
      .from("translation_records")
      .update({
        markdown: translatedContent,
        updated_at: new Date().toISOString(),
        work_status: "to_process",
      })
      .eq("id", translationRecord.id);

    if (updateError) {
      logger.error(updateError, "Failed to save generated translation");
      return { success: false, error: "Failed to save generated translation" };
    }

    logger.info(
      { translationRecordId: translationRecord.id, language },
      "Successfully generated and saved translation",
    );

    return {
      success: true,
      data: {
        translationRecordId: translationRecord.id,
        language,
        generated: true,
      },
    };
  } catch (error) {
    logger.error(error, "Unexpected error in generateTranslationStep");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

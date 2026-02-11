import { LETTA_AGENTS_CONFIG } from "@playground/shared-types";
import type { StepResult } from "../../types";

/**
 * Result of getting available translation agents.
 */
export interface GetAvailableTranslationAgents {
  languages: string[];
}

/**
 * Gets the list of languages that have a configured Letta agent.
 *
 * This step is needed because workflows cannot directly import configuration
 * that might depend on Node.js environment variables or modules (like process.env or logger).
 *
 * @returns Result with list of language codes
 */
export async function getAvailableTranslationAgentsStep(): Promise<
  StepResult<GetAvailableTranslationAgents>
> {
  "use step";

  const languages = Object.keys(LETTA_AGENTS_CONFIG).filter(
    (lang) => !!LETTA_AGENTS_CONFIG[lang],
  );

  return {
    success: true,
    data: {
      languages,
    },
  };
}

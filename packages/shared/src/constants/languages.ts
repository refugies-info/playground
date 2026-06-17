export const LANGUAGES = [
  {
    code: "fr",
    name: "French",
    label: "Français",
    country: "fr",
    isRtl: false,
  },
  {
    code: "en",
    name: "English",
    label: "Anglais",
    country: "gb",
    isRtl: false,
  },
  {
    code: "ar",
    name: "Arabic",
    label: "Arabe",
    country: "ae",
    isRtl: true,
  },
  {
    code: "ps",
    name: "Pashto",
    label: "Pachto",
    country: "af",
    isRtl: true,
  },
  {
    code: "fa",
    name: "Persian/Dari",
    label: "Persan/Dari",
    country: "ir",
    isRtl: true,
  },
  {
    code: "ru",
    name: "Russian",
    label: "Russe",
    country: "ru",
    isRtl: false,
  },
  {
    code: "ti",
    name: "Tigrinya",
    label: "Tigrinya",
    country: "er",
    isRtl: false,
  },
  {
    code: "uk",
    name: "Ukrainian",
    label: "Ukrainien",
    country: "ua",
    isRtl: false,
  },
] as const;

export function isRtlLanguage(lang: string | undefined): boolean {
  if (!lang) return false;
  return LANGUAGES.find((l) => l.code === lang)?.isRtl ?? false;
}

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const LANGUAGE_TO_COUNTRY: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.country]),
);

export const LANGUAGE_NAMES: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.label]),
);

/**
 * Configuration for Letta Agents by language.
 * Maps language codes to their respective Agent IDs.
 */
export const LETTA_AGENTS_CONFIG: Record<string, string> = {
  ar:
    process.env.LETTA_AGENT_AR || "agent-9b1e38aa-be9c-4f18-8ada-685d6ee1ce86",
  uk:
    process.env.LETTA_AGENT_UK || "agent-add8dcc9-5d2e-4461-aa00-4bfcfe192b59",
  ru:
    process.env.LETTA_AGENT_RU || "agent-4d7f539b-797b-4b5c-9755-cdffec5cc9f7",
  fa:
    process.env.LETTA_AGENT_FA || "agent-09f186f2-c964-48a0-b43a-cd9f5f9cff26",
  ps:
    process.env.LETTA_AGENT_PS || "agent-42fb380d-5920-437f-b2f3-57d02af4c6a7",
  en:
    process.env.LETTA_AGENT_EN || "agent-d70a6911-8bba-4254-9daa-c810f0e3986a",
  ti:
    process.env.LETTA_AGENT_TI || "agent-f59e9249-874c-4a17-ba87-93bfcc7f3735",
};

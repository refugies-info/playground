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
    process.env.LETTA_AGENT_AR || "agent-c19d4b57-048c-48a7-8cdc-9609dab4b24b",
  uk:
    process.env.LETTA_AGENT_UK || "agent-add8dcc9-5d2e-4461-aa00-4bfcfe192b59",
  ru:
    process.env.LETTA_AGENT_RU || "agent-4d7f539b-797b-4b5c-9755-cdffec5cc9f7",
};

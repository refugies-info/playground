export const LANGUAGES = [
  { code: "fr", name: "French", label: "Français", country: "fr" },
  { code: "en", name: "English", label: "Anglais", country: "gb" },
  { code: "ar", name: "Arabic", label: "Arabe", country: "ae" },
  { code: "ps", name: "Pashto", label: "Pachto", country: "af" },
  { code: "fa", name: "Persian/Dari", label: "Persan/Dari", country: "ir" },
  { code: "ru", name: "Russian", label: "Russe", country: "ru" },
  { code: "ti", name: "Tigrinya", label: "Tigrinya", country: "er" },
  { code: "uk", name: "Ukrainian", label: "Ukrainien", country: "ua" },
] as const;

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
  // Add other languages here as needed
};

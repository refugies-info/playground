export const LANGUAGES = [
  { code: "fr", name: "French", label: "Français", country: "fr" },
  { code: "en", name: "English", label: "Anglais", country: "gb" },
  { code: "ar", name: "Arabic", label: "Arabe", country: "ae" },
  { code: "ps", name: "Pashto", label: "Pachto", country: "af" },
  { code: "fa", name: "Persian/Dari", label: "Persan/Dari", country: "ir" },
  { code: "ru", name: "Russian", label: "Russe", country: "ru" },
  { code: "ti", name: "Tigrinya", label: "Tigrinya", country: "er" },
  { code: "uk", name: "Ukrainian", label: "Ukrainien", country: "ua" },
  { code: "so", name: "Somali", label: "Somali", country: "so" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const LANGUAGE_TO_COUNTRY: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.country]),
);

export const LANGUAGE_NAMES: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.label]),
);

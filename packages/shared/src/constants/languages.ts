export const LANGUAGES = [
  { code: "en", name: "English", label: "Anglais" },
  { code: "ar", name: "Arabic", label: "Arabe" },
  { code: "ps", name: "Pashto", label: "Pachto" },
  { code: "fa", name: "Persian/Dari", label: "Persan/Dari" },
  { code: "ru", name: "Russian", label: "Russe" },
  { code: "ti", name: "Tigrinya", label: "Tigrinya" },
  { code: "uk", name: "Ukrainian", label: "Ukrainien" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

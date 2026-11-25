import {
  RI_DEPARTMENTS,
  type WidgetConfigFilters,
} from "@playground/shared-types";

type FilterValue<Key extends keyof WidgetConfigFilters> = NonNullable<
  WidgetConfigFilters[Key]
>[number];

interface Option<Value extends string> {
  value: Value;
  label: string;
}

export const CONTENT_TYPE_OPTIONS: readonly Option<
  FilterValue<"contentTypes">
>[] = [
  { value: "demarche", label: "Démarches" },
  { value: "dispositif", label: "Dispositifs" },
  { value: "online", label: "Ressources en ligne" },
];

export const STATUS_OPTIONS: readonly Option<FilterValue<"statuses">>[] = [
  { value: "asile", label: "Demandeur d’asile" },
  { value: "refugie", label: "Réfugiés statutaire" },
  { value: "apatride", label: "Apatrides" },
  { value: "temporaire", label: "Bénéficiaires de la protection temporaire" },
  { value: "subsidiaire", label: "Bénéficiaires de la protection subsidiaire" },
  { value: "french", label: "Citoyens français" },
];

export const PUBLIC_OPTIONS: readonly Option<FilterValue<"publics">>[] = [
  { value: "family", label: "Familles et enfants" },
  { value: "women", label: "Femmes" },
  { value: "youths", label: "Jeunes" },
  { value: "senior", label: "Séniors" },
  { value: "gender", label: "Minorités de genre" },
];

export const AGE_OPTIONS: readonly Option<FilterValue<"ages">>[] = [
  { value: "-18", label: "Moins de 18 ans" },
  { value: "18-25", label: "Entre 18 et 25 ans" },
  { value: "+25", label: "Plus de 25 ans" },
];

export const FRENCH_LEVEL_OPTIONS: readonly Option<
  FilterValue<"frenchLevels">
>[] = [
  { value: "alpha", label: "Alpha" },
  { value: "a", label: "Débutant A1/A2" },
  { value: "b", label: "Intermédiaire B1/B2" },
  { value: "c", label: "Avancé C1/C2" },
];

export const LANGUAGE_OPTIONS: readonly Option<FilterValue<"languages">>[] = [
  { value: "en", label: "Anglais" },
  { value: "ar", label: "Arabe" },
  { value: "ps", label: "Pachto" },
  { value: "fa", label: "Persan/Dari" },
  { value: "ru", label: "Russe" },
  { value: "ti", label: "Tigrinya" },
  { value: "uk", label: "Ukrainien" },
];

const FILTER_KEYS = [
  "contentTypes",
  "departments",
  "themes",
  "needs",
  "publics",
  "statuses",
  "frenchLevels",
  "ages",
  "languages",
] as const satisfies readonly (keyof WidgetConfigFilters)[];

export const toggleValue = <Value>(
  values: readonly Value[] | undefined,
  value: Value,
): Value[] =>
  values?.includes(value)
    ? values.filter((current) => current !== value)
    : [...(values ?? []), value];

export const normalizeFilters = (
  filters: WidgetConfigFilters,
): WidgetConfigFilters =>
  Object.fromEntries(FILTER_KEYS.map((key) => [key, filters[key] ?? []]));

const normalizeForSearch = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const DEPARTMENT_NAMES = RI_DEPARTMENTS.map((department) =>
  department.replace(/^\w+ - /, ""),
).filter((name) => name !== "Saint-Pierre-et-Miquelon");

export const searchDepartments = (text: string): string[] => {
  const query = normalizeForSearch(text);
  return DEPARTMENT_NAMES.filter((name) =>
    normalizeForSearch(name).includes(query),
  );
};

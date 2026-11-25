import type {
  ListWidgetConfigFields,
  RiDispositifSummary,
  ThumbnailWidgetConfigFields,
  WidgetConfigFields,
  WidgetConfigFilterBarOption,
  WidgetConfigFilters,
  WidgetConfigPageSize,
  WidgetConfigSortOption,
  WidgetConfigType,
  WidgetConfigUpdateInput,
} from "@playground/shared-types";
import { normalizeFilters } from "./widget-filters";

export const MAX_WIDGET_FIELD_LENGTH = 50;
export const MAX_EXTERNAL_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 300;

export const PAGE_SIZE_OPTIONS: readonly WidgetConfigPageSize[] = [4, 8, 12];
export const DEFAULT_PAGE_SIZE: WidgetConfigPageSize = 12;

export const SORT_OPTIONS: readonly {
  value: WidgetConfigSortOption;
  label: string;
}[] = [
  { value: "date", label: "Date de mise à jour" },
  { value: "views", label: "Popularité" },
];

/** The "Configuration et accès" section, common to every widget type. */
export interface WidgetConfigurationValues {
  internalTitle: string;
  structureName: string;
  authorizedDomains: string[];
}

export type ThumbnailFormValues = WidgetConfigurationValues;

const LIST_DRAFT_DEFAULTS: Omit<
  ListWidgetConfigFields,
  keyof ThumbnailWidgetConfigFields
> = {
  displayDescription: true,
  filters: {},
  selectedDispositifIds: [],
  excludedDispositifIds: [],
  pageSize: DEFAULT_PAGE_SIZE,
  sortBy: "date",
  displayShareModule: false,
  displayFilterBar: false,
  filterBarOptions: [
    "keyword",
    "location",
    "theme",
    "status",
    "public",
    "age",
    "frenchLevel",
    "language",
  ],
};

const HOSTNAME =
  /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const URL_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//;
const DISPOSITIF_ID = /^[0-9a-f]{24}$/i;

/** "https://Exemple.org/page" → "exemple.org"; null when it is not a domain name. */
export const normalizeDomain = (input: string): string | null => {
  const host = input
    .trim()
    .toLowerCase()
    .replace(URL_SCHEME, "")
    .split(/[/?#]/)[0]
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");
  return HOSTNAME.test(host) ? host : null;
};

export const isDispositifId = (text: string) => DISPOSITIF_ID.test(text.trim());

export const getDispositifTitle = ({
  titreInformatif,
  titreMarque,
}: RiDispositifSummary) => titreInformatif || titreMarque || "Sans titre";

const toThumbnailContentFields = (dispositif: RiDispositifSummary | null) =>
  dispositif
    ? {
        externalTitle: getDispositifTitle(dispositif),
        dispositifId: dispositif.id,
      }
    : {};

export const buildThumbnailUpdate = (
  { internalTitle, structureName, authorizedDomains }: ThumbnailFormValues,
  dispositif: RiDispositifSummary | null,
): WidgetConfigUpdateInput => ({
  internalTitle: internalTitle.trim(),
  structureName: structureName.trim(),
  authorizedDomains,
  ...toThumbnailContentFields(dispositif),
});

export const buildWidgetDraft = (
  type: WidgetConfigType,
  { title, structureName }: { title: string; structureName: string },
): WidgetConfigFields => {
  const common = {
    status: "active" as const,
    internalTitle: title.trim(),
    structureName: structureName.trim(),
    authorizedDomains: [],
    externalTitle: title.trim(),
  };
  if (type === "thumbnail") return { type, ...common };
  return { type, ...common, ...LIST_DRAFT_DEFAULTS };
};

export const hasThumbnailChanges = (
  initial: { values: ThumbnailFormValues; dispositifId: string | null },
  current: { values: ThumbnailFormValues; dispositifId: string | null },
) =>
  initial.dispositifId !== current.dispositifId ||
  initial.values.internalTitle !== current.values.internalTitle ||
  initial.values.structureName !== current.values.structureName ||
  initial.values.authorizedDomains.join("\n") !==
    current.values.authorizedDomains.join("\n");

export interface ListFormValues extends WidgetConfigurationValues {
  externalTitle: string;
  displayDescription: boolean;
  description: string;
  filters: WidgetConfigFilters;
  selectedDispositifs: RiDispositifSummary[];
  excludedDispositifs: RiDispositifSummary[];
  pageSize: WidgetConfigPageSize;
  displayShareModule: boolean;
  displayFilterBar: boolean;
  filterBarOptions: WidgetConfigFilterBarOption[];
  sortBy: WidgetConfigSortOption;
}

export const FILTER_BAR_CRITERIA: readonly {
  option: WidgetConfigFilterBarOption;
  label: string;
  fixedBy?: keyof WidgetConfigFilters;
}[] = [
  { option: "keyword", label: "Recherche par mot-clé" },
  { option: "location", label: "Localisation", fixedBy: "departments" },
  { option: "theme", label: "Thème", fixedBy: "themes" },
  { option: "public", label: "Public spécifique", fixedBy: "publics" },
  { option: "status", label: "Statut", fixedBy: "statuses" },
  {
    option: "frenchLevel",
    label: "Niveau de français",
    fixedBy: "frenchLevels",
  },
  { option: "age", label: "Âge", fixedBy: "ages" },
  { option: "language", label: "Traduit en", fixedBy: "languages" },
];

export const isFilterBarOptionFixed = (
  option: WidgetConfigFilterBarOption,
  filters: WidgetConfigFilters,
) => {
  const fixedBy = FILTER_BAR_CRITERIA.find(
    (criterion) => criterion.option === option,
  )?.fixedBy;
  return fixedBy !== undefined && (filters[fixedBy]?.length ?? 0) > 0;
};

export const getActiveFilterBarOptions = (
  options: WidgetConfigFilterBarOption[],
  filters: WidgetConfigFilters,
) => options.filter((option) => !isFilterBarOptionFixed(option, filters));

export const buildListUpdate = (
  values: ListFormValues,
): WidgetConfigUpdateInput => ({
  internalTitle: values.internalTitle.trim(),
  structureName: values.structureName.trim(),
  authorizedDomains: values.authorizedDomains,
  externalTitle: values.externalTitle.trim(),
  displayDescription: values.displayDescription,
  ...(values.displayDescription && { description: values.description.trim() }),
  filters: normalizeFilters(values.filters),
  selectedDispositifIds: values.selectedDispositifs.map(({ id }) => id),
  excludedDispositifIds: values.excludedDispositifs.map(({ id }) => id),
  pageSize: values.pageSize,
  displayShareModule: values.displayShareModule,
  displayFilterBar: values.displayFilterBar,
  filterBarOptions: getActiveFilterBarOptions(
    values.filterBarOptions,
    values.filters,
  ),
  sortBy: values.sortBy,
});

export const hasListChanges = (
  initial: ListFormValues,
  current: ListFormValues,
) => JSON.stringify(initial) !== JSON.stringify(current);

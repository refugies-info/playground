import type {
  ListWidgetConfigFields,
  RiDispositifSummary,
  ThumbnailWidgetConfigFields,
  WidgetConfigFields,
  WidgetConfigType,
  WidgetConfigUpdateInput,
} from "@playground/shared-types";

export const MAX_WIDGET_FIELD_LENGTH = 50;

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
  pageSize: 8,
  sortBy: "date",
  displayShareModule: true,
  displayFilterBar: true,
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

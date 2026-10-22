export type WidgetConfigStatus = "active" | "inactive";
export type WidgetConfigType = "list" | "thumbnail";
export type WidgetConfigPageSize = 4 | 8 | 12;
export type WidgetConfigSortOption = "date" | "views" | "theme" | "location";
export type WidgetConfigFilterBarOption =
  | "keyword"
  | "location"
  | "theme"
  | "public"
  | "status"
  | "frenchLevel"
  | "age"
  | "language";

/**
 * Pre-selected filters. A missing or empty category means "no filter";
 * values of a category are OR-ed, categories are AND-ed.
 */
export interface WidgetConfigFilters {
  contentTypes?: ("dispositif" | "demarche")[];
  departments?: string[];
  themes?: string[];
  needs?: string[];
  publics?: ("family" | "women" | "youths" | "senior" | "gender")[];
  statuses?: (
    | "asile"
    | "refugie"
    | "subsidiaire"
    | "temporaire"
    | "apatride"
    | "french"
  )[];
  frenchLevels?: ("alpha" | "a" | "b" | "c")[];
  ages?: ("-18" | "18-25" | "+25")[];
  languages?: ("fr" | "en" | "uk" | "ti" | "ar" | "ps" | "ru" | "fa")[];
}

export interface WidgetConfigFields {
  internalTitle: string;
  type: WidgetConfigType;
  structureName: string;
  authorizedDomains: string[];
  externalTitle: string;
  description?: string;
  displayDescription: boolean;
  filters: WidgetConfigFilters;
  selectedDispositifIds: string[];
  excludedDispositifIds: string[];
  pageSize: WidgetConfigPageSize;
  sortBy: WidgetConfigSortOption;
  displayShareModule: boolean;
  displayFilterBar: boolean;
  filterBarOptions: WidgetConfigFilterBarOption[];
  status: WidgetConfigStatus;
}

export type WidgetConfigUpdateInput = Partial<WidgetConfigFields>;

export interface WidgetConfig extends WidgetConfigFields {
  _id: string;
  publicId: string;
  statusUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type WidgetConfigSummary = Pick<
  WidgetConfig,
  | "_id"
  | "publicId"
  | "internalTitle"
  | "type"
  | "status"
  | "structureName"
  | "updatedAt"
>;

export interface CreatedWidgetConfigResponse {
  id: string;
  publicId: string;
}

export interface RiDispositifSummary {
  id: string;
  type: "dispositif" | "demarche";
  status: string;
  titreInformatif?: string;
  titreMarque?: string;
  sponsorName?: string;
}

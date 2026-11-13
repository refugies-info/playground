import type {
  WidgetConfig,
  WidgetConfigFields,
  WidgetConfigFilters,
  WidgetConfigSummary,
  WidgetConfigType,
} from "@playground/shared-types";
import type { TagStatus } from "@playground/ui/primitives";
import { getQueryParam } from "./search-params";

const INACTIVITY_DELAY_IN_DAYS = 3;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type WidgetDisplayedStatus = "active" | "inactive" | "disabled" | "none";

export const WIDGET_LIST_VIEWS = [
  "all",
  "active",
  "inactive",
  "disabled",
] as const;
export type WidgetListView = (typeof WIDGET_LIST_VIEWS)[number];

export const WIDGET_SORT_FIELDS = [
  "status",
  "since",
  "title",
  "structure",
  "type",
  "createdAt",
] as const;
export type WidgetSortField = (typeof WIDGET_SORT_FIELDS)[number];

export const WIDGET_VIEW_LABELS: Record<WidgetListView, string> = {
  all: "Tous",
  active: "Actifs",
  inactive: "Inactifs",
  disabled: "Désactivés",
};

export const WIDGET_TYPE_LABELS: Record<WidgetConfigType, string> = {
  list: "Liste",
  thumbnail: "Vignette",
};

/** In the order of the creation form. */
export const WIDGET_TYPE_OPTIONS = (["thumbnail", "list"] as const).map(
  (value) => ({ value, label: WIDGET_TYPE_LABELS[value] }),
);

/** A status without label is shown as a dash by the tag. */
export const WIDGET_STATUS_TAGS: Record<
  WidgetDisplayedStatus,
  { tag: TagStatus; label?: string }
> = {
  active: { tag: "publie", label: "Actif" },
  inactive: { tag: "attention", label: "Inactif" },
  disabled: { tag: "archive", label: "Désactivé" },
  none: { tag: "na" },
};

export interface WidgetRow extends WidgetConfigSummary {
  displayedStatus: WidgetDisplayedStatus;
  /** ISO date shown in the "Depuis le" column */
  since: string | null;
}

export interface WidgetListParams {
  view: WidgetListView;
  sortBy: WidgetSortField;
  sortOrder: "asc" | "desc";
  page: number;
}

const parseView = (value: string): WidgetListView =>
  WIDGET_LIST_VIEWS.find((view) => view === value) ?? "all";

const parseSortField = (value: string): WidgetSortField =>
  WIDGET_SORT_FIELDS.find((field) => field === value) ?? "createdAt";

export const parseWidgetListParams = (
  searchParams: Record<string, string | string[] | undefined>,
): WidgetListParams => ({
  view: parseView(getQueryParam(searchParams.view)),
  sortBy: parseSortField(getQueryParam(searchParams.sortBy)),
  sortOrder: getQueryParam(searchParams.sortOrder) === "asc" ? "asc" : "desc",
  page: Number.parseInt(getQueryParam(searchParams.page), 10) || 1,
});

export const getDisplayedStatus = (
  {
    status,
    lastTrafficAt,
  }: Pick<WidgetConfigSummary, "status" | "lastTrafficAt">,
  now: Date,
): WidgetDisplayedStatus => {
  if (status === "inactive") return "disabled";
  if (!lastTrafficAt) return "none";
  const daysWithoutTraffic =
    (now.getTime() - new Date(lastTrafficAt).getTime()) / DAY_IN_MS;
  return daysWithoutTraffic < INACTIVITY_DELAY_IN_DAYS ? "active" : "inactive";
};

/**
 * The start of the current activity period of an active widget needs more than
 * `lastTrafficAt` and is not available yet.
 */
const getSince = (
  widget: WidgetConfigSummary,
  displayedStatus: WidgetDisplayedStatus,
): string | null => {
  if (displayedStatus === "disabled") return widget.statusUpdatedAt;
  if (displayedStatus === "inactive") return widget.lastTrafficAt ?? null;
  return null;
};

export const toWidgetRow = (
  widget: WidgetConfigSummary,
  now: Date,
): WidgetRow => {
  const displayedStatus = getDisplayedStatus(widget, now);
  return {
    ...widget,
    displayedStatus,
    since: getSince(widget, displayedStatus),
  };
};

export const countByView = (
  rows: WidgetRow[],
): Record<WidgetListView, number> => ({
  all: rows.length,
  active: rows.filter((row) => row.displayedStatus === "active").length,
  inactive: rows.filter((row) => row.displayedStatus === "inactive").length,
  disabled: rows.filter((row) => row.displayedStatus === "disabled").length,
});

export const filterByView = (rows: WidgetRow[], view: WidgetListView) =>
  view === "all" ? rows : rows.filter((row) => row.displayedStatus === view);

const STATUS_ORDER: Record<WidgetDisplayedStatus, number> = {
  active: 0,
  inactive: 1,
  disabled: 2,
  none: 3,
};

const compareStrings = (a: string, b: string) => a.localeCompare(b, "fr");

const compareDates = (a: string | null, b: string | null) =>
  new Date(a ?? 0).getTime() - new Date(b ?? 0).getTime();

const COMPARATORS: Record<
  WidgetSortField,
  (a: WidgetRow, b: WidgetRow) => number
> = {
  status: (a, b) =>
    STATUS_ORDER[a.displayedStatus] - STATUS_ORDER[b.displayedStatus],
  since: (a, b) => compareDates(a.since, b.since),
  title: (a, b) => compareStrings(a.internalTitle, b.internalTitle),
  structure: (a, b) => compareStrings(a.structureName, b.structureName),
  type: (a, b) => compareStrings(a.type, b.type),
  createdAt: (a, b) => compareDates(a.createdAt, b.createdAt),
};

/** Widgets without a date always come last, whatever the order. */
export const sortRows = (
  rows: WidgetRow[],
  sortBy: WidgetSortField,
  sortOrder: "asc" | "desc",
) => {
  const direction = sortOrder === "asc" ? 1 : -1;
  const withoutDate = (row: WidgetRow) => sortBy === "since" && !row.since;
  return [...rows].sort((a, b) => {
    if (withoutDate(a) !== withoutDate(b)) return withoutDate(a) ? 1 : -1;
    return (
      direction * COMPARATORS[sortBy](a, b) || compareStrings(a._id, b._id)
    );
  });
};

export const paginate = <T>(rows: T[], page: number, pageSize: number) => {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  return {
    items: rows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    page: currentPage,
    totalPages,
  };
};

const FILTER_KEYS: (keyof WidgetConfigFilters)[] = [
  "contentTypes",
  "departments",
  "themes",
  "needs",
  "publics",
  "statuses",
  "frenchLevels",
  "ages",
  "languages",
];

const MAX_INTERNAL_TITLE_LENGTH = 150;
const DUPLICATE_SUFFIX = " (1)";

const pickFilters = (filters: WidgetConfigFilters = {}): WidgetConfigFilters =>
  Object.fromEntries(
    FILTER_KEYS.flatMap((key) => (filters[key] ? [[key, filters[key]]] : [])),
  );

export const buildDuplicate = (widget: WidgetConfig): WidgetConfigFields => {
  const common = {
    internalTitle: `${widget.internalTitle.slice(0, MAX_INTERNAL_TITLE_LENGTH - DUPLICATE_SUFFIX.length)}${DUPLICATE_SUFFIX}`,
    structureName: widget.structureName,
    authorizedDomains: widget.authorizedDomains,
    externalTitle: widget.externalTitle,
    status: "active" as const,
  };

  if (widget.type === "thumbnail") {
    return { ...common, type: "thumbnail", dispositifId: widget.dispositifId };
  }
  return {
    ...common,
    type: "list",
    ...(widget.description !== undefined && {
      description: widget.description,
    }),
    displayDescription: widget.displayDescription,
    filters: pickFilters(widget.filters),
    selectedDispositifIds: widget.selectedDispositifIds,
    excludedDispositifIds: widget.excludedDispositifIds,
    pageSize: widget.pageSize,
    sortBy: widget.sortBy,
    displayShareModule: widget.displayShareModule,
    displayFilterBar: widget.displayFilterBar,
    filterBarOptions: widget.filterBarOptions,
  };
};

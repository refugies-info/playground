import { canManageWidgets } from "@playground/shared-types";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canDeleteWidget, getDisplayedStatus } from "@/lib/widget-list";
import { fetchRiReferenceData } from "@/services/ri/reference-data";
import {
  getDispositifsByIdsAction,
  getWidgetConfigAction,
} from "@/services/widget-config-actions";
import { ListWidgetForm } from "../list-widget-form";
import { ThumbnailWidgetForm } from "../thumbnail-widget-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WidgetPage(props: PageProps) {
  const currentUser = await getCurrentUser();
  if (!canManageWidgets(currentUser.role)) redirect("/");

  const { id } = await props.params;
  const result = await getWidgetConfigAction(id);
  if (!result.success) {
    return (
      <div className="flex flex-col gap-4 p-10">
        <h1 className="text-[40px] font-bold leading-[1.2]">Widget</h1>
        <p role="alert">{result.error}</p>
      </div>
    );
  }

  const widget = result.data;
  const displayedStatus = getDisplayedStatus(widget, new Date());
  const isDeletable = canDeleteWidget(widget);

  if (widget.type === "list") {
    const [referenceData, dispositifs] = await Promise.all([
      fetchRiReferenceData(),
      getDispositifsByIdsAction([
        ...widget.selectedDispositifIds,
        ...widget.excludedDispositifIds,
      ]),
    ]);
    const dispositifsById = new Map(
      (dispositifs.success ? dispositifs.data : []).map((dispositif) => [
        dispositif.id,
        dispositif,
      ]),
    );
    const findDispositifs = (ids: string[]) =>
      ids.flatMap((id) => dispositifsById.get(id) ?? []);

    return (
      <ListWidgetForm
        themes={Object.entries(referenceData.themes).map(([value, label]) => ({
          value,
          label,
        }))}
        widgetId={widget._id}
        publicId={widget.publicId}
        displayedStatus={displayedStatus}
        isDeletable={isDeletable}
        widgetBaseUrl={process.env.WIDGET_BASE_URL}
        initialValues={{
          internalTitle: widget.internalTitle,
          structureName: widget.structureName,
          authorizedDomains: widget.authorizedDomains,
          externalTitle: widget.externalTitle,
          displayDescription: widget.displayDescription,
          description: widget.description ?? "",
          filters: widget.filters,
          selectedDispositifs: findDispositifs(widget.selectedDispositifIds),
          excludedDispositifs: findDispositifs(widget.excludedDispositifIds),
          pageSize: widget.pageSize,
          displayShareModule: widget.displayShareModule,
          displayFilterBar: widget.displayFilterBar,
          filterBarOptions: widget.filterBarOptions,
          sortBy: widget.sortBy,
        }}
      />
    );
  }

  const dispositifs = widget.dispositifId
    ? await getDispositifsByIdsAction([widget.dispositifId])
    : null;
  const dispositif = dispositifs?.success
    ? (dispositifs.data[0] ?? null)
    : null;

  return (
    <ThumbnailWidgetForm
      widgetId={widget._id}
      publicId={widget.publicId}
      displayedStatus={displayedStatus}
      isDeletable={isDeletable}
      widgetBaseUrl={process.env.WIDGET_BASE_URL}
      initialValues={{
        internalTitle: widget.internalTitle,
        structureName: widget.structureName,
        authorizedDomains: widget.authorizedDomains,
      }}
      initialDispositif={dispositif}
    />
  );
}

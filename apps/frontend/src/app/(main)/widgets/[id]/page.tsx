import { isAdmin } from "@playground/shared-types";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
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
  if (!isAdmin(currentUser.role)) redirect("/");

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

  if (widget.type === "list") {
    return (
      <ListWidgetForm
        widgetId={widget._id}
        publicId={widget.publicId}
        widgetBaseUrl={process.env.WIDGET_BASE_URL}
        initialValues={{
          internalTitle: widget.internalTitle,
          structureName: widget.structureName,
          authorizedDomains: widget.authorizedDomains,
          externalTitle: widget.externalTitle,
          displayDescription: widget.displayDescription,
          description: widget.description ?? "",
          filters: widget.filters,
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

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  countByView,
  filterByView,
  paginate,
  parseWidgetListParams,
  sortRows,
  toWidgetRow,
} from "@/lib/widget-list";
import { listWidgetConfigsAction } from "@/services/widget-config-actions";
import { WidgetsList } from "./widgets-list";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const PAGE_SIZE = 50;

export default async function WidgetsPage(props: PageProps) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== "admin") redirect("/");

  const { view, sortBy, sortOrder, page } = parseWidgetListParams(
    await props.searchParams,
  );

  const result = await listWidgetConfigsAction();
  if (!result.success) {
    return (
      <div className="w-full flex flex-col gap-4">
        <h1 className="text-[40px] font-bold leading-[1.2]">Widgets</h1>
        <p role="alert">{result.error}</p>
      </div>
    );
  }

  const now = new Date();
  const rows = result.data.map((widget) => toWidgetRow(widget, now));
  const visibleRows = sortRows(filterByView(rows, view), sortBy, sortOrder);
  const pagination = paginate(visibleRows, page, PAGE_SIZE);

  return (
    <WidgetsList
      rows={pagination.items}
      view={view}
      counts={countByView(rows)}
      totalCount={visibleRows.length}
      currentPage={pagination.page}
      pageSize={PAGE_SIZE}
      sortBy={sortBy}
      sortOrder={sortOrder}
    />
  );
}

import { getDocuments } from "@/services/documents";
import { WorkflowClient } from "./workflow-client";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function WorkflowPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const page =
    typeof searchParams.page === "string"
      ? Number.parseInt(searchParams.page, 10) || 1
      : 1;
  const pageSizeRaw =
    typeof searchParams.pageSize === "string"
      ? Number.parseInt(searchParams.pageSize, 10) || 20
      : 20;
  const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100);

  const {
    data: inProgressDocuments,
    total,
    totalPages,
  } = await getDocuments({
    page,
    pageSize,
    status: ["unknown", "error"],
    sortBy: "updated_at",
    sortOrder: "desc",
  });

  return (
    <WorkflowClient
      inProgressDocuments={inProgressDocuments}
      totalCount={total}
      currentPage={page}
      totalPages={totalPages}
      pageSize={pageSize}
    />
  );
}

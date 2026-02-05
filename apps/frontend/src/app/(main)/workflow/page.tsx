import { getDocuments } from "@/services/documents";
import { WorkflowClient } from "./workflow-client";

export default async function WorkflowPage() {
  // Fetch in-progress documents (unknown or error status)
  const [{ data: unknownDocuments }, { data: errorDocuments }] =
    await Promise.all([
      getDocuments({
        page: 1,
        pageSize: 50,
        status: "unknown",
      }),
      getDocuments({
        page: 1,
        pageSize: 50,
        status: "error",
      }),
    ]);

  const inProgressDocuments = [...unknownDocuments, ...errorDocuments];
  return <WorkflowClient inProgressDocuments={inProgressDocuments} />;
}

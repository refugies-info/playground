"use client";

import { type Document, logger } from "@playground/shared-types";
import { DataTable } from "@playground/ui/composites";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { triggerDiIngestionAction } from "@/app/actions/di";
import { AppPaginationControls } from "@/components/common/app-pagination";
import { createClient } from "@/lib/supabase/client";
import { inProgressColumns } from "./columns";
import { DocumentPreviewDrawer } from "./document-preview-drawer";

// Duration must match the Tailwind animation duration used in getRowClassName (duration-1000)
const HIGHLIGHT_ANIMATION_DURATION_MS = 1000;

interface WorkflowClientProps {
  inProgressDocuments: Document[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  initialSearchId?: string;
}

export function WorkflowClient(props: WorkflowClientProps) {
  const {
    inProgressDocuments,
    totalCount,
    currentPage,
    totalPages,
    pageSize,
    initialSearchId,
  } = props;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [arbitrationLoading, setArbitrationLoading] = useState<string | null>(
    null,
  );

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Search state
  const [searchId, setSearchId] = useState(initialSearchId || "");

  // Track documents locally to detect changes for animation
  const [documents, setDocuments] = useState(inProgressDocuments);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const prevDocumentsRef = useRef<Document[]>(inProgressDocuments);

  // Detect document changes and trigger animations
  useEffect(() => {
    const prevDocs = prevDocumentsRef.current;
    const newDocs = inProgressDocuments;

    // Find IDs that changed or are new
    const changedIds = new Set<string>();
    const prevDocsMap = new Map(prevDocs.map((doc) => [doc.id, doc]));

    for (const doc of newDocs) {
      const prevDoc = prevDocsMap.get(doc.id);
      if (!prevDoc) {
        // New document
        changedIds.add(doc.id);
      } else if (
        prevDoc.complianceStatus !== doc.complianceStatus ||
        prevDoc.title !== doc.title
      ) {
        // Modified document
        changedIds.add(doc.id);
      }
    }

    if (changedIds.size > 0) {
      setHighlightedIds(changedIds);
      setDocuments(newDocs);
      prevDocumentsRef.current = newDocs;

      // Clear highlight after animation completes
      const timer = setTimeout(() => {
        setHighlightedIds(new Set());
      }, HIGHLIGHT_ANIMATION_DURATION_MS);

      return () => clearTimeout(timer);
    } else {
      setDocuments(newDocs);
      prevDocumentsRef.current = newDocs;
    }
  }, [inProgressDocuments]);

  // Supabase Realtime: refresh when workflows change
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("workflow-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workflows",
        },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "workflows",
        },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (searchId) {
      params.set("searchId", searchId);
    } else {
      params.delete("searchId");
    }
    // Reset to page 1 on search
    params.set("page", "1");
    router.push(`/workflow?${params.toString()}`);
  };

  const handleOpenDrawer = (doc: Document) => {
    setSelectedDocument(doc);
    setIsDrawerOpen(true);
  };

  const handleRunDiIngestion = async () => {
    setIsLoading(true);
    setError(null);
    setWorkflowId(null);
    setResults(null);
    setStatus(null);

    try {
      const result = await triggerDiIngestionAction();

      if (!result.success) {
        setError(result.error || "Unknown error occurred");
      } else {
        setWorkflowId(result.workflowId || null);
        if (result.dashboardUrl) {
          // Optional: Open dashboard in new tab
          // window.open(result.dashboardUrl, '_blank');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of functions ...

  const handleRefreshStatus = async () => {
    if (!workflowId) return;
    // Implementation for status refresh if needed
    try {
      const response = await fetch(`/api/workflow/${workflowId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch workflow status");
      }
      const data = await response.json();
      setStatus(data.status);

      if (data.status === "completed" && data.output) {
        const [resultMap, ...values] = data.output;

        if (resultMap && typeof resultMap === "object") {
          // biome-ignore lint/suspicious/noExplicitAny: Recursive reconstruction
          const reconstruct = (val: any): any => {
            if (typeof val === "number") return values[val - 1];
            if (Array.isArray(val)) return val.map(reconstruct);
            if (val && typeof val === "object") {
              // biome-ignore lint/suspicious/noExplicitAny: Recursive reconstruction
              const res: any = {};
              for (const k in val) {
                res[k] = reconstruct(val[k]);
              }
              return res;
            }
            return val;
          };

          const fullResult = reconstruct(resultMap);

          if (fullResult.ingestion) {
            setResults({
              ...fullResult.files,
              "Ingestion Status": fullResult.ingestion.status,
              "RCO Record ID": fullResult.ingestion.rcoRecordId || "N/A",
              "Ingestion Record ID":
                fullResult.ingestion.ingestionRecordId || "N/A",
            });
          } else if (fullResult.structures && fullResult.services) {
            setResults({
              "Ingestion Type": "Data Inclusion",
              "Structures Fetched": String(fullResult.structures.totalFetched),
              "Services Fetched": String(fullResult.services.totalFetched),
              "Services Inserted": String(fullResult.services.totalInserted),
              "Services Updated": String(fullResult.services.totalUpdated),
              "Audit Reports": fullResult.audit
                ? `${fullResult.audit.succeeded}/${fullResult.audit.attempted}`
                : "N/A",
            });
          } else {
            setResults(fullResult);
          }
        }
      }
    } catch (err) {
      logger.error(err, "Error refreshing status");
    }
  };

  const handleForceArbitration = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (arbitrationLoading) return;

    setArbitrationLoading(id);
    try {
      const { forceArbitrationAction } = await import("@/app/actions/di");
      const result = await forceArbitrationAction(id);

      if (result.success) {
        setArbitrationLoading(null);
        router.refresh();
      } else {
        setArbitrationLoading(null);
        logger.error({ error: result.error }, "Arbitration failed");
        alert(`Arbitration failed: ${result.error}`);
      }
    } catch (err) {
      setArbitrationLoading(null);
      logger.error({ error: err }, "Error forcing arbitration");
      alert("Error forcing arbitration");
    }
  };

  const columns = [
    ...inProgressColumns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: Document } }) => {
        const isLoading = arbitrationLoading === row.original.id;
        return (
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDrawer(row.original);
              }}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
            >
              Voir
            </button>
            <button
              type="button"
              onClick={(e) => handleForceArbitration(row.original.id, e)}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
              title="Forcer l'arbitrage (générer le rapport IA)"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-3 w-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <title>Chargement</title>
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Arbitrage en cours...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-3 h-3"
                  >
                    <title>Arbitrer</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                  <span>Arbitrer</span>
                </>
              )}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full h-full p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Importer du contenu</h1>
        <button
          type="button"
          onClick={handleRunDiIngestion}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <title>Refresh Icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          {isLoading ? "En cours..." : "Lancer l'import DI"}
        </button>
      </div>

      <div className="container mx-auto max-w-4xl">
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <h3 className="font-bold mb-2">Error</h3>
            <p>{error}</p>
          </div>
        )}

        {workflowId && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold mb-2">Workflow Started</h3>
                <p>
                  Workflow ID:{" "}
                  <code className="bg-green-100 px-2 py-1 rounded">
                    {workflowId}
                  </code>
                </p>
                {status && (
                  <p className="mt-2">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        status === "completed"
                          ? "text-green-600"
                          : status === "failed"
                            ? "text-red-600"
                            : "text-blue-600"
                      }`}
                    >
                      {status}
                    </span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleRefreshStatus}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                Refresh Status
              </button>
            </div>
            <p className="mt-2 text-sm">
              Check the{" "}
              <a
                href="http://localhost:3456"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                Workflow Dashboard
              </a>{" "}
              (if enabled) or server logs for progress.
            </p>
          </div>
        )}

        {results && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Results</h2>
            <div className="grid gap-4">
              {Object.entries(results).map(([key, value]) => (
                <div
                  key={key}
                  className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                >
                  <h3 className="font-semibold text-lg mb-2">{key}</h3>
                  <div className="flex items-center justify-between">
                    <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded break-all">
                      {value as string}
                    </code>
                    {(typeof value === "string" && value.startsWith("Error")) ||
                    value === "error" ||
                    value === "failed" ? (
                      <span className="text-red-500 text-sm font-medium">
                        Failed
                      </span>
                    ) : (typeof value === "string" &&
                        value.startsWith("success")) ||
                      (key.includes("Status") && value === "success") ? (
                      <span className="text-green-500 text-sm font-medium">
                        Success
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">Info</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Files have been saved to the <code>output</code> directory in the
              project root.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-6 flex items-end gap-4">
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-sm flex items-end gap-2"
          >
            <div className="flex-1">
              <label
                htmlFor="searchId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Rechercher par ID Carif-Oref
              </label>
              <input
                id="searchId"
                type="text"
                placeholder="Ex: carif-oref--10_396692S"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors border"
            >
              Rechercher
            </button>
            {initialSearchId && (
              <button
                type="button"
                onClick={() => {
                  setSearchId("");
                  router.push("/workflow");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium pb-2"
              >
                Réinitialiser
              </button>
            )}
          </form>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Fiches en cours de traitement ({totalCount})
          </h2>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 mr-2">
                Page {currentPage} sur {totalPages}
              </span>
              <AppPaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
        {documents.length > 0 ? (
          <>
            <DataTable
              columns={columns}
              data={documents}
              pageSize={pageSize}
              onRowClick={(row) => router.push(`/documents/${row.id}`)}
              manualPagination
              getRowClassName={(row) =>
                highlightedIds.has(row.id)
                  ? "animate-highlight bg-yellow-50 transition-colors duration-1000"
                  : undefined
              }
            />

            {totalPages > 1 && (
              <div className="flex items-center justify-end px-2 py-4">
                <AppPaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic">Aucune fiche en cours.</p>
        )}
      </div>
      <DocumentPreviewDrawer
        document={selectedDocument}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </div>
  );
}

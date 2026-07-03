"use client";

import { type Document, logger } from "@playground/shared-types";
import { BoutonFiltreDate, Button, SearchInput } from "@playground/ui";
import { DataTable } from "@playground/ui/composites";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { triggerDiIngestionAction } from "@/app/actions/di";
import { AppPaginationControls } from "@/components/common/app-pagination";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { createClient } from "@/lib/supabase/client";
import { inProgressColumns } from "./columns";
import { DocumentPreviewDrawer } from "./document-preview-drawer";

// Duration must match the Tailwind animation duration used in getRowClassName (duration-1000)
const HIGHLIGHT_ANIMATION_DURATION_MS = 1000;
const REALTIME_REFRESH_THROTTLE_MS = 2000;

interface WorkflowFilters extends Record<string, string> {
  search: string;
  sessionStart: string;
  sessionEnd: string;
}

interface WorkflowClientProps {
  inProgressDocuments: Document[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  initialFilters: WorkflowFilters;
}

export function WorkflowClient(props: WorkflowClientProps) {
  const {
    inProgressDocuments,
    totalCount,
    currentPage,
    totalPages,
    pageSize,
    initialFilters,
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

  // Filters synced with URL (reuse shared hook)
  const { filters, updateFilter } = useUrlFilters<WorkflowFilters>({
    basePath: "/workflow",
    initialFilters,
  });

  // Track documents locally to detect changes for animation
  const [documents, setDocuments] = useState(inProgressDocuments);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const prevDocumentsRef = useRef<Document[]>(inProgressDocuments);
  const skipHighlightRef = useRef(false);
  const lastRealtimeRefreshRef = useRef(0);
  const realtimeRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const scheduleRealtimeRefresh = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastRealtimeRefreshRef.current;

    if (elapsed >= REALTIME_REFRESH_THROTTLE_MS) {
      if (realtimeRefreshTimerRef.current) {
        clearTimeout(realtimeRefreshTimerRef.current);
        realtimeRefreshTimerRef.current = null;
      }
      lastRealtimeRefreshRef.current = now;
      router.refresh();
      return;
    }

    if (realtimeRefreshTimerRef.current) return;

    realtimeRefreshTimerRef.current = setTimeout(() => {
      lastRealtimeRefreshRef.current = Date.now();
      realtimeRefreshTimerRef.current = null;
      router.refresh();
    }, REALTIME_REFRESH_THROTTLE_MS - elapsed);
  }, [router]);

  // Detect document changes and trigger animations
  useEffect(() => {
    const prevDocs = prevDocumentsRef.current;
    const newDocs = inProgressDocuments;

    // Skip highlight after navigation (search/page change)
    if (skipHighlightRef.current) {
      skipHighlightRef.current = false;
      setDocuments(newDocs);
      prevDocumentsRef.current = newDocs;
      return;
    }

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

  useEffect(() => {
    if (!arbitrationLoading) return;

    const currentDocument = inProgressDocuments.find(
      (doc) => doc.id === arbitrationLoading,
    );

    if (!currentDocument || currentDocument.complianceStatus !== "pending") {
      setArbitrationLoading(null);
    }
  }, [arbitrationLoading, inProgressDocuments]);

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
        scheduleRealtimeRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "workflows",
        },
        scheduleRealtimeRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ingestion_records",
        },
        scheduleRealtimeRefresh,
      )
      .subscribe();

    return () => {
      if (realtimeRefreshTimerRef.current) {
        clearTimeout(realtimeRefreshTimerRef.current);
        realtimeRefreshTimerRef.current = null;
      }
      supabase.removeChannel(channel);
    };
  }, [scheduleRealtimeRefresh]);

  // Any filter change is a navigation → skip the row-change animation.
  const handleFilterChange = (key: keyof WorkflowFilters, value: string) => {
    skipHighlightRef.current = true;
    updateFilter(key, value);
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
        const isPending = row.original.complianceStatus === "pending";
        const isLoading = arbitrationLoading === row.original.id || isPending;
        return (
          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
            <Button
              variant="tertiaire"
              size="sm"
              className="shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDrawer(row.original);
              }}
            >
              Voir
            </Button>
            <Button
              variant="primaire"
              size="sm"
              className="min-w-[104px] shrink-0 whitespace-nowrap"
              onClick={(e) => handleForceArbitration(row.original.id, e)}
              disabled={isLoading}
              isLoading={isLoading}
              title="Forcer l'arbitrage (générer le rapport IA)"
            >
              {isLoading ? "En cours…" : "Arbitrer"}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full flex flex-col">
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
              <Button
                variant="tertiaire"
                size="sm"
                onClick={handleRefreshStatus}
              >
                Refresh Status
              </Button>
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

      <div>
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <SearchInput
            value={filters.search}
            onChange={(value) => handleFilterChange("search", value)}
            placeholder="Rechercher par titre, ID, structure, commune, contenu…"
            wrapperClassName="max-w-[330px] w-full"
            aria-label="Rechercher (titre, ID, structure, commune, contenu)"
          />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--text-default-grey,#3A3A3A)]">
              Date de session
            </span>
            <BoutonFiltreDate
              value={filters.sessionStart}
              onChange={(value) => handleFilterChange("sessionStart", value)}
            />
          </div>

          {/* Fin de session : session_end_date <= date */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--text-default-grey,#3A3A3A)]">
              à
            </span>
            <BoutonFiltreDate
              value={filters.sessionEnd}
              onChange={(value) => handleFilterChange("sessionEnd", value)}
            />
          </div>

          {/* Bouton aligné à droite dans le même conteneur que la recherche */}
          <Button
            className="ml-auto"
            onClick={handleRunDiIngestion}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "En cours…" : "Lancer l'import DI"}
          </Button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Fiches en cours de traitement ({totalCount})
          </h2>
          {totalPages > 1 && (
            <AppPaginationControls
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
            />
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
              <div className="flex justify-end py-4">
                <AppPaginationControls
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalCount={totalCount}
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

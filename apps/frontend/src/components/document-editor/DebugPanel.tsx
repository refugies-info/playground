"use client";

import { logger } from "@playground/shared-types";
import { cn } from "@playground/ui";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@playground/ui/overlays";
import { Bug, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDocument } from "@/components/document-editor/DocumentContext";
import { getEditorialContent } from "@/services/document-actions";

export function DebugPanel() {
  const { document, showDebug, setShowDebug, debugBlocks } = useDocument();
  const pathname = usePathname();
  const isMetadataView = pathname?.endsWith("/metadata");

  const [serverContent, setServerContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [localTab, setLocalTab] = useState<"json" | "markdown">("json");

  // Fetch data when opening
  const fetchServerContent = useCallback(async () => {
    if (!document?.id) return;

    setIsLoading(true);
    try {
      const result = await getEditorialContent(document.id);
      if (result.success && result.content !== undefined) {
        setServerContent(result.content);
        setLastRefreshed(new Date());
      }
    } catch (error) {
      logger.error(error, "Error fetching server content for debug panel:");
    } finally {
      setIsLoading(false);
    }
  }, [document?.id]);

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.code === "KeyD") {
        e.preventDefault();
        e.stopPropagation();
        setShowDebug(!showDebug);
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [showDebug, setShowDebug]);

  useEffect(() => {
    if (showDebug && document?.id) {
      fetchServerContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDebug, document?.id, fetchServerContent]);

  // 1. Environment Check: Hide completely in production (after hooks)
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Drawer open={showDebug} onOpenChange={setShowDebug}>
      <DrawerTrigger asChild>
        <button
          type="button"
          onClick={() => setShowDebug(true)}
          className="fixed bottom-4 right-4 z-50 p-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-105"
          title="Toggle Debug Panel (Option+Shift+D)"
        >
          <Bug className="w-5 h-5" />
        </button>
      </DrawerTrigger>

      <DrawerContent className="h-[96vh]">
        <DrawerHeader className="border-b px-6 py-3">
          <div className="flex items-center justify-between w-full">
            <DrawerTitle className="flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Debug Actions
            </DrawerTitle>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchServerContent}
                disabled={isLoading}
                className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                {isLoading ? "Refreshing..." : "Refresh Server Data"}
              </button>
              {lastRefreshed && (
                <span className="text-xs text-gray-400 font-mono">
                  {lastRefreshed.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </DrawerHeader>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden font-mono text-sm">
          {isMetadataView ? (
            <>
              {/* DB Metadata */}
              <div className="flex-1 flex flex-col border-r relative group">
                <div className="px-4 py-2 bg-gray-100 border-b font-semibold text-xs tracking-wider text-pink-500 uppercase flex justify-between items-center">
                  <span>ingestion_record metadata</span>
                  <span className="bg-gray-200 px-2 py-0.5 rounded text-[10px] text-gray-600">
                    {JSON.stringify(document?.metadata || {}).length} chars
                  </span>
                </div>
                <div className="flex-1 relative bg-gray-50/50">
                  <textarea
                    className="w-full h-full p-4 resize-none focus:outline-none bg-transparent text-pink-900"
                    value={JSON.stringify(document?.metadata || {}, null, 2)}
                    readOnly
                  />
                </div>
              </div>

              {/* LLM Metadata */}
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-2 bg-pink-50/50 border-b font-semibold text-xs tracking-wider uppercase text-pink-600 flex justify-between items-center">
                  <span>letta_report metadata</span>
                  <span className="bg-pink-100 px-2 py-0.5 rounded text-[10px] text-pink-700">
                    {JSON.stringify(document?.metadataReport || {}).length}{" "}
                    chars
                  </span>
                </div>
                <textarea
                  className="w-full h-full p-4 resize-none focus:outline-none bg-pink-50/10 text-pink-900"
                  value={JSON.stringify(
                    document?.metadataReport || {},
                    null,
                    2,
                  )}
                  readOnly
                />
              </div>
            </>
          ) : (
            <>
              {/* Server Side */}
              <div className="flex-1 flex flex-col border-r relative group">
                <div className="px-4 py-2 bg-gray-100 border-b font-semibold text-xs uppercase tracking-wider text-gray-500 flex justify-between items-center">
                  <span>Server (Supabase)</span>
                  <span className="bg-gray-200 px-2 py-0.5 rounded text-[10px] text-gray-600">
                    {serverContent.length} chars
                  </span>
                </div>
                <div className="flex-1 relative bg-gray-50/50">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  )}
                  <textarea
                    className="w-full h-full p-4 resize-none focus:outline-none bg-transparent"
                    value={serverContent}
                    readOnly
                  />
                </div>
              </div>

              {/* Client Side */}
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-2 bg-blue-50/50 border-b font-semibold text-xs uppercase tracking-wider text-blue-600 flex justify-between items-center">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setLocalTab("json")}
                      className={cn(
                        "hover:text-blue-800 transition-colors",
                        localTab === "json"
                          ? "text-blue-800 font-bold border-b-2 border-blue-600"
                          : "text-blue-400",
                      )}
                    >
                      JSON (BlockNote)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocalTab("markdown")}
                      className={cn(
                        "hover:text-blue-800 transition-colors",
                        localTab === "markdown"
                          ? "text-blue-800 font-bold border-b-2 border-blue-600"
                          : "text-blue-400",
                      )}
                    >
                      Markdown
                    </button>
                  </div>
                  <span className="bg-blue-100 px-2 py-0.5 rounded text-[10px] text-blue-700">
                    {localTab === "json"
                      ? `${debugBlocks?.length || 0} blocks`
                      : `${document?.editorialContent?.length || 0} chars`}
                  </span>
                </div>

                {localTab === "json" ? (
                  <textarea
                    className="w-full h-full p-4 resize-none focus:outline-none bg-blue-50/10 text-blue-900"
                    value={JSON.stringify(debugBlocks, null, 2)}
                    readOnly
                  />
                ) : (
                  <textarea
                    className="w-full h-full p-4 resize-none focus:outline-none bg-blue-50/10 text-blue-900"
                    value={document?.editorialContent || ""}
                    readOnly
                  />
                )}
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

"use client";

import { cn } from "@playground/ui";
import { Button } from "@playground/ui/primitives";
import {
  ChevronLeft,
  ChevronRight,
  File,
  Gavel,
  LayoutList,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DocumentActions } from "../actions";
import { useDocument } from "../DocumentContext";

export function EditorNavigation() {
  const { isComparisonMode, document } = useDocument();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse when comparison mode is active
  useEffect(() => {
    if (isComparisonMode) {
      setIsCollapsed(true);
    }
  }, [isComparisonMode]);

  if (!document) return null;

  const baseUrl = `/documents/${document.id}`;
  const isFicheActive = pathname === baseUrl;
  const isComplianceActive = pathname === `${baseUrl}/compliance`;
  const isMetadataActive = pathname === `${baseUrl}/metadata`;

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-gray-50 transition-all duration-300 ease-in-out h-full overflow-hidden",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center p-4 border-b bg-white justify-between">
        {!isCollapsed && (
          <span className="font-semibold text-sm">Navigation</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 px-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
          disabled={isComparisonMode}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex-1 flex flex-col p-4 gap-4">
        <div className="flex flex-col gap-2">
          <Link href={baseUrl}>
            <Button
              variant={isFicheActive ? "secondary" : "ghost"}
              className={cn(
                "justify-start flex gap-2 w-full",
                isCollapsed && "justify-center px-0",
              )}
            >
              <File className="w-4 h-4" />
              {!isCollapsed && "Fiche "}
            </Button>
          </Link>

          <Link href={`${baseUrl}/metadata`}>
            <Button
              variant={isMetadataActive ? "secondary" : "ghost"}
              className={cn(
                "justify-start flex gap-2 w-full",
                isCollapsed && "justify-center px-0",
              )}
            >
              <LayoutList className="w-4 h-4" />
              {!isCollapsed && "Metadonnées"}
            </Button>
          </Link>

          <Link href={`${baseUrl}/compliance`}>
            <Button
              variant={isComplianceActive ? "secondary" : "ghost"}
              className={cn(
                "justify-start flex gap-2 w-full",
                isCollapsed && "justify-center px-0",
              )}
            >
              <Gavel className="w-4 h-4" />
              {!isCollapsed && "Arbitrage"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Buttons - Sticky Bottom */}
      <div className="sticky bottom-0 mt-auto">
        <DocumentActions isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}

"use client";

import { cn } from "@playground/ui";
import { Button } from "@playground/ui/primitives";
import {
  AlertTriangle,
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
import { useMetadata } from "../metadata/MetadataContext";

export function EditorNavigation() {
  const { isComparisonMode, document } = useDocument();
  const { hasMetadataErrors } = useMetadata();
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
                "justify-start flex gap-2 w-full relative",
                isCollapsed && "justify-center px-0",
              )}
            >
              <LayoutList className="w-4 h-4 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Metadonnées</span>
                  {hasMetadataErrors && (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                </>
              )}
              {/* In collapsed mode: small dot indicator */}
              {isCollapsed && hasMetadataErrors && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
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

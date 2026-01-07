"use client";

import { cn } from "@playground/ui";
import { Button } from "@playground/ui/primitives";
import { ChevronLeft, ChevronRight, File, Gavel } from "lucide-react";
import { useEffect, useState } from "react";
import { useDocument } from "./DocumentContext";

export function EditorNavigation() {
  const { isComparisonMode, document, activeView, setActiveView } =
    useDocument();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse when comparison mode is active
  useEffect(() => {
    if (isComparisonMode) {
      setIsCollapsed(true);
    }
  }, [isComparisonMode]);

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

      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Navigation Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            variant={activeView === "edit" ? "secondary" : "ghost"}
            className={cn(
              "justify-start flex gap-2",
              isCollapsed && "justify-center px-0",
            )}
            onClick={() => setActiveView("edit")}
          >
            <File className="w-4 h-4" />
            {!isCollapsed && "Fiche "}
          </Button>

          <Button
            variant={activeView === "compliance" ? "secondary" : "ghost"}
            className={cn(
              "justify-start flex gap-2",
              isCollapsed && "justify-center px-0",
            )}
            onClick={() => setActiveView("compliance")}
          >
            <Gavel className="w-4 h-4" />
            {!isCollapsed && "Arbitrage"}
          </Button>
        </div>
      </div>
    </div>
  );
}

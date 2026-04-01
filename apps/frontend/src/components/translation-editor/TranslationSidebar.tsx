"use client";

import { cn } from "@playground/ui";
import { Button } from "@playground/ui/primitives";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { TranslationActions } from "./TranslationActions";

export function TranslationSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-gray-50 transition-all duration-300 ease-in-out h-full overflow-hidden",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header with collapse toggle */}
      <div className="flex items-center p-4 border-b bg-white justify-between">
        {!isCollapsed && <span className="font-semibold text-sm">Actions</span>}
        <Button
          variant="quatrieme"
          size="sm"
          className="h-8 w-8 px-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Empty flex space */}
      <div className="flex-1" />

      {/* Action Buttons - Sticky Bottom */}
      <div className="sticky bottom-0 mt-auto">
        <TranslationActions isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Button } from "@refugies/ui/primitives";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { cn } from "@refugies/ui";

export function EditorSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-gray-50 transition-all duration-300 ease-in-out h-full",
        isCollapsed ? "w-12" : "w-64"
      )}
    >
      <div className="flex items-center p-2">
        {!isCollapsed ? (
          <span className="font-semibold text-sm">Barre latérale</span>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-8 w-8 px-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>
      <div className="flex-1 p-2">
        {!isCollapsed ? (
          <div className="text-sm text-gray-500">
            Contenu de la barre latérale - à venir
          </div>
        ) : null}
      </div>
    </div>
  );
}

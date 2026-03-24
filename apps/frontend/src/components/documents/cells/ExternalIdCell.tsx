"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@playground/ui";
import { EmptyDash } from "@playground/ui/primitives";
import { Info } from "lucide-react";

interface ExternalIdCellProps {
  externalId: string | null | undefined;
}

/**
 * External ID cell with tooltip and copy-to-clipboard.
 * Shows an "i" icon that reveals the Carif-Oref ID on hover.
 */
export const ExternalIdCell = ({ externalId }: ExternalIdCellProps) => {
  if (!externalId) return <EmptyDash />;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(externalId);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4 text-gray-400" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <div className="font-medium mb-1">ID</div>
            <div className="font-mono">{externalId}</div>
            <div className="text-[10px] text-gray-400 mt-1">
              Cliquez pour copier l'ID
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
ExternalIdCell.displayName = "ExternalIdCell";

"use client";

import { Button } from "@playground/ui/primitives";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { normalizeSourceEntries } from "./shared/helpers";

interface SourceDisplayProps {
  source?: unknown;
  diMetadata: Record<string, unknown>;
}

export function SourceDisplay({ source, diMetadata }: SourceDisplayProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const sourceEntries = normalizeSourceEntries(source, diMetadata);

  if (sourceEntries.length === 0) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="space-y-1 text-sm">
      {sourceEntries.map(({ key, value }, index) => {
        const entryKey = `${key}-${index}`;
        const isExpanded = expandedKeys.has(entryKey);
        const trimmedValue =
          value && !isExpanded && value.length > 200
            ? `${value.slice(0, 200)}…`
            : value;
        return (
          <div key={entryKey}>
            <span className="font-bold">{key}</span>
            {value && (
              <>
                {" "}
                : <span>{trimmedValue}</span>
                {value.length > 200 && (
                  <Button
                    variant="secondaire"
                    size="sm"
                    onClick={() => {
                      setExpandedKeys((prev) => {
                        const next = new Set(prev);
                        if (next.has(entryKey)) {
                          next.delete(entryKey);
                        } else {
                          next.add(entryKey);
                        }
                        return next;
                      });
                    }}
                    className="ml-2 underline cursor-pointer"
                  >
                    {isExpanded ? (
                      <Minus className="h-3 w-3" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { Button } from "@playground/ui/primitives";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { formatSourceValue, resolvePath } from "./shared/helpers";

interface SourceDisplayProps {
  source?: string[];
  diMetadata: Record<string, unknown>;
}

export function SourceDisplay({ source, diMetadata }: SourceDisplayProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  if (!source?.length) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="space-y-1 text-sm">
      {source.map((srcKey) => {
        const resolved = resolvePath(diMetadata, srcKey);
        const formattedValue = formatSourceValue(resolved);
        const isExpanded = expandedKeys.has(srcKey);
        const trimmedValue =
          formattedValue && !isExpanded && formattedValue.length > 200
            ? `${formattedValue.slice(0, 200)}…`
            : formattedValue;
        return (
          <div key={srcKey}>
            <span className="font-bold">{srcKey}</span>
            {formattedValue && (
              <>
                {" "}
                : <span>{trimmedValue}</span>
                {formattedValue.length > 200 && (
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => {
                      setExpandedKeys((prev) => {
                        const next = new Set(prev);
                        if (next.has(srcKey)) {
                          next.delete(srcKey);
                        } else {
                          next.add(srcKey);
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

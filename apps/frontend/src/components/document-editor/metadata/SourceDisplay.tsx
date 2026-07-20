"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { normalizeSourceEntries } from "./shared/helpers";

const CELL_MAX_HEIGHT = 128;
const CELL_VERTICAL_PADDING = 24;
const COLLAPSED_MAX_HEIGHT = CELL_MAX_HEIGHT - CELL_VERTICAL_PADDING;

interface SourceDisplayProps {
  source?: unknown;
  diMetadata: Record<string, unknown>;
}

export function SourceDisplay({ source, diMetadata }: SourceDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Whether the content overflows the collapsed height → the cell is expandable.
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const sourceEntries = normalizeSourceEntries(source, diMetadata);

  // Measure overflow on mount and whenever the cell is resized (re-wrapping).
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () =>
      setIsOverflowing(el.scrollHeight > COLLAPSED_MAX_HEIGHT + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (sourceEntries.length === 0) {
    return (
      <div className="px-4 py-3">
        <span className="text-gray-400">—</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={!isOverflowing}
      onClick={() => setIsExpanded((v) => !v)}
      aria-expanded={isOverflowing ? isExpanded : undefined}
      aria-label={
        isOverflowing
          ? isExpanded
            ? "Replier la source"
            : "Déplier la source"
          : undefined
      }
      className={`flex w-full items-start gap-1 px-4 py-3 text-left ${
        isOverflowing ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <div className="w-4 shrink-0">
        {isOverflowing && (
          <ChevronDown
            className={`mt-0.5 h-4 w-4 text-gray-500 transition-transform ${
              isExpanded ? "" : "-rotate-90"
            }`}
            aria-hidden
          />
        )}
      </div>

      <div
        ref={contentRef}
        className="min-w-0 flex-1 space-y-1 overflow-hidden text-sm"
        style={isExpanded ? undefined : { maxHeight: COLLAPSED_MAX_HEIGHT }}
      >
        {sourceEntries.map(({ key, value }) => (
          <div key={`${key}-${value}`}>
            <span className="font-bold">{key}</span>
            {value && (
              <>
                {" "}
                : <span>{value}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </button>
  );
}

"use client";

import * as React from "react";
import { RiSearchLine } from "../icons";
import { TextInput } from "./TextInput";

type SearchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; results: T[] };

export interface AsyncSearchInputProps<T> {
  onSearch: (text: string) => Promise<T[]>;
  onSelect: (result: T) => void;
  getResultKey: (result: T) => string;
  renderResult: (result: T) => React.ReactNode;
  placeholder?: string;
  "aria-label"?: string;
  error?: string;
  minLength?: number;
  delayInMs?: number;
}

const messageClassName = "px-2 py-1 text-sm text-[var(--text-mention-grey)]";

/**
 * AsyncSearchInput — A text field that sends a request while the user types and lists the
 * results; clicking a result selects it and closes the list.
 *
 * `onSearch` must keep the same reference between renders (define it outside the
 * component or memoize it), otherwise the search restarts on every render.
 *
 * @example
 * ```tsx
 * <AsyncSearchInput
 *   onSearch={searchFiches}
 *   onSelect={setFiche}
 *   getResultKey={(fiche) => fiche.id}
 *   renderResult={(fiche) => fiche.title}
 *   placeholder="Rechercher une fiche"
 * />
 * ```
 */
export function AsyncSearchInput<T>({
  onSearch,
  onSelect,
  getResultKey,
  renderResult,
  placeholder,
  "aria-label": ariaLabel,
  error,
  minLength = 2,
  delayInMs = 300,
}: AsyncSearchInputProps<T>) {
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState<SearchState<T>>({
    status: "idle",
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const latestRequest = React.useRef(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const closeWhenOutside = (event: Event) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", closeWhenOutside);
    document.addEventListener("focusin", closeWhenOutside);
    return () => {
      document.removeEventListener("mousedown", closeWhenOutside);
      document.removeEventListener("focusin", closeWhenOutside);
    };
  }, [isOpen]);

  React.useEffect(() => {
    const text = query.trim();
    const request = ++latestRequest.current;
    if (text.length < minLength) {
      setSearch({ status: "idle" });
      return;
    }
    setSearch({ status: "loading" });
    const timer = setTimeout(async () => {
      try {
        const results = await onSearch(text);
        if (request === latestRequest.current) {
          setSearch({ status: "done", results });
        }
      } catch {
        if (request === latestRequest.current) setSearch({ status: "error" });
      }
    }, delayInMs);
    return () => clearTimeout(timer);
  }, [query, onSearch, minLength, delayInMs]);

  const handleSelect = (result: T) => {
    onSelect(result);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <TextInput
        variant="dsfr"
        type="search"
        value={query}
        onChange={(next) => {
          setQuery(next);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setIsOpen(false);
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        error={error}
        autoComplete="off"
        className="pr-10 [&::-webkit-search-cancel-button]:appearance-none"
      />
      <RiSearchLine
        className="pointer-events-none absolute right-4 top-3 size-4 text-[var(--text-default-grey)]"
        aria-hidden="true"
      />
      <div aria-live="polite">
        {isOpen && search.status !== "idle" && (
          <div className="absolute inset-x-0 top-full z-10 max-h-80 overflow-auto rounded-[2px] border border-[var(--border-default-grey)] bg-white p-2 shadow-[0_4px_12px_0_rgba(0,0,18,0.16)]">
            <SearchResults
              search={search}
              getResultKey={getResultKey}
              renderResult={renderResult}
              onSelect={handleSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResults<T>({
  search,
  getResultKey,
  renderResult,
  onSelect,
}: {
  search: SearchState<T>;
  getResultKey: (result: T) => string;
  renderResult: (result: T) => React.ReactNode;
  onSelect: (result: T) => void;
}) {
  if (search.status === "loading") {
    return <p className={messageClassName}>Recherche en cours…</p>;
  }
  if (search.status === "error") {
    return (
      <p className={messageClassName}>
        La recherche a échoué, réessayer dans un instant.
      </p>
    );
  }
  if (search.status === "idle") return null;
  if (search.results.length === 0) {
    return <p className={messageClassName}>Aucun résultat</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {search.results.map((result) => (
        <li key={getResultKey(result)}>
          <button
            type="button"
            onClick={() => onSelect(result)}
            className="flex w-full cursor-pointer flex-col px-2 text-left transition-colors hover:bg-[var(--background-alt-blue-france)]"
          >
            {renderResult(result)}
          </button>
        </li>
      ))}
    </ul>
  );
}

AsyncSearchInput.displayName = "AsyncSearchInput";

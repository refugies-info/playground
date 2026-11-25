"use client";

import { cn } from "@playground/ui";
import { TextInput } from "@playground/ui/forms";
import { RiCloseCircleFill } from "@playground/ui/icons";
import { useId, useState } from "react";
import { normalizeDomain } from "@/lib/widget-form";

interface DomainsInputProps {
  value: string[];
  onChange: (domains: string[]) => void;
  error?: string;
}

export function DomainsInput({ value, onChange, error }: DomainsInputProps) {
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState<string>();

  const shownError = draftError ?? error;

  const handleAdd = () => {
    if (draft.trim() === "") return;
    const domain = normalizeDomain(draft);
    if (!domain) {
      setDraftError("Le domaine doit être une URL.");
      return;
    }
    if (value.includes(domain)) {
      setDraftError("Ce domaine est déjà dans la liste");
      return;
    }
    onChange([...value, domain]);
    setDraft("");
    setDraftError(undefined);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleAdd();
  };

  return (
    <div className="flex flex-col gap-2 py-2">
      <div>
        <label
          htmlFor={inputId}
          className={cn(
            "block text-base font-medium leading-6",
            shownError
              ? "text-(--text-default-error)"
              : "text-(--text-default-grey)",
          )}
        >
          Domaines autorisés
        </label>
        <p className="text-sm leading-6 text-(--text-mention-grey)">
          Noms de domaines du partenaire autorisés à exploiter le widget.
        </p>
      </div>
      <div className="relative">
        <TextInput
          id={inputId}
          variant="dsfr"
          value={draft}
          onChange={(next) => {
            setDraft(next);
            setDraftError(undefined);
          }}
          onKeyDown={handleKeyDown}
          error={shownError}
          className="pr-28"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="absolute right-0 top-0 h-[42px] min-w-[75px] cursor-pointer whitespace-nowrap rounded-tr-[4px] border-b-2 border-(--border-plain-grey) bg-(--background-disabled-grey) px-4 text-sm font-medium text-(--text-mention-grey) transition-colors hover:text-(--text-action-high-blue-france)"
        >
          Ajouter
        </button>
      </div>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Domaines autorisés">
          {value.map((domain) => (
            <li
              key={domain}
              className="inline-flex h-6 items-center gap-2 rounded-full bg-(--background-action-high-blue-france) pl-3 pr-2 text-xs leading-5 text-(--text-inverted-blue-france)"
            >
              <span className="truncate">{domain}</span>
              <button
                type="button"
                aria-label={`Retirer ${domain}`}
                className="flex cursor-pointer items-center"
                onClick={() =>
                  onChange(value.filter((current) => current !== domain))
                }
              >
                <RiCloseCircleFill className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

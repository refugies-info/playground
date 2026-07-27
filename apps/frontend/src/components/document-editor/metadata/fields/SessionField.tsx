"use client";

import { DatePicker, EditableField, SelectRow } from "@playground/ui";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { formatDateFr } from "@/lib/format-date";
import { useMetadata } from "../MetadataContext";

interface Session {
  startDate?: string;
  endDate?: string;
}

// "Type d'entrée" options for modalitesEntreesSorties
const MODALITES_OPTIONS = [
  { value: "0", label: "Dates fixes" },
  { value: "1", label: "A tout moment" },
] as const;

/**
 * SessionField — An editable sessions field for metadata.
 */
export function SessionField({ fieldKey }: { fieldKey: string }) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const rawValue = getFieldValue(fieldKey);

  // Parse modalitesEntreesSorties and sessions from canonical format
  // (Legacy arrays are normalized by autofix before reaching here)
  const { modalitesEntreesSorties: canonicalModalites, sessions } =
    useMemo(() => {
      let modalites: 0 | 1 | null = null;
      let sessionsList: Session[] = [];

      // Canonical format: { modalitesEntreesSorties, items }
      if (
        rawValue &&
        typeof rawValue === "object" &&
        !Array.isArray(rawValue)
      ) {
        const v = rawValue as {
          modalitesEntreesSorties?: 0 | 1 | null;
          items?: Session[] | null;
        };
        modalites = v.modalitesEntreesSorties ?? null;
        sessionsList = v.items ?? [];
      }

      return { modalitesEntreesSorties: modalites, sessions: sessionsList };
    }, [rawValue]);

  // Local state for editing
  const [localModalites, setLocalModalites] = useState<0 | 1 | null>(
    canonicalModalites,
  );
  const [localSessions, setLocalSessions] = useState<Session[]>(sessions);

  // Sync local state when entering edit mode
  const handleEdit = useCallback(() => {
    setLocalModalites(canonicalModalites);
    setLocalSessions(sessions);
    setIsEditing(true);
  }, [canonicalModalites, sessions]);

  // Save on exit (emit canonical format)
  const handleExit = useCallback(() => {
    setIsEditing(false);
    updateField(fieldKey, {
      modalitesEntreesSorties: localModalites,
      items: localSessions.length > 0 ? localSessions : null,
    });
  }, [fieldKey, updateField, localModalites, localSessions]);

  // Format date for display (fallback : valeur brute si non parsable, "—" si vide)
  const formatDate = (dateStr?: string) =>
    dateStr ? (formatDateFr(dateStr) ?? dateStr) : "—";

  // Format display value
  const hasContent = sessions.length > 0 || canonicalModalites !== null;
  const displayValue = !hasContent ? null : (
    <div className="space-y-1">
      {canonicalModalites === 1 && (
        <div className="text-xs text-[var(--text-action-high-blue-france)]">
          Entrées permanentes
        </div>
      )}
      {canonicalModalites === 0 && (
        <div className="text-xs text-[var(--text-mention-grey)]">
          Dates fixes
        </div>
      )}
      {sessions.map((session, index) => (
        <div
          key={`session-${session?.startDate || index}-${session?.endDate || index}`}
          className="text-sm"
        >
          Du {formatDate(session?.startDate)} au {formatDate(session?.endDate)}
        </div>
      ))}
    </div>
  );

  // Local handlers
  const handleAdd = useCallback(() => {
    const now = new Date().toISOString();
    setLocalSessions((prev) => [...prev, { startDate: now, endDate: now }]);
  }, []);

  const handleUpdate = useCallback(
    (index: number, field: "startDate" | "endDate", date: Date | undefined) => {
      setLocalSessions((prev) => {
        const newSessions = [...prev];
        newSessions[index] = {
          ...newSessions[index],
          [field]: date?.toISOString(),
        };
        return newSessions;
      });
    },
    [],
  );

  const handleRemove = useCallback((index: number) => {
    setLocalSessions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={handleEdit}
      onExit={handleExit}
      placeholder="Aucune session"
      renderEdit={() => (
        <div className="flex w-full flex-col gap-2 rounded-[2px] border border-[var(--border-default-grey)] bg-white p-2 shadow-md">
          {/* Type d'entrée */}
          <SelectRow
            label="Type d'entrée"
            options={MODALITES_OPTIONS}
            value={localModalites !== null ? String(localModalites) : undefined}
            onChange={(v) => setLocalModalites(Number(v) as 0 | 1)}
            placeholder="À définir"
          />

          {/* Sessions list */}
          <div className="flex flex-col gap-2 px-2">
            {localSessions.map((session, index) => (
              <div
                key={`session-${session.startDate || index}`}
                className="flex items-center gap-2"
              >
                <span className="text-[14px] leading-[24px] text-[var(--text-default-grey)]">
                  Du
                </span>
                <DatePicker
                  value={
                    session.startDate ? new Date(session.startDate) : undefined
                  }
                  onChange={(date) => handleUpdate(index, "startDate", date)}
                  placeholder="Début"
                  className="w-32"
                />
                <span className="text-[14px] leading-[24px] text-[var(--text-default-grey)]">
                  au
                </span>
                <DatePicker
                  value={
                    session.endDate ? new Date(session.endDate) : undefined
                  }
                  onChange={(date) => handleUpdate(index, "endDate", date)}
                  placeholder="Fin"
                  className="w-32"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1 text-[var(--text-mention-grey)] hover:text-[var(--text-default-error)]"
                  aria-label={`Supprimer session ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-1 text-[14px] leading-[24px] text-[var(--text-action-high-blue-france)] hover:underline"
            >
              <Plus className="h-4 w-4" />
              Ajouter une session
            </button>
          </div>
        </div>
      )}
    >
      {displayValue}
    </EditableField>
  );
}

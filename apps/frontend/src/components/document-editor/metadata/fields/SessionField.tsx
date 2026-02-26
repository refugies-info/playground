"use client";

import { DatePicker, EditableField } from "@playground/ui";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useMetadata } from "../MetadataContext";

interface Session {
  startDate?: string;
  endDate?: string;
}

/**
 * SessionField — An editable sessions field for metadata.
 */
export function SessionField({ fieldKey }: { fieldKey: string }) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const rawValue = getFieldValue(fieldKey);

  // Parse sessions from raw value
  const sessions = useMemo<Session[]>(() => {
    if (!Array.isArray(rawValue)) return [];

    if (rawValue[0]?.$date || rawValue[0]?.debut?.$date) {
      return rawValue.map(
        (p: { debut?: { $date?: string }; fin?: { $date?: string } }) => ({
          startDate: p.debut?.$date,
          endDate: p.fin?.$date,
        }),
      );
    }

    return rawValue as Session[];
  }, [rawValue]);

  // Local state for editing
  const [localSessions, setLocalSessions] = useState<Session[]>(sessions);

  // Sync local state when entering edit mode
  const handleEdit = useCallback(() => {
    setLocalSessions(sessions);
    setIsEditing(true);
  }, [sessions]);

  // Save on exit
  const handleExit = useCallback(() => {
    setIsEditing(false);
    if (localSessions.length > 0) {
      updateField(fieldKey, localSessions);
    }
  }, [fieldKey, updateField, localSessions]);

  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR");
    } catch {
      return dateStr;
    }
  };

  // Format display value
  const displayValue =
    sessions.length === 0 ? null : (
      <div className="space-y-1">
        {sessions.map((session, index) => (
          <div
            key={`session-${session?.startDate || index}-${session?.endDate || index}`}
            className="text-sm"
          >
            Du {formatDate(session?.startDate)} au{" "}
            {formatDate(session?.endDate)}
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
        <div className="space-y-2 p-1">
          {localSessions.map((session, index) => (
            <div
              key={`session-${session.startDate || index}`}
              className="flex items-center gap-2"
            >
              <span className="text-xs text-gray-500">Du</span>
              <DatePicker
                value={
                  session.startDate ? new Date(session.startDate) : undefined
                }
                onChange={(date) => handleUpdate(index, "startDate", date)}
                placeholder="Début"
                className="w-32"
              />
              <span className="text-xs text-gray-500">au</span>
              <DatePicker
                value={session.endDate ? new Date(session.endDate) : undefined}
                onChange={(date) => handleUpdate(index, "endDate", date)}
                placeholder="Fin"
                className="w-32"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1 text-gray-400 hover:text-red-500"
                aria-label={`Supprimer session ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Ajouter une session
          </button>
        </div>
      )}
    >
      {displayValue}
    </EditableField>
  );
}

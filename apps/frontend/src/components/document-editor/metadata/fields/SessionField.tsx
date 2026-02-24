"use client";

import { DatePicker, EditableField } from "@playground/ui";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useMetadata } from "../MetadataContext";

/**
 * Props for the SessionField component.
 */
interface SessionFieldProps {
  /** Metadata field key */
  fieldKey: string;

  /** Display label */
  label: string;
}

interface Session {
  startDate?: string;
  endDate?: string;
}

/**
 * SessionField — An editable sessions field for metadata.
 *
 * @description
 * Displays a list of sessions (start/end dates) with CRUD operations.
 * Read mode shows formatted text, click to edit.
 */
export function SessionField({ fieldKey }: SessionFieldProps) {
  const { getFieldValue, updateField } = useMetadata();
  const [isEditing, setIsEditing] = useState(false);

  const rawValue = getFieldValue(fieldKey);

  // Memoize sessions parsing
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

  const handleAdd = useCallback(() => {
    const now = new Date().toISOString();
    const newSession: Session = {
      startDate: now,
      endDate: now,
    };
    updateField(fieldKey, [...sessions, newSession]);
  }, [fieldKey, updateField, sessions]);

  const handleUpdate = useCallback(
    (index: number, field: "startDate" | "endDate", date: Date | undefined) => {
      const newSessions = [...sessions];
      newSessions[index] = {
        ...newSessions[index],
        [field]: date?.toISOString(),
      };
      updateField(fieldKey, newSessions);
    },
    [fieldKey, updateField, sessions],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const newSessions = sessions.filter((_, i) => i !== index);
      updateField(fieldKey, newSessions.length > 0 ? newSessions : undefined);
    },
    [fieldKey, updateField, sessions],
  );

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
    sessions.length === 0
      ? "Aucune session"
      : sessions.length === 1
        ? `Du ${formatDate(sessions[0]?.startDate)} au ${formatDate(sessions[0]?.endDate)}`
        : `${sessions.length} sessions`;

  return (
    <EditableField
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onExit={() => setIsEditing(false)}
      placeholder="Cliquer pour modifier"
      renderEdit={() => (
        <div className="space-y-2 p-1">
          {/* Session list */}
          {sessions.map((session, index) => (
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

          {/* Add button */}
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

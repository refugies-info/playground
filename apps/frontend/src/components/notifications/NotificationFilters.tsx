"use client";

import {
  NOTIFICATION_TYPES,
  type NotificationType,
} from "@playground/shared-types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  SegmentedControl,
} from "@playground/ui";
import { Plus, X } from "lucide-react";
import type {
  NotificationCounts,
  NotificationTab,
} from "@/services/notifications";

export function NotificationFilters({
  tab,
  onTabChange,
  counts,
  selectedTypes,
  onTypesChange,
}: {
  tab: NotificationTab;
  onTabChange: (tab: NotificationTab) => void;
  counts: NotificationCounts;
  selectedTypes: NotificationType[];
  onTypesChange: (types: NotificationType[]) => void;
}) {
  const availableTypes = NOTIFICATION_TYPES.filter(
    (type) => !selectedTypes.includes(type.value),
  );

  const addType = (type: NotificationType) =>
    onTypesChange([...selectedTypes, type]);
  const removeType = (type: NotificationType) =>
    onTypesChange(selectedTypes.filter((value) => value !== type));

  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      <SegmentedControl
        variant="outlined"
        value={tab}
        onChange={onTabChange}
        aria-label="Filtrer les notifications par statut"
        options={[
          { value: "all", label: `Toutes (${counts.all})` },
          { value: "unread", label: `Non lues (${counts.unread})` },
          { value: "archived", label: `Archivées (${counts.archived})` },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm leading-6 text-(--text-default-grey)">
          Filtrer par :
        </span>

        {selectedTypes.map((type) => {
          const meta = NOTIFICATION_TYPES.find((item) => item.value === type);
          return (
            <span
              key={type}
              className="inline-flex items-center gap-1 rounded-full bg-(--background-alt-blue-france) py-1 pl-3 pr-1 text-sm text-(--text-action-high-blue-france)"
            >
              {meta?.label ?? type}
              <button
                type="button"
                onClick={() => removeType(type)}
                title={`Retirer le filtre ${meta?.label ?? type}`}
                className="flex size-5 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-action-high-blue-france)"
              >
                <X className="size-3" aria-hidden />
                <span className="sr-only">
                  Retirer le filtre {meta?.label ?? type}
                </span>
              </button>
            </span>
          );
        })}
        {availableTypes.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                title="Ajouter un filtre par type"
                className="flex size-8 cursor-pointer items-center justify-center rounded border border-(--border-default-grey) text-(--text-action-high-blue-france) transition-colors hover:bg-(--background-alt-blue-france) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-action-high-blue-france)"
              >
                <Plus className="size-4" aria-hidden />
                <span className="sr-only">Ajouter un filtre par type</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-1">
              <ul className="flex flex-col">
                {availableTypes.map((type) => (
                  <li key={type.value}>
                    <button
                      type="button"
                      onClick={() => addType(type.value)}
                      className="w-full cursor-pointer rounded px-3 py-2 text-left text-sm text-(--text-default-grey) transition-colors hover:bg-(--background-alt-blue-france)"
                    >
                      {type.label}
                    </button>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}

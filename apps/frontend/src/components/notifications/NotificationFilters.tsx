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
import { RiAddLine, RiCloseLine } from "@playground/ui/icons";
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
    <div className="flex flex-col gap-6 px-5 py-4 pb-0">
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

      <div className="flex flex-wrap items-center gap-1">
        <span className="text-sm leading-6 text-(--text-mention-grey)">
          Filtrer par :
        </span>

        {selectedTypes.map((type) => {
          const meta = NOTIFICATION_TYPES.find((item) => item.value === type);
          const label = meta?.label ?? type;
          return (
            <span
              key={type}
              className="inline-flex items-center gap-[2px] rounded-2xl bg-(--background-action-low-blue-france) py-[2px] pl-2 pr-[5px] text-xs leading-5 text-(--text-title-grey)"
            >
              {label}
              <button
                type="button"
                onClick={() => removeType(type)}
                title={`Retirer le filtre ${label}`}
                className="flex cursor-pointer items-center justify-center rounded-full text-(--text-title-grey) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-action-high-blue-france)"
              >
                <RiCloseLine size={12} aria-hidden />
                <span className="sr-only">Retirer le filtre {label}</span>
              </button>
            </span>
          );
        })}
        {availableTypes.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              {/* Bouton nu de 32px : la maquette ne lui donne ni bordure ni
                  fond, seul le survol le matérialise. */}
              <button
                type="button"
                title="Ajouter un filtre par type"
                className="flex size-8 cursor-pointer items-center justify-center bg-white text-(--text-mention-grey) transition-colors hover:bg-(--background-alt-blue-france) hover:text-(--text-action-high-blue-france) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-action-high-blue-france)"
              >
                <RiAddLine size={16} aria-hidden />
                <span className="sr-only">Ajouter un filtre par type</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[120px] rounded-[2px] p-2"
            >
              <ul className="flex flex-col">
                {availableTypes.map((type) => (
                  <li key={type.value}>
                    <button
                      type="button"
                      onClick={() => addType(type.value)}
                      className="w-full cursor-pointer rounded-[2px] px-2 py-1 text-left text-sm font-medium leading-6 text-(--text-default-grey) transition-colors hover:bg-(--background-alt-blue-france)"
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

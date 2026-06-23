"use client";

import {
  ACTIVITY_LOG_TYPES,
  type ActivityLogType,
  LANGUAGES,
  TYPE_ARCHIVAGE,
  TYPE_ASSIGNMENT,
  TYPE_CLEAR_LANGUAGE,
  TYPE_COMPLIANCE_HUMAN,
  TYPE_COMPLIANCE_IA,
  TYPE_NOTE,
  TYPE_PUBLICATION,
  TYPE_PUBLICATION_LANGUE,
  TYPE_TRANSLATION,
  TYPE_TRANSLATION_ERROR,
  TYPE_TRANSLATION_PRIORITY,
  TYPE_UPDATE,
  TYPE_UPDATE_COMPLIANCE,
} from "@playground/shared-types";
import { Avatar, BoutonFiltre } from "@playground/ui/primitives";
import {
  type RemixiconComponentType,
  RiAuctionLine,
  RiFileTextLine,
  RiGlobalLine,
  RiPencilLine,
  RiTranslate2,
  RiUserLine,
} from "@remixicon/react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import type { ActivityLogEntry } from "@/services/activity-logs";

interface Profile {
  id: string;
  email: string;
  displayName: string;
}

interface ActivityLogsFilters extends Record<string, string> {
  type: string;
  profile: string;
  language: string;
}

interface ActivityLogsViewProps {
  logs: ActivityLogEntry[];
  profiles: Profile[];
  initialFilters: ActivityLogsFilters;
}

const UNASSIGNED = "__unassigned__";

const TYPE_META = new Map(ACTIVITY_LOG_TYPES.map((t) => [t.value, t]));
const LANGUAGE_LABELS = new Map<string, string>(
  LANGUAGES.map((l) => [l.code, l.label]),
);

interface BadgeColors {
  bg: string;
  fg: string;
}

interface TypeBadge {
  icon: RemixiconComponentType;
  colors?: BadgeColors;
}

const GREY: BadgeColors = {
  bg: "bg-(--background-contrast-grey)",
  fg: "text-(--text-default-grey)",
};
const SUCCESS: BadgeColors = {
  bg: "bg-(--background-flat-success)",
  fg: "text-(--text-inverted-grey)",
};
const ERROR: BadgeColors = {
  bg: "bg-(--background-flat-error)",
  fg: "text-(--text-inverted-grey)",
};
const INFO: BadgeColors = {
  bg: "bg-(--background-flat-info)",
  fg: "text-(--text-inverted-grey)",
};

const TYPE_BADGE: Record<ActivityLogType, TypeBadge> = {
  [TYPE_COMPLIANCE_IA]: { icon: RiAuctionLine },
  [TYPE_COMPLIANCE_HUMAN]: { icon: RiAuctionLine },
  [TYPE_UPDATE_COMPLIANCE]: { icon: RiAuctionLine },
  [TYPE_ASSIGNMENT]: { icon: RiUserLine },
  [TYPE_CLEAR_LANGUAGE]: { icon: RiFileTextLine },
  [TYPE_NOTE]: { icon: RiPencilLine },
  [TYPE_TRANSLATION]: { icon: RiTranslate2 },
  [TYPE_TRANSLATION_PRIORITY]: { icon: RiTranslate2 },
  [TYPE_TRANSLATION_ERROR]: { icon: RiTranslate2 },
  [TYPE_UPDATE]: { icon: RiGlobalLine, colors: INFO },
  [TYPE_PUBLICATION]: { icon: RiGlobalLine, colors: SUCCESS },
  [TYPE_PUBLICATION_LANGUE]: { icon: RiGlobalLine, colors: SUCCESS },
  [TYPE_ARCHIVAGE]: { icon: RiGlobalLine, colors: ERROR },
};

const DEFAULT_BADGE: TypeBadge = { icon: RiFileTextLine };

function ActivityTypeIcon({ action }: { action: ActivityLogType }) {
  const label = TYPE_META.get(action)?.label ?? action;
  const { icon: Icon, colors } = TYPE_BADGE[action] ?? DEFAULT_BADGE;
  const { bg, fg } = colors ?? GREY;
  return (
    <div
      className={`flex size-6 shrink-0 items-center justify-center rounded-full border-[0.6px] border-(--border-default-grey) ${bg} ${fg}`}
      title={label}
    >
      <Icon size={12} color="currentColor" />
    </div>
  );
}

function formatActivityText(entry: ActivityLogEntry): string {
  const meta = TYPE_META.get(entry.action);
  if (!meta) return entry.action;

  const author = entry.authorName ?? "PapaIA";
  let values: string[];
  switch (entry.action) {
    case TYPE_ASSIGNMENT:
      values = [author, entry.targetName ?? "personne"];
      break;
    default:
      values = [author];
  }

  let i = 0;
  return meta.display.replace(/%s/g, () => values[i++] ?? "");
}

function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function ActivityLogsView({
  logs,
  profiles,
  initialFilters,
}: ActivityLogsViewProps) {
  const pathname = usePathname();

  // Shared filter hook: keeps state in sync with the URL search params.
  const { filters, updateFilter } = useUrlFilters<ActivityLogsFilters>({
    basePath: pathname,
    initialFilters,
  });

  const typeOptions = ACTIVITY_LOG_TYPES.map(({ value, label }) => ({
    value,
    label,
  }));

  const profileOptions = [
    { label: "PapaIA", value: UNASSIGNED },
    ...profiles.map((p) => ({ label: p.displayName, value: p.email })),
  ];

  const languageOptions = LANGUAGES.map((l) => ({
    label: l.label,
    value: l.code,
  }));

  // Group filtered logs by day, preserving the newest-first order of `logs`.
  const groups = useMemo(() => {
    const filtered = logs.filter((log) => {
      if (filters.type && log.action !== filters.type) return false;
      if (filters.profile) {
        if (filters.profile === UNASSIGNED) {
          if (log.authorEmail) return false;
        } else if (log.authorEmail !== filters.profile) {
          return false;
        }
      }
      if (filters.language && log.language !== filters.language) return false;
      return true;
    });

    const map = new Map<string, ActivityLogEntry[]>();
    for (const log of filtered) {
      const key = dayKey(new Date(log.createdAt));
      const bucket = map.get(key);
      if (bucket) {
        bucket.push(log);
      } else {
        map.set(key, [log]);
      }
    }
    return [...map.entries()];
  }, [logs, filters.type, filters.profile, filters.language]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="mx-auto space-y-6">
          <div className="w-full flex flex-col gap-8">
            <h1 className="fr-h1">Journal d'activités</h1>
            <div className="flex flex-wrap items-center gap-4">
              <BoutonFiltre
                label="Type"
                options={typeOptions}
                value={filters.type}
                onChange={(value) => updateFilter("type", value)}
              />
              <BoutonFiltre
                label="Qui"
                options={profileOptions}
                value={filters.profile}
                onChange={(value) => updateFilter("profile", value)}
              />
              <BoutonFiltre
                label="Langue"
                options={languageOptions}
                value={filters.language}
                onChange={(value) => updateFilter("language", value)}
              />
            </div>

            {groups.length === 0 ? (
              <p className="fr-text--xs text-(--text-disabled-grey)">
                Aucune activité pour le moment.
              </p>
            ) : (
              // "logs" — gap 56px between day groups
              <div className="flex flex-col gap-14">
                {groups.map(([key, entries]) => {
                  const dateLabel = new Date(
                    entries[0].createdAt,
                  ).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    // "log par date" — date header then the day's log list
                    <section key={key} className="flex flex-col gap-4">
                      <h2 className="fr-h6">{dateLabel}</h2>

                      {/* "liste des logs" — gap 8px */}
                      <div className="flex flex-col gap-2">
                        {entries.map((entry) => {
                          const time = new Date(
                            entry.createdAt,
                          ).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                          return (
                            <div
                              key={entry.id}
                              className="flex items-center gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <span className="fr-text--xs text-(--text-disabled-grey)">
                                  {time}
                                </span>
                                <ActivityTypeIcon action={entry.action} />
                              </div>
                              {/* "Description du log" — avatar + text */}
                              <div className="flex flex-1 items-center gap-3 px-2">
                                <Avatar
                                  email={entry.authorEmail}
                                  className="size-6"
                                />
                                <p className="fr-text--md text-(--text-default-grey)">
                                  {formatActivityText(entry)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

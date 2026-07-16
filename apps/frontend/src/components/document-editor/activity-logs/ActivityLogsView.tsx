"use client";

import {
  ACTIVITY_LOG_TYPES,
  type ActivityLogType,
  dayKey,
  LANGUAGES,
  TYPE_ARCHIVE,
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
import {
  Avatar,
  BADGE_ERROR,
  BADGE_INFO,
  BADGE_SUCCESS,
  type BadgeColors,
  BoutonFiltre,
  IconBadge,
} from "@playground/ui/primitives";
import {
  type RemixiconComponentType,
  RiAuctionLine,
  RiFileTextLine,
  RiGlobalLine,
  RiPencilLine,
  RiTranslate2,
  RiUserLine,
} from "@remixicon/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { formatDateFr } from "@/lib/format-date";
import type { Profile } from "@/lib/profile";
import type { ActivityLogEntry } from "@/services/activity-logs";
import { NoteComposer } from "./NoteComposer";

interface ActivityLogsFilters extends Record<string, string> {
  type: string;
  profile: string;
  language: string;
}

interface ActivityLogsViewProps {
  workflowId: string;
  logs: ActivityLogEntry[];
  profiles: Profile[];
  initialFilters: ActivityLogsFilters;
}

const UNASSIGNED = "__unassigned__";

const TYPE_META = new Map(ACTIVITY_LOG_TYPES.map((t) => [t.value, t]));
const LANGUAGE_LABELS = new Map<string, string>(
  LANGUAGES.map((l) => [l.code, l.label]),
);

// Mapping métier : type de log → icône + couleurs (tokens DSFR du design system).
interface TypeBadge {
  icon: RemixiconComponentType;
  colors?: BadgeColors;
}

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
  [TYPE_UPDATE]: { icon: RiGlobalLine, colors: BADGE_INFO },
  [TYPE_PUBLICATION]: { icon: RiGlobalLine, colors: BADGE_SUCCESS },
  [TYPE_PUBLICATION_LANGUE]: { icon: RiGlobalLine, colors: BADGE_SUCCESS },
  [TYPE_ARCHIVE]: { icon: RiGlobalLine, colors: BADGE_ERROR },
};

const DEFAULT_BADGE: TypeBadge = { icon: RiFileTextLine };

// Compliance verdict → human label, fills the "%s" in the jugement templates.
const COMPLIANCE_LABELS: Record<string, string> = {
  compliant: "conforme",
  non_compliant: "non conforme",
  error: "en erreur",
};

function ActivityTypeIcon({ action }: { action: ActivityLogType }) {
  const label = TYPE_META.get(action)?.label ?? action;
  const { icon, colors } = TYPE_BADGE[action] ?? DEFAULT_BADGE;
  return <IconBadge icon={icon} colors={colors} title={label} />;
}

function formatActivityText(entry: ActivityLogEntry): string {
  const meta = TYPE_META.get(entry.action);
  if (!meta) return entry.action;

  const author = entry.authorName ?? "PapaIA";
  const langLabel = entry.language
    ? (LANGUAGE_LABELS.get(entry.language) ?? entry.language)
    : "";
  const verdict = entry.complianceStatus
    ? (COMPLIANCE_LABELS[entry.complianceStatus] ?? entry.complianceStatus)
    : "";

  let values: string[];
  switch (entry.action) {
    case TYPE_ASSIGNMENT:
      values = [author, entry.targetName ?? "personne"];
      break;
    case TYPE_COMPLIANCE_IA:
      // "PapaIA a jugé cette fiche %s"
      values = [verdict];
      break;
    case TYPE_COMPLIANCE_HUMAN:
    case TYPE_UPDATE_COMPLIANCE:
      // "%s a … jugé cette fiche %s"
      values = [author, verdict];
      break;
    case TYPE_PUBLICATION_LANGUE:
      // "%s a publié la fiche en %s"
      values = [author, langLabel];
      break;
    case TYPE_TRANSLATION_ERROR:
      // "La traduction en %s n'a pas fonctionné"
      values = [langLabel];
      break;
    case TYPE_NOTE:
      // "%s : %s"
      values = [author, entry.note ?? ""];
      break;
    default:
      values = [author];
  }

  let i = 0;
  return meta.display.replace(/%s/g, () => values[i++] ?? "");
}

function formatAiConsumption(entry: ActivityLogEntry): string | null {
  const report = entry.lettaReport;
  if (!report) return null;

  const model = report.model?.trim();
  const tokenCost = report.tokenCost?.toLocaleString("fr-FR");

  if (!model && tokenCost == null) return null;
  if (!model) return `${tokenCost} tokens`;
  if (tokenCost == null) return model;

  return `${model} (${tokenCost} tokens)`;
}

export function ActivityLogsView({
  workflowId,
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
    ...profiles.map((p) => ({
      label: p.displayName ?? p.email,
      value: p.email,
    })),
  ];

  const languageOptions = LANGUAGES.map((l) => ({
    label: l.label,
    value: l.code,
  }));

  const hasActiveFilters = Boolean(
    filters.type || filters.profile || filters.language,
  );

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
        <div className="mx-auto max-w-[800px] space-y-6">
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

            <NoteComposer workflowId={workflowId} />

            {groups.length === 0 ? (
              <div className="flex flex-col items-center gap-8 py-16">
                <Image
                  src="/empty-state-no-result.svg"
                  alt=""
                  width={179}
                  height={122}
                  priority
                />
                <p className="fr-h6 text-center text-(--text-default-grey)">
                  {hasActiveFilters
                    ? "Oups ! Il n'y a aucun résultat avec les filtres appliqués."
                    : "Aucune activité n'a encore été enregistrée pour cette fiche."}
                </p>
              </div>
            ) : (
              // "logs" — gap 56px between day groups
              <div className="flex flex-col gap-14">
                {groups.map(([key, entries]) => {
                  const dateLabel = formatDateFr(entries[0].createdAt, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    // "log par date" — date header then the day's log list
                    <section key={key} className="flex flex-col gap-4">
                      <h2 className="fr-h6">{dateLabel}</h2>

                      {/* "liste des logs" */}
                      <div className="flex flex-col gap-2">
                        {entries.map((entry, idx) => {
                          const time = new Date(entry.createdAt)
                            .toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            .replace(":", "h");
                          return (
                            <div
                              key={entry.id}
                              className="flex items-start gap-3 min-h-10"
                            >
                              <div className="flex shrink-0 items-center gap-3 self-stretch">
                                <span className="fr-text--xs text-(--text-disabled-grey) w-[38px] tabular-nums">
                                  {time}
                                </span>
                                <div className="flex flex-col items-center self-stretch">
                                  <span className="flex flex-1 w-full flex-col items-center justify-end">
                                    <span
                                      className={`w-[0.5px] bg-(--border-default-grey) ${idx === 0 ? "h-1" : "flex-1"}`}
                                    />
                                  </span>
                                  <ActivityTypeIcon action={entry.action} />
                                  <span className="flex flex-1 w-full flex-col items-center justify-start">
                                    <span
                                      className={`w-[0.5px] bg-(--border-default-grey) ${idx === entries.length - 1 ? "h-1" : "flex-1 -mb-2"}`}
                                    />
                                  </span>
                                </div>
                              </div>
                              {/* "Description du log" — avatar + text.
                                  Les notes sont mises en avant : fond alt-blue-france. */}
                              <div
                                className={`flex flex-1 items-start gap-3 p-2 ${
                                  entry.action === TYPE_NOTE
                                    ? "bg-(--background-alt-blue-france) border border-(--border-open-blue-france)"
                                    : ""
                                }`}
                              >
                                <Avatar
                                  displayName={entry.authorName ?? undefined}
                                  className="size-6 shrink-0"
                                />
                                <div className="flex min-w-0 flex-1 flex-row gap-2">
                                  <p className="fr-text--md text-(--text-default-grey)">
                                    {formatActivityText(entry)}
                                  </p>
                                  {formatAiConsumption(entry) ? (
                                    <span className="inline-flex w-fit items-center justify-center rounded-full bg-[#EEEEEE] px-3 py-0.5 text-xs font-normal leading-5 text-[#929292]">
                                      {formatAiConsumption(entry)}
                                    </span>
                                  ) : null}
                                </div>
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

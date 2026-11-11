import { Badge, type BadgeProps } from "@playground/ui/primitives";
import { formatDateFr, formatTimeFr } from "@/lib/format-date";

import type { IngestionRunSummary } from "@/lib/ingestion-run";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

const STATUS_BADGES: Record<string, { label: string; variant: BadgeVariant }> =
  {
    running: { label: "En cours", variant: "info" },
    completed: { label: "Terminé", variant: "success" },
    failed: { label: "Échec", variant: "danger" },
  };

const formatDateTime = (value: string | null) =>
  value ? `${formatDateFr(value)} à ${formatTimeFr(value)}` : "—";

function Stat({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-l border-gray-200 pl-4 first:border-l-0 first:pl-0">
      <dt className="order-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd
        className={`order-1 text-3xl font-bold leading-none tabular-nums ${alert && value > 0 ? "text-red-700" : "text-gray-900"}`}
      >
        {value.toLocaleString("fr-FR")}
      </dd>
    </div>
  );
}

export function LatestIngestionRunCard({ run }: { run: IngestionRunSummary }) {
  const badge = STATUS_BADGES[run.status] ?? {
    label: run.status,
    variant: "neutral" as const,
  };

  return (
    <section className="mb-8 border-b border-gray-200 pb-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-lg font-semibold text-gray-900">
          Dernier import {run.source.toUpperCase()}
        </h2>
        <Badge variant={badge.variant}>{badge.label}</Badge>
        <p className="text-sm text-gray-500">
          {formatDateTime(run.createdAt)} → {formatDateTime(run.completedAt)}
        </p>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-4">
        {run.rco ? (
          <>
            <Stat label="Nouvelles" value={run.rco.changes.new} />
            <Stat label="Reprises DI" value={run.rco.changes.baseline} />
            <Stat
              label="Sessions seules"
              value={run.rco.changes.sessions_only}
            />
            <Stat label="Contenu modifié" value={run.rco.changes.content} />
            <Stat label="Inchangées" value={run.rco.changes.unchanged} />
            <Stat
              label="Fiches à valider"
              value={run.rco.ingestionRecordsCreated}
            />
            <Stat label="Erreurs" value={run.rco.errors.length} alert />
          </>
        ) : (
          <>
            <Stat label="Récupérées" value={run.counts.fetched} />
            <Stat label="Insérées" value={run.counts.inserted} />
            <Stat label="Mises à jour" value={run.counts.updated} />
            <Stat label="Inchangées" value={run.counts.unchanged} />
            <Stat label="Erreurs" value={run.counts.errors} alert />
          </>
        )}
      </dl>

      {run.rco && run.rco.errors.length > 0 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-red-700">
            Voir les erreurs ({run.rco.errors.length})
          </summary>
          <ul className="mt-2 space-y-1">
            {run.rco.errors.map(({ numeroAction, error }) => (
              <li key={`${numeroAction}:${error}`}>
                <code className="bg-gray-100 px-1 rounded">{numeroAction}</code>{" "}
                {error}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

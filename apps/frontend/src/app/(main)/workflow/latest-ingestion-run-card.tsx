import { Badge, type BadgeProps } from "@playground/ui/primitives";
import { formatDateFr, formatTimeFr } from "@/lib/format-date";

import type { IngestionRunSummary } from "@/lib/ingestion-run";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

const STATUS_BADGES: Record<string, { label: string; variant: BadgeVariant }> =
  {
    running: { label: "En cours", variant: "info" },
    completed: { label: "Terminé", variant: "success" },
    interrupted: { label: "Interrompu", variant: "warning" },
    failed: { label: "Échec", variant: "danger" },
  };

const formatDateTime = (value: string | null) =>
  value ? `${formatDateFr(value)} à ${formatTimeFr(value)}` : "—";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-lg font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export function LatestIngestionRunCard({ run }: { run: IngestionRunSummary }) {
  const badge = STATUS_BADGES[run.status] ?? {
    label: run.status,
    variant: "neutral" as const,
  };

  return (
    <section className="mt-6 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <h3 className="font-semibold text-gray-900">
          Dernier import {run.source.toUpperCase()}
        </h3>
        <Badge variant={badge.variant}>{badge.label}</Badge>
        {run.dryRun && <Badge variant="neutral">Dry run</Badge>}
        <span className="text-sm text-gray-500">
          lancé le {formatDateTime(run.createdAt)} · fini le{" "}
          {formatDateTime(run.completedAt)}
        </span>
      </div>

      {run.progress && (
        <p className="text-sm text-gray-700 mb-3">
          Actions traitées : {run.progress.processed} / {run.progress.total}
          {run.status === "interrupted" &&
            " — le prochain clic reprend ce run à cet endroit."}
        </p>
      )}

      {run.rco ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          <Stat label="Nouvelles" value={run.rco.changes.new} />
          <Stat label="Reprises DI" value={run.rco.changes.baseline} />
          <Stat label="Sessions seules" value={run.rco.changes.sessions_only} />
          <Stat label="Contenu modifié" value={run.rco.changes.content} />
          <Stat label="Inchangées" value={run.rco.changes.unchanged} />
          <Stat label="Absentes RCO" value={run.rco.missing} />
          <Stat
            label="Fiches à valider"
            value={run.rco.ingestionRecordsCreated}
          />
          <Stat label="Erreurs" value={run.rco.errors.length} />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Stat label="Récupérées" value={run.counts.fetched} />
          <Stat label="Insérées" value={run.counts.inserted} />
          <Stat label="Mises à jour" value={run.counts.updated} />
          <Stat label="Inchangées" value={run.counts.unchanged} />
          <Stat label="Erreurs" value={run.counts.errors} />
        </div>
      )}

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

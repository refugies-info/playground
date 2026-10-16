import { Badge, type BadgeProps } from "@playground/ui/primitives";
import Link from "next/link";
import { formatDateFr, formatTimeFr } from "@/lib/format-date";

import type { DiComparisonRow, IngestionRunSummary } from "@/lib/ingestion-run";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

// Legend of RCO outcomes; `changes` explains the "Changements" column
// when an outcome has no field-level diff.
const CHANGE_LABELS: Record<
  string,
  { label: string; variant: BadgeVariant; meaning: string; changes: string }
> = {
  new: {
    label: "Nouvelle",
    variant: "info",
    meaning: "Action inconnue : crée une fiche v1 à valider.",
    changes: "Nouvelle fiche",
  },
  baseline: {
    label: "Reprise DI",
    variant: "success",
    meaning:
      "Action déjà importée depuis DI : sa première version RCO devient la référence. Formats DI et RCO différents : seuls les champs communs (titre, structure, commune, heures, sessions) sont comparés. La fiche publiée n'est pas modifiée ; les runs suivants comparent RCO à RCO.",
    changes: "Référence RCO",
  },
  sessions_only: {
    label: "Sessions seules",
    variant: "warning",
    meaning:
      "Seules les sessions changent : pas de revalidation, visible dans la vue rco_session_updates_pending avant republication.",
    changes: "",
  },
  content: {
    label: "Contenu modifié",
    variant: "warning",
    meaning:
      "Un champ de l'action change : nouvelle version à valider (audit + validation humaine).",
    changes: "",
  },
  unchanged: {
    label: "Inchangée",
    variant: "neutral",
    meaning: "Identique à la dernière version RCO : rien n'est écrit.",
    changes: "Aucun",
  },
  error: {
    label: "Erreur",
    variant: "danger",
    meaning: "Action ignorée, voir la liste des erreurs ; le lot continue.",
    changes: "—",
  },
};

const STATUS_BADGES: Record<string, { label: string; variant: BadgeVariant }> =
  {
    running: { label: "En cours", variant: "info" },
    completed: { label: "Terminé", variant: "success" },
    failed: { label: "Échec", variant: "danger" },
  };

const formatDateTime = (value: string | null) =>
  value ? `${formatDateFr(value)} à ${formatTimeFr(value)}` : "—";

function DiComparison({ rows }: { rows: DiComparisonRow[] }) {
  const gaps = rows.filter(({ same }) => !same).length;
  return (
    <details>
      <summary
        className={`cursor-pointer ${gaps > 0 ? "text-yellow-700" : "text-green-700"}`}
      >
        {gaps > 0 ? `${gaps} écart(s) avec DI` : "Identique à DI"}
      </summary>
      <table className="mt-1 text-xs">
        <thead className="text-gray-500">
          <tr>
            <th className="pr-3 font-medium">Champ</th>
            <th className="pr-3 font-medium">DI</th>
            <th className="font-medium">RCO</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ field, di, rco, same }) => (
            <tr key={field} className={same ? "" : "bg-yellow-50"}>
              <td className="pr-3 align-top font-medium">{field}</td>
              <td className="pr-3 align-top">{di ?? "—"}</td>
              <td className="align-top">{rco ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

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
        <span className="text-sm text-gray-500">
          lancé le {formatDateTime(run.createdAt)} · fini le{" "}
          {formatDateTime(run.completedAt)}
        </span>
      </div>

      {run.rco ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          <Stat label="Nouvelles" value={run.rco.changes.new} />
          <Stat label="Reprises DI" value={run.rco.changes.baseline} />
          <Stat label="Sessions seules" value={run.rco.changes.sessions_only} />
          <Stat label="Contenu modifié" value={run.rco.changes.content} />
          <Stat label="Inchangées" value={run.rco.changes.unchanged} />
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

      {run.actions.length > 0 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-gray-700">
            Détail par action ({run.actions.length})
          </summary>
          <table className="mt-2 w-full text-left">
            <thead className="text-xs text-gray-500">
              <tr>
                <th className="py-1 pr-4 font-medium">N° action</th>
                <th className="py-1 pr-4 font-medium">Résultat</th>
                <th className="py-1 pr-4 font-medium">Changements</th>
                <th className="py-1 font-medium">Fiche</th>
              </tr>
            </thead>
            <tbody>
              {run.actions.map(
                ({
                  numeroAction,
                  change,
                  document,
                  changedFields,
                  diComparison,
                }) => {
                  const outcome = CHANGE_LABELS[change] ?? {
                    label: change,
                    variant: "neutral" as const,
                    meaning: "",
                    changes: "",
                  };
                  return (
                    <tr key={numeroAction} className="border-t border-gray-100">
                      <td className="py-1 pr-4">
                        <code className="bg-gray-100 px-1 rounded">
                          {numeroAction}
                        </code>
                      </td>
                      <td className="py-1 pr-4">
                        <Badge variant={outcome.variant}>{outcome.label}</Badge>
                      </td>
                      <td className="py-1 pr-4 text-gray-600">
                        {diComparison.length > 0 ? (
                          <DiComparison rows={diComparison} />
                        ) : changedFields.length > 0 ? (
                          <span className="flex flex-wrap gap-1">
                            {changedFields.map((field) => (
                              <code
                                key={field}
                                className="bg-yellow-50 px-1 rounded text-xs"
                              >
                                {field}
                              </code>
                            ))}
                          </span>
                        ) : (
                          outcome.changes || "—"
                        )}
                      </td>
                      <td className="py-1">
                        {document ? (
                          <Link
                            href={`/documents/${document.id}`}
                            className="underline text-blue-700"
                          >
                            {document.title ?? "Voir la fiche"}
                          </Link>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
          <dl className="mt-4 grid gap-2 text-xs text-gray-600">
            <dt className="font-medium text-gray-700">Légende</dt>
            {Object.entries(CHANGE_LABELS).map(
              ([change, { label, variant, meaning }]) => (
                <dd key={change} className="flex gap-2 items-start">
                  <Badge variant={variant}>{label}</Badge>
                  <span>{meaning}</span>
                </dd>
              ),
            )}
          </dl>
        </details>
      )}
    </section>
  );
}

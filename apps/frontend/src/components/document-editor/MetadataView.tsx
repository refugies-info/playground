"use client";

import { Badge } from "@playground/ui/primitives";
import { Zap } from "lucide-react";
import { useDocument } from "./DocumentContext";

/**
 * Metadata field definition.
 * Maps a label to a key in `metadata_ri` from the AI's letta_report.
 */
interface MetadataFieldDef {
  /** Display label in the table */
  label: string;
  /** Key in metadata_ri (matches AI output + provenance key) */
  riKey: string;
  /** Custom formatter for displaying the value */
  render?: (value: unknown) => React.ReactNode;
}

/**
 * Field mapping: table label → metadata_ri key.
 * Order matches the existing table layout.
 */
const METADATA_FIELDS: MetadataFieldDef[] = [
  { label: "Titre marque", riKey: "titreMarque" },
  { label: "Structure", riKey: "mainSponsor" },
  { label: "Logo", riKey: "logo" },
  {
    label: "En bref",
    riKey: "abstract",
    render: (v) => {
      if (typeof v !== "string") return null;
      return v.length > 50 ? `${v.substring(0, 50)}…` : v;
    },
  },
  {
    label: "Thèmes",
    riKey: "theme",
    render: (v) => {
      if (typeof v === "string") return v;
      if (Array.isArray(v)) return v.join(", ");
      return null;
    },
  },
  {
    label: "Besoins",
    riKey: "needs",
    render: (v) => {
      if (Array.isArray(v)) return v.join(", ");
      return null;
    },
  },
  {
    label: "Public visé",
    riKey: "publicStatus",
    render: (v) => {
      if (Array.isArray(v)) return v.join(", ");
      return null;
    },
  },
  {
    label: "Public",
    riKey: "public",
    render: (v) => {
      if (Array.isArray(v)) return v.join(", ");
      return null;
    },
  },
  {
    label: "Fréquence",
    riKey: "frequency",
    render: (v) => {
      if (!v) return null;
      if (Array.isArray(v)) {
        return v
          .map((f: Record<string, unknown>) => {
            const hours = Array.isArray(f.hours) ? f.hours[0] : f.hours;
            const unit = f.frequencyUnit || f.timeUnit || "";
            return `${hours}h/${unit}`;
          })
          .join(", ");
      }
      return String(v);
    },
  },
  {
    label: "Niveau de français",
    riKey: "frenchLevel",
    render: (v) => {
      if (Array.isArray(v)) return v.join(", ");
      return null;
    },
  },
  { label: "Âge", riKey: "age" },
  {
    label: "Prix",
    riKey: "price",
    render: (v) => {
      if (!v) return null;
      if (Array.isArray(v)) {
        return v
          .map((p: Record<string, unknown>) => {
            const values = Array.isArray(p.values)
              ? p.values.join(", ")
              : String(p.values);
            return p.details ? `${values} (${p.details})` : values;
          })
          .join(" / ");
      }
      return String(v);
    },
  },
  {
    label: "Durée totale",
    riKey: "commitment",
    render: (v) => {
      if (!v) return null;
      if (Array.isArray(v)) {
        return v
          .map((c: Record<string, unknown>) => {
            const hours = Array.isArray(c.hours) ? c.hours[0] : c.hours;
            return `${hours} ${c.timeUnit || "heures"}`;
          })
          .join(", ");
      }
      return String(v);
    },
  },
  {
    label: "Session",
    riKey: "periode",
    render: (v) => {
      if (!Array.isArray(v)) return null;
      return v.map(
        (
          session: { debut?: { $date?: string }; fin?: { $date?: string } },
          idx: number,
        ) => {
          const debut = session?.debut?.$date
            ? new Date(session.debut.$date).toLocaleDateString("fr-FR")
            : "?";
          const fin = session?.fin?.$date
            ? new Date(session.fin.$date).toLocaleDateString("fr-FR")
            : "?";
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: Concat with dates for uniqueness
            <div key={`${debut}-${fin}-${idx}`}>
              {debut} – {fin}
            </div>
          );
        },
      );
    },
  },
  {
    label: "Jours de présence",
    riKey: "timeSlots",
    render: (v) => {
      if (Array.isArray(v)) return v.join(", ");
      return null;
    },
  },
  {
    label: "Départements",
    riKey: "location",
    render: (v) => {
      if (Array.isArray(v)) return v.join(", ");
      if (typeof v === "string") return v;
      return null;
    },
  },
  {
    label: "Conditions",
    riKey: "conditions",
    render: (v) => {
      if (Array.isArray(v)) return v.join(", ");
      if (typeof v === "string") return v;
      return null;
    },
  },
  {
    label: "Zone d'action",
    riKey: "map",
    render: (v) => {
      if (!Array.isArray(v)) return null;
      return v.map((poi: Record<string, unknown>, idx: number) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: POI list
        <div key={`poi-${idx}`}>
          {poi.title ? <strong>{String(poi.title)}</strong> : null}
          {poi.address ? ` – ${String(poi.address)}` : ""}
          {poi.city ? `, ${String(poi.city)}` : ""}
        </div>
      ));
    },
  },
];

/** Resolve a dot-notation path (e.g. "structure.nom") against an object */
function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (
      acc &&
      typeof acc === "object" &&
      key in (acc as Record<string, unknown>)
    ) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/** Format a resolved value for display (truncate long strings, join arrays) */
function formatSourceValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") {
    return value.length > 60 ? `${value.substring(0, 60)}…` : value;
  }
  if (Array.isArray(value)) {
    const joined = value
      .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
      .join(", ");
    return joined.length > 60 ? `${joined.substring(0, 60)}…` : joined;
  }
  if (typeof value === "object") {
    const str = JSON.stringify(value);
    return str.length > 60 ? `${str.substring(0, 60)}…` : str;
  }
  return String(value);
}

export function MetadataView() {
  const { document } = useDocument();

  if (!document) return null;

  const report = document.metadataReport;

  // No metadata report or error → show re-generate prompt
  if (!report) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun rapport de métadonnées
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Le rapport de métadonnées IA n'a pas encore été généré ou a
            rencontré une erreur. Relancez la génération pour pré-remplir les
            métadonnées.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
            onClick={() => {
              // TODO: Wire to metadata re-generation action
              // biome-ignore lint/suspicious/noConsole: placeholder for future re-generation action
              console.log("Re-generate metadata report for", document.id);
            }}
          >
            🔄 Générer le rapport métadonnées
          </button>
        </div>
      </div>
    );
  }

  const { metadata_ri, provenance } = report;
  const diMetadata = (document.metadata ?? {}) as Record<string, unknown>;

  // Build a provenance lookup by key for quick access
  const provenanceByKey = new Map(provenance?.map((p) => [p.key, p]) ?? []);

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]"
            >
              Métadonnée
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[40%]"
            >
              Valeur(s) renseignée(s)
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[35%]"
            >
              Source RCO
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {METADATA_FIELDS.map((field) => {
            const rawValue = metadata_ri[field.riKey];
            const prov = provenanceByKey.get(field.riKey);

            let displayValue: React.ReactNode = null;

            if (field.render) {
              displayValue = field.render(rawValue);
            } else if (Array.isArray(rawValue)) {
              displayValue = rawValue.join(", ");
            } else if (rawValue !== undefined && rawValue !== null) {
              displayValue = String(rawValue);
            }

            if (!displayValue) {
              displayValue = <span className="">—</span>;
            }

            // Resolve source values from DI metadata
            const sourceDisplay = prov?.source?.length ? (
              <div className="space-y-1 text-sm">
                {prov.source.map((srcKey) => {
                  const resolved = resolvePath(diMetadata, srcKey);
                  const formattedValue = formatSourceValue(resolved);
                  return (
                    <div key={srcKey}>
                      <span className="font-bold">{srcKey}</span>
                      {formattedValue ? (
                        <>
                          {" : "}
                          <span className="">{formattedValue}</span>
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="">—</span>
            );

            return (
              <tr key={field.label} className="hover:bg-gray-50 text-sm">
                <td className="px-6 py-4">
                  <label
                    htmlFor={field.riKey}
                    className="text-md mb-2 block font-bold"
                  >
                    {field.label}
                  </label>
                  {rawValue === undefined || rawValue === null ? (
                    <Badge size="sm" variant="danger">
                      <Zap className="h-3 w-3 mr-1" /> Donnée introuvable
                    </Badge>
                  ) : (
                    <Badge size="sm" variant="warning">
                      <Zap className="h-3 w-3 mr-1" /> Pré-rempli par l'IA
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 ">
                  {displayValue}
                  <input
                    type="hidden"
                    value={displayValue.toString()}
                    id={field.riKey}
                  />
                </td>
                <td className="px-6 py-4 ">{sourceDisplay}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

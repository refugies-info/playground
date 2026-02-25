"use client";

/**
 * MetadataView — Affiche le rapport de métadonnées IA sous forme de tableau.
 *
 * Architecture du fichier :
 *
 *  1. Types              – Interfaces (RenderContext, MetadataFieldDef)
 *  2. Traductions         – Dictionnaires partagés (unités de temps)
 *  3. Renderers simples   – joinArrayOrString, truncate, withBadgeLabels, resolveToNames
 *  4. Renderers complexes – renderThemes, renderNeeds, renderPrice, renderFrequency,
 *                           renderCommitment, renderPeriode, renderAge, renderMap
 *  5. Définition champs   – METADATA_FIELDS (tableau déclaratif label / riKey / render)
 *  6. Helpers source      – resolvePath, formatSourceValue (colonne "Source RCO")
 *  7. Composant           – MetadataView (table à 3 colonnes)
 *
 * Chaque champ dans METADATA_FIELDS déclare un `render` optionnel.
 * Les renderers reçoivent la valeur brute + un RenderContext (accès aux données
 * voisines et aux lookups de référence themes/needs).
 */

import { Badge, Button } from "@playground/ui/primitives";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { triggerForceArbitration } from "@/services/document-actions";
import type { RiReferenceData } from "@/services/ri-reference-data";
import { useDocument } from "./DocumentContext";
import {
  AgeField,
  CommitmentField,
  DepartmentField,
  FrequencyField,
  MetadataProvider,
  MultiEnumField,
  PoiField,
  PriceField,
  SessionField,
  TextareaField,
  TextField,
  useMetadata,
} from "./metadata";
import {
  CONDITION_OPTIONS,
  FRENCH_LEVEL_OPTIONS,
  PUBLIC_STATUS_OPTIONS,
  PUBLIC_TYPE_OPTIONS,
  TIME_SLOT_OPTIONS,
} from "./metadata/config/metadata-config";

// =============================================================================
// Types
// =============================================================================

/**
 * Contexte partagé passé à chaque renderer de champ.
 * Permet d'accéder aux données voisines (ex: secondaryThemes) et aux
 * tables de correspondance ID → nom (themes, needs) depuis Réfugiés.info.
 */
interface RenderContext {
  /** L'objet metadata_ri complet (accès aux clés voisines, ex: secondaryThemes) */
  metadata_ri: Record<string, unknown>;
  /** Tables de correspondance ID MongoDB → nom humain (themes, needs) */
  ref: RiReferenceData;
}

/**
 * Définition déclarative d'un champ de métadonnée affiché dans le tableau.
 *
 * @example
 * { label: "Thèmes", riKey: "theme", render: renderThemes }
 */
interface MetadataFieldDef {
  /** Libellé affiché dans la colonne "Métadonnée" */
  label: string;
  /** Clé dans l'objet metadata_ri (correspond à la sortie de l'agent IA) */
  riKey: string;
  /** Renderer optionnel — si absent, la valeur brute est affichée en texte */
  render?: (value: unknown, ctx: RenderContext) => React.ReactNode;
}

// =============================================================================
// Shared translation dictionaries
// =============================================================================

/**
 * Traductions des unités de temps anglaises → français.
 * Utilisé par renderFrequency et renderCommitment.
 */
const TIME_UNIT_LABELS: Record<string, string> = {
  hour: "heure",
  hours: "heures",
  day: "jour",
  days: "jours",
  week: "semaine",
  weeks: "semaines",
  month: "mois",
  months: "mois",
  year: "an",
  years: "ans",
};

// =============================================================================
// Reusable renderers
// =============================================================================

/**
 * Factory : crée un renderer qui tronque une chaîne à `max` caractères.
 * @example truncate(50)("un texte très long...") → "un texte très lon…"
 */
const truncate =
  (max: number) =>
  (v: unknown): string | null => {
    if (typeof v !== "string") return null;
    return v.length > max ? `${v.substring(0, max)}…` : v;
  };

/**
 * Résout un ID unique ou un tableau d'IDs en noms lisibles via un dictionnaire.
 * Utilisé par renderThemes et renderNeeds pour convertir les ObjectIds MongoDB.
 * Fallback : retourne l'ID brut si absent du dictionnaire.
 *
 * @param val   - Un ID (string) ou un tableau d'IDs (string[])
 * @param lookup - Dictionnaire ID → nom humain
 * @returns Tableau de noms résolus
 */
const resolveToNames = (
  val: unknown,
  lookup: Record<string, string>,
): string[] => {
  if (typeof val === "string") return [lookup[val] ?? val];
  if (Array.isArray(val)) {
    return val
      .map((id) => (typeof id === "string" ? (lookup[id] ?? id) : null))
      .filter((x): x is string => x !== null);
  }
  return [];
};

/**
 * Traduit une clé d'unité de temps anglaise en français.
 * @example translateUnit("week") → "semaine"
 * @example translateUnit("hours") → "heures"
 */
const translateUnit = (raw: string, fallback = "heures"): string =>
  TIME_UNIT_LABELS[raw.toLowerCase()] || raw || fallback;

// ── Complex renderers ───────────────────────────────────────────────────────

/**
 * Fusionne le thème principal (riKey "theme") et les thèmes secondaires
 * (riKey "secondaryThemes") en une seule ligne de Badges.
 * Le thème principal porte une étiquette "thème principal" dans le badge.
 */
const renderThemes = (v: unknown, { metadata_ri, ref }: RenderContext) => {
  const primaryNames = resolveToNames(v, ref.themes);
  const secondaryNames = resolveToNames(
    metadata_ri.secondaryThemes,
    ref.themes,
  );

  if (primaryNames.length === 0 && secondaryNames.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {primaryNames.map((name) => (
        <Badge key={name} size="sm" className="flex gap-1" variant="info">
          {name}{" "}
          <span className="bg-white text-black inline-block px-1 rounded-sm text-[10px]">
            thème principal
          </span>
        </Badge>
      ))}
      {secondaryNames.map((name) => (
        <Badge key={name} size="sm" variant="info">
          {name}
        </Badge>
      ))}
    </div>
  );
};

/**
 * Résout les IDs MongoDB de besoins en noms lisibles et les affiche en Badges.
 * Les noms proviennent du lookup `ref.needs` (fetché depuis l'API RI).
 */
const renderNeeds = (v: unknown, { ref }: RenderContext) => {
  const names = resolveToNames(v, ref.needs);
  if (names.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {names.map((name) => (
        <Badge key={name} size="sm" variant="info">
          {name}
        </Badge>
      ))}
    </div>
  );
};

/**
 * Formate le prix à partir de la structure de l'agent IA.
 *
 * Entrée : `[{ values: string[], details: string }]`
 * - values[0] = "gratuit" | "payant" | "0" | montant (ex: "50")
 * - details   = périodicité ("once", "month", "year", etc.)
 *
 * @example [{values: ["gratuit"], details: ""}]     → "Gratuit"
 * @example [{values: ["payant"], details: ""}]      → "Payant"
 * @example [{values: ["50"], details: "month"}]     → "Payant, 50€ par mois"
 */
const renderPrice = (v: unknown): string | null => {
  if (!v || !Array.isArray(v)) return typeof v === "string" ? v : null;

  const periodTranslations: Record<string, string> = {
    once: "une fois",
    eachTime: "à chaque fois",
    hour: "par heure",
    day: "par jour",
    week: "par semaine",
    month: "par mois",
    trimester: "par trimestre",
    semester: "par semestre",
    year: "par an",
  };

  return v
    .map((p: Record<string, unknown>) => {
      const rawValue = Array.isArray(p.values)
        ? p.values[0]
        : String(p.values || "");
      const details = typeof p.details === "string" ? p.details : "";

      // Gratuit
      if (
        !rawValue ||
        rawValue.toLowerCase() === "gratuit" ||
        rawValue === "0"
      ) {
        return "Gratuit";
      }

      // Payant (sans montant précis)
      const suffix = details
        ? ` ${periodTranslations[details] || details}`
        : "";
      if (rawValue.toLowerCase() === "payant") {
        return `Payant${suffix}`;
      }

      // Montant précis : "Payant, 50€ par mois"
      return `Payant, ${rawValue}€${suffix}`;
    })
    .join(" / ");
};

/**
 * Formate la fréquence de participation.
 * Accepte un objet unique ou un tableau (l'IA peut retourner les deux).
 *
 * Entrée : `{ hours: number[], frequencyUnit: string, amountDetails: string }`
 *
 * @example { hours: [12], frequencyUnit: "week", amountDetails: "exactly" }
 *          → "Exactement 12h par semaine"
 */
const renderFrequency = (v: unknown): string | null => {
  if (!v) return null;
  const items = Array.isArray(v) ? v : typeof v === "object" ? [v] : [];
  if (items.length === 0) return String(v);

  return items
    .map((f: Record<string, unknown>) => {
      const hours = Array.isArray(f.hours) ? f.hours : [];
      const rawUnit = String(f.frequencyUnit || f.timeUnit || "");
      const unit = translateUnit(rawUnit);
      const details =
        typeof f.amountDetails === "string"
          ? f.amountDetails.toLowerCase()
          : "exactly";

      if (details === "between" && hours.length >= 2) {
        return `Entre ${hours[0]} et ${hours[1]} ${unit} par ${unit}`;
      }
      if (details === "approximately" && hours.length >= 1) {
        return `Environ ${hours[0]} ${unit} par ${unit}`;
      }
      if (hours.length >= 1) {
        return `Exactement ${hours[0]}h par ${unit}`;
      }
      return "";
    })
    .filter(Boolean)
    .join(", ");
};

/**
 * Formate la durée totale d'engagement.
 *
 * Entrée : `[{ amountDetails: string, hours: number[], timeUnit: string }]`
 *
 * @example { amountDetails: "between", hours: [80, 120], timeUnit: "hours" }
 *          → "Entre 80 et 120 heures"
 * @example { amountDetails: "approximately", hours: [15], timeUnit: "days" }
 *          → "Environ 15 jours"
 */
const renderCommitment = (v: unknown): string | null => {
  if (!v || !Array.isArray(v)) return typeof v === "string" ? v : null;

  return v
    .map((c: Record<string, unknown>) => {
      const hours = Array.isArray(c.hours) ? c.hours : [];
      const unit =
        typeof c.timeUnit === "string" ? translateUnit(c.timeUnit) : "heures";
      const details =
        typeof c.amountDetails === "string"
          ? c.amountDetails.toLowerCase()
          : "exactly";

      if (details === "between" && hours.length >= 2) {
        return `Entre ${hours[0]} et ${hours[1]} ${unit}`;
      }
      if (details === "approximately" && hours.length >= 1) {
        return `Environ ${hours[0]} ${unit}`;
      }
      if (hours.length >= 1) {
        return `Exactement ${hours[0]} ${unit}`;
      }
      return "";
    })
    .filter(Boolean)
    .join(", ");
};

/**

/**
 * Formate la tranche d'âge.
 *
 * Entrée : `[{ ages: number[], type: "between" | "moreThan" | "lessThan" }]`
 *
 * @example [{ ages: [18, 65], type: "between" }]  → "De 18 à 65 ans"
 * @example [{ ages: [25], type: "moreThan" }]      → "Plus de 25 ans"
 */
const renderAge = (v: unknown): string | null => {
  if (!v || !Array.isArray(v)) return typeof v === "string" ? v : null;

  return v
    .map((entry: Record<string, unknown>) => {
      const ages = Array.isArray(entry.ages) ? entry.ages : [];
      const type =
        typeof entry.type === "string" ? entry.type.toLowerCase() : "";

      if (type === "between" && ages.length >= 2) {
        return `De ${ages[0]} à ${ages[1]} ans`;
      }
      if (type === "morethan" && ages.length >= 1) {
        return `Plus de ${ages[0]} ans`;
      }
      if (type === "lessthan" && ages.length >= 1) {
        return `Moins de ${ages[0]} ans`;
      }
      if (ages.length >= 1) {
        return `${ages[0]} ans`;
      }
      return "";
    })
    .filter(Boolean)
    .join(", ");
};
// =============================================================================
// Field definitions
// =============================================================================

const METADATA_FIELDS: MetadataFieldDef[] = [
  // ── Identité ──────────────────────────────────────────────────────────────
  { label: "Titre marque", riKey: "titreMarque" },
  { label: "Structure", riKey: "mainSponsor" },
  { label: "Logo", riKey: "logo" },
  { label: "En bref", riKey: "abstract", render: truncate(50) },

  // ── Classification ────────────────────────────────────────────────────────
  { label: "Thèmes", riKey: "theme", render: renderThemes },
  { label: "Besoins", riKey: "needs", render: renderNeeds },

  // ── Public ────────────────────────────────────────────────────────────────
  {
    label: "Public visé",
    riKey: "publicStatus",
  },
  {
    label: "Public",
    riKey: "public",
  },
  { label: "Fréquence", riKey: "frequency", render: renderFrequency },
  {
    label: "Niveau de français",
    riKey: "frenchLevel",
  },
  { label: "Âge", riKey: "age", render: renderAge },

  // ── Modalités ─────────────────────────────────────────────────────────────
  { label: "Prix", riKey: "price", render: renderPrice },
  { label: "Durée totale", riKey: "commitment", render: renderCommitment },
  { label: "Session", riKey: "periode" },
  {
    label: "Jours de présence",
    riKey: "timeSlots",
  },

  // ── Géographie ────────────────────────────────────────────────────────────
  { label: "Départements", riKey: "location" },
  {
    label: "Conditions",
    riKey: "conditions",
  },
  { label: "Zone d'actions", riKey: "map" },
];

// =============================================================================
// Source column helpers
// =============================================================================

/**
 * Résout un chemin en dot-notation dans un objet imbriqué.
 * Utilisé pour extraire les valeurs source depuis les métadonnées DI.
 *
 * @param obj  - L'objet racine (métadonnées DI)
 * @param path - Chemin d'accès (ex: "structure.nom", "extra.frais-restants")
 * @returns La valeur trouvée, ou undefined si le chemin est invalide
 */
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

/**
 * Formate une valeur source pour l'affichage dans la colonne "Source RCO".
 * Tronque les valeurs longues à 60 caractères et sérialise les objets/tableaux.
 */
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

// =============================================================================
// Component
// =============================================================================

/**
 * Composant principal : affiche le rapport de métadonnées IA dans un tableau à 3 colonnes.
 *
 * - Colonne 1 : Label du champ + badge de statut (pré-rempli / introuvable)
 * - Colonne 2 : Valeur formatée par le renderer du champ
 * - Colonne 3 : Source RCO (clé d'origine dans les métadonnées DI + valeur résolue)
 */
export function MetadataView() {
  const { document } = useDocument();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!document) return null;

  const report = document.metadataReport;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await triggerForceArbitration(document.id);
      if (!result.success) {
        setError(result.error ?? "Erreur lors du démarrage de la génération");
      }
    } catch {
      setError("Erreur inattendue");
    } finally {
      setIsGenerating(false);
    }
  };

  // No metadata report → show re-generate prompt
  if (!report) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun rapport de métadonnées
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Le rapport de métadonnées IA n&apos;a pas encore été généré ou a
            rencontré une erreur. Relancez la génération pour pré-remplir les
            métadonnées.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              "Générer les métadonnées"
            )}
          </Button>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  // Wrap in MetadataProvider for editing functionality
  return (
    <MetadataProvider>
      <MetadataTable
        report={report}
        diMetadata={(document.metadata ?? {}) as Record<string, unknown>}
        ref={document.referenceData ?? { themes: {}, needs: {} }}
      />
    </MetadataProvider>
  );
}

/**
 * Internal table component that uses MetadataContext.
 */
function MetadataTable({
  report,
  diMetadata,
  ref,
}: {
  report: NonNullable<
    ReturnType<typeof useDocument>["document"]
  >["metadataReport"];
  diMetadata: Record<string, unknown>;
  ref: RiReferenceData;
}) {
  const { getFieldStatus } = useMetadata();

  if (!report) return null;

  const { metadata_ri, provenance } = report;

  // Render context shared by all field renderers
  const ctx: RenderContext = { metadata_ri, ref };

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
            const fieldStatus = getFieldStatus(field.riKey);

            // Determine if this is an editable text field
            const isTextField =
              field.riKey === "titreMarque" ||
              field.riKey === "mainSponsor" ||
              field.riKey === "logo";
            const isTextareaField = field.riKey === "abstract";

            // Multi-enum fields with their options
            const multiEnumConfigs: Record<
              string,
              readonly { value: string; label: string }[]
            > = {
              publicStatus: PUBLIC_STATUS_OPTIONS,
              public: PUBLIC_TYPE_OPTIONS,
              frenchLevel: FRENCH_LEVEL_OPTIONS,
              timeSlots: TIME_SLOT_OPTIONS,
              conditions: CONDITION_OPTIONS,
            };
            const isMultiEnumField = field.riKey in multiEnumConfigs;

            // Complex fields
            const isPriceField = field.riKey === "price";
            const isAgeField = field.riKey === "age";
            const isCommitmentField = field.riKey === "commitment";
            const isFrequencyField = field.riKey === "frequency";
            const isSessionField = field.riKey === "periode";
            const isPoiField = field.riKey === "map";
            const isDepartmentField = field.riKey === "location";

            // Compute display value: editable field > custom render > default
            let displayValue: React.ReactNode = null;

            if (isTextField) {
              displayValue = (
                <TextField
                  fieldKey={field.riKey}
                  label={field.label}
                  placeholder="Cliquer pour modifier"
                />
              );
            } else if (isTextareaField) {
              displayValue = (
                <TextareaField
                  fieldKey={field.riKey}
                  label={field.label}
                  placeholder="Cliquer pour modifier"
                  rows={2}
                />
              );
            } else if (isMultiEnumField) {
              const options = multiEnumConfigs[field.riKey];
              if (options) {
                displayValue = (
                  <MultiEnumField
                    fieldKey={field.riKey}
                    label={field.label}
                    options={options}
                    placeholder=""
                  />
                );
              }
            } else if (isPriceField) {
              displayValue = (
                <PriceField fieldKey={field.riKey} label={field.label} />
              );
            } else if (isAgeField) {
              displayValue = (
                <AgeField fieldKey={field.riKey} label={field.label} />
              );
            } else if (isCommitmentField) {
              displayValue = (
                <CommitmentField fieldKey={field.riKey} label={field.label} />
              );
            } else if (isFrequencyField) {
              displayValue = (
                <FrequencyField fieldKey={field.riKey} label={field.label} />
              );
            } else if (isSessionField) {
              displayValue = (
                <SessionField fieldKey={field.riKey} label={field.label} />
              );
            } else if (isPoiField) {
              displayValue = (
                <PoiField fieldKey={field.riKey} label={field.label} />
              );
            } else if (isDepartmentField) {
              displayValue = (
                <DepartmentField fieldKey={field.riKey} label={field.label} />
              );
            } else if (field.render) {
              displayValue = field.render(rawValue, ctx);
            } else if (Array.isArray(rawValue)) {
              displayValue = rawValue.join(", ");
            } else if (rawValue !== undefined && rawValue !== null) {
              displayValue = String(rawValue);
            }

            if (!displayValue) {
              displayValue = <span className="text-gray-400">—</span>;
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
                          <span>{formattedValue}</span>
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-gray-400">—</span>
            );

            // Badge based on field status
            const badge =
              rawValue === undefined || rawValue === null ? (
                <Badge size="sm" variant="danger">
                  <Zap className="h-3 w-3 mr-1" /> Donnée introuvable
                </Badge>
              ) : fieldStatus === "modified" ? (
                <Badge size="sm" variant="info">
                  <Zap className="h-3 w-3 mr-1" /> Modifié
                </Badge>
              ) : (
                <Badge size="sm" variant="warning">
                  <Zap className="h-3 w-3 mr-1" /> Pré-rempli par l&apos;IA
                </Badge>
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
                  {badge}
                </td>
                <td className="px-6 py-4">{displayValue}</td>
                <td className="px-6 py-4">{sourceDisplay}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

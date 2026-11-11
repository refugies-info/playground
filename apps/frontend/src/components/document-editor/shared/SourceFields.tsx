import { describeFieldCodes } from "@playground/shared-types";
import { cn } from "@playground/ui";

const SOURCE_FIELD_LABELS: Record<string, string> = {
  nom: "Intitulé de la formation",
  organisme: "Organisme responsable",
  objectif_formation: "Objectif",
  contenu_formation: "Contenu",
  resultat_attendus: "Résultats attendus",
  conditions_specifiques: "Conditions spécifiques",
  info_public_vise: "Public visé",
  code_public_vise: "Codes public visé",
  duree_indicative: "Durée indicative",
  villes: "Villes",
  modalites_enseignement: "Modalité",
  modalites_entrees_sorties: "Entrées/sorties permanentes",
  nombre_heures_total: "Nombre d'heures total",
  rythme_formation: "Rythme",
  frais_restants: "Frais restants",
  detail_conditions_prise_en_charge: "Prise en charge",
  sessions: "Sessions",
  date_debut: "Début",
  date_fin: "Fin",
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

// RCO texts are HTML from a third party: shown as plain text, never injected.
const toReadableText = (value: unknown, key: string): string => {
  if (isEmpty(value)) return "—";
  if (Array.isArray(value))
    return [...new Set(value.map((item) => toReadableText(item, key)))].join(
      ", ",
    );
  return describeFieldCodes(
    key,
    String(value)
      .replace(/<\/(p|li|div)>|<br\s*\/?>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\n{2,}/g, "\n")
      .trim(),
  );
};

function SourceValue({
  value,
  field,
  labelOf,
}: {
  value: unknown;
  field: string;
  labelOf: (key: string) => string;
}) {
  if (isObject(value))
    return (
      <dl className="mt-1 space-y-1 border-l-2 border-amber-100 pl-3">
        {Object.entries(value)
          .filter(([, item]) => !isEmpty(item))
          .map(([nestedKey, item]) => (
            <div key={nestedKey}>
              <dt className="inline text-gray-500">{labelOf(nestedKey)} : </dt>
              <dd
                className={
                  isObject(item) || Array.isArray(item) ? "" : "inline"
                }
              >
                <SourceValue value={item} field={nestedKey} labelOf={labelOf} />
              </dd>
            </div>
          ))}
      </dl>
    );
  if (Array.isArray(value) && value.some(isObject))
    return (
      <ol className="space-y-2">
        {value.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static read-only list
          <li key={index}>
            <SourceValue value={item} field={field} labelOf={labelOf} />
          </li>
        ))}
      </ol>
    );
  return <>{toReadableText(value, field)}</>;
}

const frenchLabel = (key: string) => SOURCE_FIELD_LABELS[key] ?? key;
const propertyName = (key: string) => key;

/** `showPropertyNames`: API property names (etat_recrutement) instead of French labels. */
export function SourceFields({
  source,
  className,
  showPropertyNames = false,
}: {
  source: Record<string, unknown>;
  className?: string;
  showPropertyNames?: boolean;
}) {
  const labelOf = showPropertyNames ? propertyName : frenchLabel;
  return (
    <dl className={cn("font-sans space-y-4", className)}>
      {Object.entries(source).map(([field, value]) => (
        <div key={field}>
          <dt className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            {labelOf(field)}
          </dt>
          <dd className="whitespace-pre-line text-gray-900">
            <SourceValue value={value} field={field} labelOf={labelOf} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

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

// RCO texts are HTML from a third party: shown as plain text, never injected.
const toReadableText = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) {
    const items = [...new Set(value.map(toReadableText))];
    return items.join(value.some(isObject) ? "\n" : ", ");
  }
  if (isObject(value))
    return Object.entries(value)
      .map(
        ([key, item]) =>
          `${SOURCE_FIELD_LABELS[key] ?? key} : ${toReadableText(item)}`,
      )
      .join(" · ");
  return String(value)
    .replace(/<\/(p|li|div)>|<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
};

export function SourceFields({
  source,
  className,
}: {
  source: Record<string, unknown>;
  className?: string;
}) {
  return (
    <dl className={cn("font-sans space-y-4", className)}>
      {Object.entries(source).map(([field, value]) => (
        <div key={field}>
          <dt className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            {SOURCE_FIELD_LABELS[field] ?? field}
          </dt>
          <dd className="whitespace-pre-line text-gray-900">
            {toReadableText(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

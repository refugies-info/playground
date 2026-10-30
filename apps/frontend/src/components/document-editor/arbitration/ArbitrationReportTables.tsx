import {
  type ArbitrationReport,
  COMPARED_ELEMENT_LABELS,
  COMPARED_ELEMENTS,
  type CriterionVerdict,
  comparedValueHeader,
  DUPLICATE_SOURCE_LABELS,
  DUPLICATE_VERDICT_LABELS,
  type DuplicateMatch,
  SIMILARITY_LABELS,
  type Similarity,
} from "@playground/shared-types";
import { Badge } from "@playground/ui/primitives";
import { CircleCheck, CircleHelp, CircleX } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Compliance and duplicate tables of an RCO arbitration report.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=2631-15905
 */

const HEADER_CELL = "px-4 py-3 text-left text-sm font-medium text-[#000091]";
const BODY_CELL = "px-4 py-3 align-top text-sm";

const DECISION_ICONS: Record<CriterionVerdict, ReactNode> = {
  accepted: (
    <CircleCheck className="size-5 text-[#18753c]" aria-label="Validé" />
  ),
  refused: <CircleX className="size-5 text-[#ce0500]" aria-label="Refusé" />,
  ai: <CircleHelp className="size-5 text-[#b34000]" aria-label="À arbitrer" />,
};

const SIMILARITY_COLORS: Record<Similarity, string> = {
  identical: "text-[#ce0500]",
  close: "text-[#b34000]",
  different: "text-[#18753c]",
};

function ReportTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="border border-[var(--border-default-grey)] bg-white overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[var(--background-action-low-blue-france)]">
            {headers.map((header) => (
              <th key={header} className={HEADER_CELL}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-default-grey)]">
          {children}
        </tbody>
      </table>
    </div>
  );
}

function SectionTitle({ title, badge }: { title: string; badge: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      {badge}
    </div>
  );
}

function ComplianceSection({ report }: { report: ArbitrationReport }) {
  return (
    <section className="space-y-6">
      <SectionTitle
        title="Analyse de conformité éditoriale"
        badge={
          <Badge variant={report.compliant ? "success" : "danger"}>
            {report.compliant ? "Fiche acceptée" : "Fiche refusée"}
          </Badge>
        }
      />
      <ReportTable headers={["Étape", "Donnée trouvée & analysée", "Décision"]}>
        {report.criteria.map(({ criterion, label, reason, verdict }) => (
          <tr key={criterion}>
            <td className={`${BODY_CELL} font-medium`}>{label}</td>
            <td className={BODY_CELL}>{reason}</td>
            <td className={`${BODY_CELL} w-24`}>
              <span className="flex justify-center">
                {DECISION_ICONS[verdict]}
              </span>
            </td>
          </tr>
        ))}
      </ReportTable>
      <p className="text-sm">
        {report.compliant
          ? "La fiche correspond à tous les critères de conformité éditoriale."
          : "La fiche ne correspond pas à tous les critères de conformité éditoriale."}
      </p>
    </section>
  );
}

function DuplicateLink({ match }: { match: DuplicateMatch }) {
  const className = "text-[#000091] underline underline-offset-2";
  return match.source === "playground" ? (
    <Link href={match.url} className={className}>
      {match.title}
    </Link>
  ) : (
    <a href={match.url} target="_blank" rel="noreferrer" className={className}>
      {match.title}
    </a>
  );
}

function DuplicateSection({ report }: { report: ArbitrationReport }) {
  const badge = !report.duplicatesChecked ? (
    <Badge variant="neutral">Non analysé</Badge>
  ) : report.duplicate ? (
    <Badge variant="danger">Doublon</Badge>
  ) : report.duplicates.length > 0 ? (
    <Badge variant="warning">À vérifier</Badge>
  ) : (
    <Badge variant="success">Nouveau</Badge>
  );

  return (
    <section className="space-y-6">
      <SectionTitle title="Analyse de doublons" badge={badge} />
      {report.duplicates.map((match) => (
        <div key={`${match.source}-${match.id}`} className="space-y-3">
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <DuplicateLink match={match} />
            <span className="text-[var(--text-mention-grey)]">
              {/* Reports stored before the status was added have none. */}
              {[DUPLICATE_SOURCE_LABELS[match.source], match.status]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <Badge
              variant={match.verdict === "duplicate" ? "danger" : "warning"}
            >
              {DUPLICATE_VERDICT_LABELS[match.verdict]}
            </Badge>
          </p>
          <ReportTable
            headers={[
              "Élément comparé",
              comparedValueHeader(match.source),
              "Valeur RCO",
              "Similarité",
            ]}
          >
            {COMPARED_ELEMENTS.map((element) => (
              <tr key={element}>
                <td className={`${BODY_CELL} font-medium`}>
                  {COMPARED_ELEMENT_LABELS[element]}
                </td>
                <td className={BODY_CELL}>{match[element]}</td>
                <td className={BODY_CELL}>{report.rcoValues[element]}</td>
                <td
                  className={`${BODY_CELL} ${SIMILARITY_COLORS[match.similarity[element]]}`}
                >
                  {SIMILARITY_LABELS[match.similarity[element]]}
                </td>
              </tr>
            ))}
          </ReportTable>
          <p className="text-sm">{match.reason}</p>
        </div>
      ))}
      <p className="text-sm">
        {!report.duplicatesChecked
          ? "Recherche non effectuée : la fiche est refusée par les règles de conformité."
          : report.duplicates.length > 0
            ? report.duplicateSummary
            : "Aucun doublon détecté. La fiche peut être publiée comme nouveau dispositif."}
      </p>
    </section>
  );
}

export function ArbitrationReportTables({
  report,
}: {
  report: ArbitrationReport;
}) {
  return (
    <div className="space-y-12">
      <ComplianceSection report={report} />
      <DuplicateSection report={report} />
    </div>
  );
}

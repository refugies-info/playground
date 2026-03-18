/**
 * MetadataTable Component
 * Generic table for displaying metadata fields
 */

import type { RiReferenceData } from "@/services/ri-reference-data";
import { MetadataRow } from "./MetadataRow";
import type { MetadataFieldDef } from "./types";

// =============================================================================
// Types
// =============================================================================

interface MetadataTableProps {
  /** Metadata report from letta_reports */
  report:
    | {
        metadata_ri: Record<string, unknown>;
        provenance?: Array<{
          key: string;
          label: string;
          value: string;
          status: string;
          source: string[];
        }>;
      }
    | null
    | undefined;
  /** Original DI metadata for source column */
  diMetadata: Record<string, unknown>;
  /** Reference data (themes, needs lookups) */
  ref: RiReferenceData;
  /** Field configuration for this publication target */
  fields: MetadataFieldDef[];
}

// =============================================================================
// Component
// =============================================================================

export function MetadataTable({
  report,
  diMetadata,
  fields,
}: MetadataTableProps) {
  if (!report) return null;

  const { metadata_ri, provenance } = report;
  const provenanceByKey = new Map(provenance?.map((p) => [p.key, p]) ?? []);

  return (
    <div className="bg-white">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
              Métadonnée
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[40%]">
              Valeur(s) renseignée(s)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[35%]">
              Source RCO
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {fields.map((field) => (
            <MetadataRow
              key={field.riKey}
              field={field}
              metadata_ri={metadata_ri}
              provenanceByKey={provenanceByKey}
              diMetadata={diMetadata}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
          source?: unknown;
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
    <div className="border border-[#ddd] bg-white">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-[#e3e3fd]">
            <th className="w-[180px] px-4 py-3 text-left text-xs font-bold text-[#000091]">
              Métadonnée
            </th>
            <th className="w-[412px] px-4 py-3 text-left text-xs font-bold text-[#000091]">
              Valeur
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-[#000091]">
              Source
            </th>
            <th
              className="w-[80px] px-4 py-3"
              aria-label="Source du remplissage"
            />
          </tr>
        </thead>
        <tbody className="bg-white">
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

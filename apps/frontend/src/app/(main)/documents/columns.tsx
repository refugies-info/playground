"use client";

import type { Document } from "@playground/shared-types";
import {
  Avatar,
  Badge,
  DataTableColumnHeader,
} from "@playground/ui/primitives";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import {
  getComplianceStatusLabel,
  getComplianceStatusVariant,
  getOnlineStatusLabel,
  getOnlineStatusVariant,
  getQualityScoreVariant,
  getWorkStatusLabel,
  getWorkStatusVariant,
} from "@/lib/document-labels";

const QualityScoreCell = ({ score }: { score: number | undefined | null }) => {
  if (score === undefined || score === null) {
    return <div className="text-gray-400">—</div>;
  }
  const percentage = Math.round(score * 100);

  return <Badge variant={getQualityScoreVariant(score)}>{percentage}%</Badge>;
};

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: "compliance_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Conformité" />
    ),
    cell: ({ row }) => {
      const status = row.original.complianceStatus;
      return (
        <Badge variant={getComplianceStatusVariant(status)}>
          {getComplianceStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "structureName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Structure" />
    ),
    cell: ({ row }) => {
      const value = row.original.structureName;
      return <div className="text-sm text-gray-700">{value || "—"}</div>;
    },
  },
  {
    accessorKey: "sessionStartDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de début" />
    ),
    cell: ({ row }) => {
      const dateStr = row.original.sessionStartDate;
      if (!dateStr) return <div className="text-gray-400">—</div>;
      const date = new Date(dateStr);
      return <div>{date.toLocaleDateString("fr-FR")}</div>;
    },
  },
  {
    accessorKey: "online_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visibilité" />
    ),
    cell: ({ row }) => {
      const status = row.original.onlineStatus;
      if (!status) return <div className="text-gray-400">—</div>;
      // Also show link if published
      if (status === "published" && row.original.publishedUrl) {
        return (
          <div className="flex items-center gap-2">
            <Badge variant={getOnlineStatusVariant(status)}>
              {getOnlineStatusLabel(status)}
            </Badge>
            <a
              href={row.original.publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors"
              title="Voir la fiche publiée"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        );
      }
      return (
        <Badge variant={getOnlineStatusVariant(status)}>
          {getOnlineStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "work_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Traitement" />
    ),
    cell: ({ row }) => {
      const status = row.original.workStatus;
      if (!status) return <div className="text-gray-400">—</div>;
      return (
        <Badge variant={getWorkStatusVariant(status)}>
          {getWorkStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "date_added",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date d'import" />
    ),
    cell: ({ row }) => {
      const raw = row.getValue("date_added") as string | null | undefined;
      if (!raw) return <div className="text-gray-400">—</div>;
      const date = new Date(raw);
      if (Number.isNaN(date.getTime()))
        return <div className="text-gray-400">—</div>;
      return (
        <div>
          <div>{date.toLocaleDateString("fr-FR")}</div>
          <div className="text-xs text-gray-400">
            {date.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "author",
    enableSorting: false, // Author is a complex object (email + role), cannot be sorted directly
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Auteur" />
    ),
    cell: ({ row }) => {
      const email = row.original.authorEmail;
      const role = row.original.authorRole;
      return <Avatar email={email} userRole={role} size="sm" />;
    },
  },
];

export const inProgressColumns: ColumnDef<Document>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID Workflow" />
    ),
    cell: ({ row }) => (
      <div
        className="text-xs font-mono text-gray-500 truncate w-16"
        title={row.original.id}
      >
        {row.original.id.split("-")[0]}...
      </div>
    ),
  },
  {
    id: "externalId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID Carif-Oref" />
    ),
    cell: ({ row }) => {
      const externalId = row.original.metadata?.id as string | undefined;
      return (
        <div className="text-xs font-mono text-gray-500">
          {externalId || "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "compliance_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Conformité" />
    ),
    cell: ({ row }) => {
      const status = row.original.complianceStatus;
      return (
        <Badge variant={getComplianceStatusVariant(status)}>
          {getComplianceStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "qualityScore",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Score de qualité" />
    ),
    cell: ({ row }) => <QualityScoreCell score={row.original.qualityScore} />,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "structureName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Structure" />
    ),
    cell: ({ row }) => {
      const value = row.original.structureName;
      return <div className="text-sm text-gray-700">{value || "—"}</div>;
    },
  },

  {
    accessorKey: "date_added",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date d'import" />
    ),
    cell: ({ row }) => {
      const raw = row.original.date_added;
      if (!raw) return <div className="text-gray-400">—</div>;
      const date = new Date(raw);
      if (Number.isNaN(date.getTime()))
        return <div className="text-gray-400">—</div>;
      return (
        <div>
          <div>{date.toLocaleDateString("fr-FR")}</div>
          <div className="text-xs text-gray-400">
            {date.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      );
    },
  },
];

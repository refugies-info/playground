"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useDocument } from "../DocumentContext";
import { DocumentStatus } from "./DocumentStatus";
import { useDocumentStatusRealtime } from "./hooks/useDocumentStatusRealtime";

export function TopBar() {
  const { document } = useDocument();

  // Keep status badges in sync via Supabase Realtime
  useDocumentStatusRealtime();

  return (
    <div className="relative flex items-center justify-between px-4 py-2 border-b bg-white">
      <Link
        href="/documents"
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-semibold text-xs">
          retour à la liste des documents
        </span>
      </Link>

      {/* Document title */}
      {document && (
        <span className="absolute left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700 truncate max-w-md">
          {document.title}
        </span>
      )}

      <DocumentStatus />
    </div>
  );
}

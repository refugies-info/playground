"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TranslationStatus } from "./TranslationStatus";

export function TranslationTopBar() {
  return (
    <div className="h-14 border-b bg-white flex items-center justify-between px-4 shrink-0 z-30 relative">
      <div className="flex items-center gap-4">
        <Link
          href="/translations"
          className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
          title="Retour aux traductions"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-semibold text-gray-900">Traduction</h1>
      </div>

      <TranslationStatus />
    </div>
  );
}

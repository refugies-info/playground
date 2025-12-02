"use client";

import React from "react";
import { Button } from "@refugies/ui/primitives";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function EditorToolbar() {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
      <Link
        href="/documents"
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-semibold text-xs">
          retour à la liste des documents
        </span>
      </Link>
      <Button variant="primary" size="sm" className="gap-2">
        <Save className="w-4 h-4" />
        Enregistrer
      </Button>
    </div>
  );
}

"use client";

import { Button } from "@playground/ui/primitives";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDocument } from "./DocumentContext";

export function TopBar() {
  const { saveDocument, isSaving } = useDocument();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    const result = await saveDocument();

    if (result.success) {
      setSaveSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(result.error || "Failed to save");
    }
  };

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

      <div className="flex items-center gap-2">
        {/* Save status messages */}
        {saveSuccess && (
          <span className="text-sm text-green-600">Enregistré avec succès</span>
        )}
        {saveError && <span className="text-sm text-red-600">{saveError}</span>}

        {/* Save Button */}
        <Button
          variant="primary"
          size="sm"
          className="gap-2"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}

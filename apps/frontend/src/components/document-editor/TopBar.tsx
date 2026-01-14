"use client";

import { Button } from "@playground/ui/primitives";
import { ArrowLeft, Eye, Save, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDocument } from "./DocumentContext";

export function TopBar() {
  const {
    document,
    saveDocument,
    isSaving,
    previewDocument,
    publishDocument,
    isPublishing,
  } = useDocument();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

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

  const handlePreview = () => {
    previewDocument();
  };

  const handlePublish = async () => {
    setPublishError(null);
    setPublishSuccess(false);

    const result = await publishDocument();

    if (result.success) {
      setPublishSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setPublishSuccess(false), 3000);
    } else {
      setPublishError(result.error || "Échec de la publication");
    }
  };

  const isCompliant = document?.status === "compliant";

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
        {/* Status messages */}
        {saveSuccess && (
          <span className="text-sm text-green-600">Enregistré avec succès</span>
        )}
        {saveError && <span className="text-sm text-red-600">{saveError}</span>}
        {publishSuccess && (
          <span className="text-sm text-green-600">Publié avec succès</span>
        )}
        {publishError && (
          <span className="text-sm text-red-600">{publishError}</span>
        )}

        {/* Preview Button */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handlePreview}
        >
          <Eye className="w-4 h-4" />
          Prévisualiser
        </Button>

        {/* Save Button - only enabled for compliant documents */}
        <Button
          variant="primary"
          size="sm"
          className="gap-2"
          onClick={handleSave}
          disabled={isSaving || !isCompliant}
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>

        {/* Publish Button - only enabled for compliant documents */}
        <Button
          variant="primary"
          size="sm"
          className="gap-2"
          onClick={handlePublish}
          disabled={isPublishing || !isCompliant}
        >
          <Send className="w-4 h-4" />
          {isPublishing ? "Publication..." : "Publier"}
        </Button>
      </div>
    </div>
  );
}

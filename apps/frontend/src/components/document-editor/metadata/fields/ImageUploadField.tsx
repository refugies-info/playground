"use client";

import { ImageUpload } from "@playground/ui";
import { useCallback } from "react";
import { uploadMetadataLogo } from "@/app/actions/logos";
import { useDocument } from "../../DocumentContext";
import { useMetadata } from "../MetadataContext";

/**
 * ImageUploadField — Métadonnée image téléversée plutôt que saisie (RI-1395).
 *
 * Le champ envoie le fichier sur Cloudinary puis enregistre l'URL renvoyée par
 * le chemin habituel (`updateField`) : la valeur stockée reste une URL, comme
 * quand elle était tapée à la main, et hérite donc de la validation Zod, du
 * marquage « modifié » et du bouton vider de la ligne.
 */
export function ImageUploadField({
  fieldKey,
  label,
  disabled = false,
}: {
  fieldKey: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const { document } = useDocument();
  const { getFieldValue, updateField } = useMetadata();

  const value = getFieldValue(fieldKey);
  const url = typeof value === "string" && value ? value : null;

  const handleUpload = useCallback(
    async (file: File) => {
      if (!document?.id) {
        throw new Error("Document introuvable");
      }
      const formData = new FormData();
      formData.set("file", file);
      const { secureUrl } = await uploadMetadataLogo(document.id, formData);
      await updateField(fieldKey, secureUrl);
      return secureUrl;
    },
    [document?.id, fieldKey, updateField],
  );

  return (
    <ImageUpload
      value={url}
      onUpload={handleUpload}
      shape="rect"
      label={label}
      disabled={disabled}
    />
  );
}

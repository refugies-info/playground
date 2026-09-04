"use client";

import { ImageUpload } from "@playground/ui";
import { useCallback } from "react";
import { uploadMetadataLogo } from "@/app/actions/logos";
import { useDocument } from "../../DocumentContext";
import { useMetadata } from "../MetadataContext";

/**
 * ImageUploadField — Métadonnée image téléversée plutôt que saisie (RI-1395).
 *
 * Branche {@link ImageUpload} sur MetadataContext : le fichier part sur
 * Cloudinary, puis seule l'URL renvoyée est enregistrée via `updateField`. La
 * valeur stockée reste une URL comme quand elle était tapée à la main, et hérite
 * donc de la validation Zod et du marquage « modifié ».
 *
 * Les trois états visuels appartiennent au primitive — c'est le même dépôt
 * d'image partout dans l'app.
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
  const { getFieldValue, updateField, clearField } = useMetadata();

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

  // `clearField` écrit un null explicite, comme le bouton « vider » de la ligne :
  // la métadonnée compte alors comme renseignée-vide, pas comme non traitée.
  const handleDelete = useCallback(
    () => clearField(fieldKey),
    [clearField, fieldKey],
  );

  return (
    <ImageUpload
      value={url}
      onUpload={handleUpload}
      onDelete={handleDelete}
      shape="rect"
      label={label}
      disabled={disabled}
    />
  );
}

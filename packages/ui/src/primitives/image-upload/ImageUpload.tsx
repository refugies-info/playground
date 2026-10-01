"use client";

import { useEffect, useRef, useState } from "react";
import { RiDeleteBin2Line, RiDownloadLine, RiLoader2Line } from "../../icons";
import { cn } from "../../utils/cn";

/**
 * ImageUpload — Zone de dépôt d'une image (logo, photo de profil…).
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=2081-11894
 *
 * Trois états :
 *   - vide            → fond bleu pâle, icône de téléversement (clic = choisir)
 *   - image déposée   → fond blanc, image affichée
 *   - image survolée  → fond gris + corbeille rouge si `onDelete` est fourni
 *                       (clic = supprimer), sinon icône de téléversement
 *                       (clic = remplacer)
 */

export interface ImageUploadProps {
  /** Current stored image URL (shown when no local preview). */
  value?: string | null;
  /** Uploads the picked file and resolves with the stored URL. */
  onUpload: (file: File) => Promise<string>;
  /**
   * Retire l'image. Fourni → le survol propose la suppression, conformément à la
   * maquette. Absent → le survol propose le remplacement, car sans moyen de
   * supprimer il ne resterait plus aucune action sur une image déjà déposée.
   */
  onDelete?: () => void | Promise<void>;
  shape?: "circle" | "rect";
  /** Accepted mime types. */
  accept?: string[];
  maxSizeMb?: number;
  disabled?: boolean;
  label?: string;
  /** Surcharge les dimensions du cadre. */
  className?: string;
}

const DEFAULT_ACCEPT = ["image/jpeg", "image/png", "image/webp"];

/** Cadre commun aux trois états — bordure et rayon de la maquette. */
const TILE_CLASS =
  "flex items-center justify-center overflow-hidden rounded-[4px] border border-(--border-default-grey) p-1";

export function ImageUpload({
  value,
  onUpload,
  onDelete,
  shape = "circle",
  accept = DEFAULT_ACCEPT,
  maxSizeMb = 5,
  disabled = false,
  label = "Photo de profil",
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Follow external changes to `value` — the image can be replaced or removed
  // by something other than this widget (a "clear" button next to it). Skipped
  // while uploading so the local preview isn't dropped mid-flight.
  useEffect(() => {
    if (!isUploading) setPreview(value ?? null);
  }, [value, isUploading]);

  const pick = () => {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;

    if (!accept.includes(file.type)) {
      setError("Format non supporté (JPEG, PNG, WebP).");
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Image trop lourde (${maxSizeMb} Mo maximum).`);
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setIsUploading(true);
    try {
      const url = await onUpload(file);
      setPreview(url);
    } catch (_e) {
      setError("Échec du téléversement. Réessayez.");
      setPreview(value ?? null);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localUrl);
    }
  };

  const handleDelete = async () => {
    if (disabled || isUploading || !onDelete) return;
    setError(null);
    await onDelete();
  };

  // `twMerge` fait gagner la dernière classe en conflit : `rounded-full` écrase
  // le `rounded-[4px]` du cadre sans avoir besoin d'un modificateur important.
  // Le rectangle occupe toute la largeur disponible — la maquette est cadrée à
  // 189px, mais la tuile doit remplir sa case (cellule de tableau, colonne…).
  const shapeClass =
    shape === "circle" ? "size-20 rounded-full" : "h-[86px] w-full";
  const tile = cn(TILE_CLASS, shapeClass, className);

  return (
    <div className="flex flex-col items-center gap-1">
      {isUploading ? (
        <div className={cn(tile, "bg-(--background-alt-blue-france)")}>
          <RiLoader2Line
            size={16}
            aria-hidden
            className="animate-spin text-(--text-title-blue-france)"
          />
          <span className="sr-only">Téléversement en cours</span>
        </div>
      ) : preview ? (
        <div className={cn("group relative", tile, "bg-white")}>
          <img
            src={preview}
            alt={label}
            className={cn(
              "max-h-full max-w-full",
              // A circle frames a photo, so filling it is right; a rectangle
              // holds things like logos, which must stay whole and undistorted.
              shape === "circle" ? "size-full object-cover" : "object-contain",
            )}
          />
          {!disabled && (
            // Révélé aussi au focus clavier, sans quoi l'action serait
            // inatteignable sans souris.
            <button
              type="button"
              onClick={onDelete ? handleDelete : pick}
              title={onDelete ? `Supprimer ${label}` : `Remplacer ${label}`}
              className={cn(
                "absolute inset-0 flex cursor-pointer items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none",
                onDelete
                  ? "bg-(--background-alt-grey)"
                  : "bg-(--background-alt-blue-france)",
                shape === "circle" && "rounded-full",
              )}
            >
              {onDelete ? (
                <RiDeleteBin2Line
                  size={16}
                  aria-hidden
                  className="text-(--text-default-error)"
                />
              ) : (
                <RiDownloadLine
                  size={16}
                  aria-hidden
                  className="text-(--text-title-blue-france)"
                />
              )}
              <span className="sr-only">
                {onDelete ? `Supprimer ${label}` : `Remplacer ${label}`}
              </span>
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={disabled}
          title={label}
          className={cn(
            tile,
            "cursor-pointer bg-(--background-alt-blue-france) transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          <RiDownloadLine
            size={16}
            aria-hidden
            className="text-(--text-title-blue-france)"
          />
          <span className="sr-only">{label}</span>
        </button>
      )}
      <input
        ref={inputRef}
        aria-hidden="true"
        tabIndex={-1}
        type="file"
        accept={accept.join(",")}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      {error && (
        <p className="text-center text-xs text-(--text-default-error)">
          {error}
        </p>
      )}
    </div>
  );
}

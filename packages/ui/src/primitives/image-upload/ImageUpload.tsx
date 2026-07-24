"use client";

import { Camera, Loader2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import { cn } from "../../utils/cn";

export interface ImageUploadProps {
  /** Current stored image URL (shown when no local preview). */
  value?: string | null;
  /** Uploads the picked file and resolves with the stored URL. */
  onUpload: (file: File) => Promise<string>;
  shape?: "circle" | "rect";
  /** Accepted mime types. */
  accept?: string[];
  maxSizeMb?: number;
  disabled?: boolean;
  label?: string;
}

const DEFAULT_ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export function ImageUpload({
  value,
  onUpload,
  shape = "circle",
  accept = DEFAULT_ACCEPT,
  maxSizeMb = 5,
  disabled = false,
  label = "Photo de profil",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={pick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          "group relative flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-blue-400 disabled:cursor-not-allowed disabled:opacity-60",
          shape === "circle"
            ? "w-20 h-20 rounded-full"
            : "w-full h-32 rounded-lg",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <Camera size={20} className="text-gray-400" />
        )}
        {!disabled && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
            {isUploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Camera size={18} />
            )}
          </span>
        )}
        {isUploading && !preview && (
          <Loader2 size={18} className="animate-spin text-gray-400" />
        )}
      </button>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept.join(",")}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
    </div>
  );
}

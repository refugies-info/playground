import {
  type UploadedImage,
  type UploadImageOptions,
  uploadImage,
} from "./client";

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageValidationError";
  }
}

/** Mime types accepted by default — the formats the upload widget offers. */
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Default size ceiling, mirrored by the client-side widget. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export interface UploadImageFileOptions extends UploadImageOptions {
  /** Overrides {@link ACCEPTED_IMAGE_TYPES}. */
  acceptedTypes?: string[];
  /** Overrides {@link MAX_IMAGE_BYTES}. */
  maxBytes?: number;
}

/**
 * Validates a browser-picked image then uploads it.
 *
 * Point d'entrée commun des uploads d'images : chaque appelant n'a plus qu'à
 * choisir son dossier et ses transformations, la validation (type, poids) et la
 * conversion en `Buffer` sont faites ici une seule fois.
 *
 * Les messages d'erreur sont destinés à l'utilisateur — un appelant qui les
 * remonte tel quel dans l'UI reste compréhensible.
 *
 * @throws {ImageValidationError} Type non accepté ou fichier trop lourd.
 * @throws {CloudinaryUploadError} Échec côté Cloudinary.
 */
export async function uploadImageFile(
  file: unknown,
  opts: UploadImageFileOptions,
): Promise<UploadedImage> {
  const {
    acceptedTypes = ACCEPTED_IMAGE_TYPES,
    maxBytes = MAX_IMAGE_BYTES,
    ...uploadOptions
  } = opts;

  if (!(file instanceof File)) {
    throw new ImageValidationError("Aucun fichier fourni.");
  }
  if (!acceptedTypes.includes(file.type)) {
    throw new ImageValidationError(
      `Format non supporté. Formats acceptés : ${formatTypeList(acceptedTypes)}.`,
    );
  }
  if (file.size > maxBytes) {
    throw new ImageValidationError(
      `Image trop lourde (${Math.round(maxBytes / (1024 * 1024))} Mo maximum).`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return uploadImage(buffer, uploadOptions);
}

/**
 * Same as {@link uploadImageFile}, reading the file from a FormData field.
 * Les server actions reçoivent un `FormData` : un fichier ne traverse pas la
 * frontière client/serveur autrement.
 */
export function uploadImageFromFormData(
  formData: FormData,
  opts: UploadImageFileOptions & { fieldName?: string },
): Promise<UploadedImage> {
  const { fieldName = "file", ...rest } = opts;
  return uploadImageFile(formData.get(fieldName), rest);
}

/** "image/jpeg" | "image/png" → "JPEG, PNG" */
function formatTypeList(types: string[]): string {
  return types
    .map((type) => type.replace(/^image\//, "").toUpperCase())
    .join(", ");
}

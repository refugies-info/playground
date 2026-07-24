import { v2 as cloudinary } from "cloudinary";

export class CloudinaryConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudinaryConfigError";
  }
}

export class CloudinaryUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudinaryUploadError";
  }
}

export interface UploadImageOptions {
  /** Cloudinary folder, e.g. "bomo_avatars". */
  folder: string;
  /** Deterministic public id (e.g. a user id) so re-uploads overwrite. */
  publicId?: string;
  overwrite?: boolean;
  /** Stored format, e.g. "webp". */
  format?: string;
  /** Incoming transformation applied before storing (compress/resize/crop). */
  transformation?: Record<string, unknown>;
}

export interface UploadedImage {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface RawUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new CloudinaryConfigError(
      "Missing Cloudinary configuration (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).",
    );
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  configured = true;
}

function uploadBuffer(
  buffer: Buffer,
  options: Record<string, unknown>,
): Promise<RawUploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary returned no result"));
          return;
        }
        resolve(result as unknown as RawUploadResult);
      },
    );
    stream.end(buffer);
  });
}

/**
 * Uploads an image to Cloudinary. Generic, environment-agnostic — callers own
 * persistence and folder choice (avatars now, documents/RCO later).
 */
export async function uploadImage(
  input: Buffer | string,
  opts: UploadImageOptions,
): Promise<UploadedImage> {
  ensureConfigured();

  const options: Record<string, unknown> = {
    folder: opts.folder,
    resource_type: "image",
    overwrite: opts.overwrite ?? false,
  };
  if (opts.publicId !== undefined) options.public_id = opts.publicId;
  if (opts.format !== undefined) options.format = opts.format;
  if (opts.transformation !== undefined) {
    options.transformation = opts.transformation;
  }

  try {
    const result =
      typeof input === "string"
        ? ((await cloudinary.uploader.upload(
            input,
            options,
          )) as unknown as RawUploadResult)
        : await uploadBuffer(input, options);

    return {
      secureUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (err) {
    throw new CloudinaryUploadError(
      err instanceof Error ? err.message : "Cloudinary upload failed",
    );
  }
}

"use server";

import { uploadImage } from "@playground/cloudinary";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/authz";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const userIdSchema = z.string().uuid();

/**
 * Uploads a user's avatar to Cloudinary (compressed 400x400 webp) and stores the
 * resulting URL in profiles.avatar_url. Admin-only.
 */
export async function uploadAvatar(
  userId: string,
  formData: FormData,
): Promise<{ secureUrl: string }> {
  await assertAdmin();

  const parsedId = userIdSchema.safeParse(userId);
  if (!parsedId.success) {
    throw new Error("Identifiant utilisateur invalide.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Aucun fichier fourni.");
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Format non supporté. Formats acceptés : JPEG, PNG, WebP.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image trop lourde (5 Mo maximum).");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const { secureUrl } = await uploadImage(buffer, {
    folder: "bomo_avatars",
    publicId: parsedId.data,
    overwrite: true,
    format: "webp",
    transformation: {
      width: 400,
      height: 400,
      crop: "fill",
      gravity: "auto",
      quality: "auto",
    },
  });

  const adminClient = getSupabaseAdmin();
  const { error } = await adminClient
    .from("profiles")
    .update({ avatar_url: secureUrl })
    .eq("id", parsedId.data);

  if (error) {
    logger.error({ err: error, userId }, "Error saving avatar_url");
    throw new Error("Erreur lors de l'enregistrement de la photo.");
  }

  revalidatePath("/users");
  return { secureUrl };
}

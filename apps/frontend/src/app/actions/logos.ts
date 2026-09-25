"use server";

import { uploadImageFromFormData } from "@playground/cloudinary";
import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { verifyWorkflowPermission } from "@/services/permission-helper";

const workflowIdSchema = z.string().uuid();

/**
 * Uploads a structure logo to Cloudinary and returns its URL (RI-1395).
 *
 * Ne persiste rien : l'appelant enregistre l'URL via `updateField("logo", url)`,
 * ce qui la fait passer par le système d'overrides des métadonnées (validation
 * Zod, état « modifié », bouton vider) comme n'importe quelle autre métadonnée.
 *
 * Contrairement à l'avatar, aucun recadrage : un logo se redimensionne dans son
 * cadre (`crop: "limit"`) et garde son format d'origine, pour ne pas aplatir la
 * transparence d'un PNG ni réencoder un JPG.
 */
export async function uploadMetadataLogo(
  workflowId: string,
  formData: FormData,
): Promise<{ secureUrl: string }> {
  const parsedId = workflowIdSchema.safeParse(workflowId);
  if (!parsedId.success) {
    throw new Error("Identifiant de document invalide.");
  }

  const [currentUser, cookieStore] = await Promise.all([
    getCurrentUser(),
    cookies(),
  ]);
  const supabase = createSupabaseServerClient(cookieStore);

  const hasPermission = await verifyWorkflowPermission(
    supabase,
    parsedId.data,
    currentUser.id,
    currentUser.role ?? undefined,
  );

  if (!hasPermission) {
    logger.warn(
      { userId: currentUser.id, workflowId: parsedId.data },
      "Unauthorized attempt to upload a metadata logo",
    );
    throw new Error("Vous n'avez pas la permission de modifier ce document.");
  }

  const { secureUrl } = await uploadImageFromFormData(formData, {
    folder: "bomo_logos",
    // Un logo par document : le même identifiant est réécrit à chaque envoi.
    publicId: parsedId.data,
    overwrite: true,
    transformation: {
      width: 512,
      height: 512,
      crop: "limit",
      quality: "auto",
    },
  });

  logger.info({ workflowId: parsedId.data }, "Metadata logo uploaded");

  return { secureUrl };
}

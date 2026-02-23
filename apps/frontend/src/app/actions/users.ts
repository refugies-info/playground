"use server";

import crypto from "node:crypto";
import { logger } from "@playground/shared-types";

import {
  createSupabaseServerClient,
  getSupabaseAdmin,
} from "@playground/supabase";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

// Security Check Helper
async function assertAdmin() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Non authentifié.");
  }

  const role = user.user_metadata?.role;
  if (role !== "admin") {
    logger.warn(
      { userId: user.id },
      "Unauthorized attempt to access admin action",
    );
    throw new Error("Non autorisé : Droits d'administrateur requis.");
  }
}

// User Schemas
const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(50).optional(),
  role: z.enum(["admin", "editor", "translator"]),
  language: z.string().optional(),
});

const updateUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(2).max(50).optional(),
  role: z.enum(["admin", "editor", "translator"]),
  language: z.string().optional(),
});

export type CreateUserState = {
  message?: string;
  error?: string;
};

// Create User
export async function createUser(data: {
  email: string;
  username?: string;
  role: string;
  language?: string;
}) {
  await assertAdmin();
  const adminClient = getSupabaseAdmin();

  const validatedFields = createUserSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error("Données invalides. Vérifiez les champs.");
  }

  const { email, username, role, language } = validatedFields.data;

  // Validate translator language requirement
  if (role === "translator" && !language) {
    throw new Error("La langue est obligatoire pour un traducteur.");
  }

  // Generate a random secure password
  const password = `${crypto.randomBytes(8).toString("hex")}!`;

  try {
    const { error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        role,
        language,
      },
    });

    if (error) {
      logger.error({ err: error, email }, "Error creating user");
      throw new Error(`Erreur lors de la création: ${error.message}`);
    }

    revalidatePath("/users");
    // Return the password so it can be displayed to the admin
    return { success: true, password };
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Une erreur inattendue est survenue.";
    logger.error({ err: e }, "Unexpected error in createUser");
    throw new Error(message);
  }
}

// Update User
export async function updateUser(data: {
  id: string;
  username?: string;
  role: string;
  language?: string;
}) {
  await assertAdmin();
  const adminClient = getSupabaseAdmin();

  const validatedFields = updateUserSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error("Données invalides.");
  }

  const { id, username, role, language } = validatedFields.data;

  // Validate translator language
  if (role === "translator" && !language) {
    throw new Error("La langue est obligatoire pour un traducteur.");
  }

  try {
    const { error } = await adminClient.auth.admin.updateUserById(id, {
      user_metadata: { username, role, language },
    });

    if (error) {
      logger.error({ err: error, id }, "Error updating user");
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }

    revalidatePath("/users");
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    logger.error({ err: e }, "Unexpected error in updateUser");
    throw new Error(message);
  }
}

// Delete User
export async function deleteUser(id: string) {
  await assertAdmin();
  const adminClient = getSupabaseAdmin();

  try {
    const { error } = await adminClient.auth.admin.deleteUser(id);
    if (error) {
      logger.error({ err: error, id }, "Error deleting user");
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
    revalidatePath("/users");
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    logger.error({ err: e }, "Unexpected error in deleteUser");
    throw new Error(message);
  }
}

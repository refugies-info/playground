"use server";

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

  // Read role from profiles (source of truth), not from JWT claims.
  // Server actions use the admin client to bypass RLS and get a fresh value.
  const adminClient = getSupabaseAdmin();
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    logger.error(
      { userId: user.id, err: profileError },
      "Failed to fetch profile for admin check",
    );
    throw new Error("Non autorisé : Droits d'administrateur requis.");
  }

  if (profile?.role !== "admin") {
    logger.warn(
      { userId: user.id, role: profile?.role ?? null },
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

  try {
    // Invite user — Supabase sends the invitation email.
    // Only non-sensitive display data (username) goes in user_metadata.
    // role and language are written to profiles (source of truth for RBAC).
    const { data: inviteData, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        data: { username },
      });

    if (inviteError) {
      logger.error({ err: inviteError, email }, "Error inviting user");
      throw new Error(`Erreur lors de l'invitation: ${inviteError.message}`);
    }

    // Write role and language to profiles (source of truth for RBAC).
    // get_my_role() queries profiles directly for RLS policies.
    // upsert instead of update: the handle_new_user trigger creates the profile
    // on auth.users INSERT, but upsert is safer if the trigger hasn't fired yet.
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert({ id: inviteData.user.id, role, language }, { onConflict: "id" });

    if (profileError) {
      logger.error(
        { err: profileError, email },
        "Error setting user profile role",
      );
      throw new Error(
        `Erreur lors de la configuration du rôle: ${profileError.message}`,
      );
    }

    revalidatePath("/users");
    return { success: true };
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
    // username → user_metadata (display data, not security-sensitive)
    const { error: authError } = await adminClient.auth.admin.updateUserById(
      id,
      {
        user_metadata: { username },
      },
    );

    if (authError) {
      logger.error({ err: authError, id }, "Error updating user auth metadata");
      throw new Error(`Erreur lors de la mise à jour: ${authError.message}`);
    }

    // role and language → profiles (source of truth for RBAC)
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ role, language })
      .eq("id", id);

    if (profileError) {
      logger.error(
        { err: profileError, id },
        "Error updating user profile role",
      );
      throw new Error(
        `Erreur lors de la mise à jour du rôle: ${profileError.message}`,
      );
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

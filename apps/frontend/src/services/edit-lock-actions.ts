"use server";

import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";

export async function claimEditLock(
  editorialRecordId: string,
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Non autorisé" };
  }

  const { data, error } = await supabase
    .from("editorial_records")
    .update({ current_editor_id: user.id })
    .eq("id", editorialRecordId)
    .or(`current_editor_id.is.null,current_editor_id.eq.${user.id}`)
    .select("id");

  if (error) {
    logger.error(error, "Error claiming edit lock");
    return { success: false, error: error.message };
  }
  if (!data?.length) {
    return { success: false, error: "Lock already taken" };
  }
  return { success: true };
}

export async function forceClaimEditLock(
  editorialRecordId: string,
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Non autorisé" };
  }

  const { error } = await supabase
    .from("editorial_records")
    .update({ current_editor_id: user.id })
    .eq("id", editorialRecordId);

  if (error) {
    logger.error(error, "Error force-claiming edit lock");
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function releaseEditLock(
  editorialRecordId: string,
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Non autorisé" };
  }

  const { error } = await supabase
    .from("editorial_records")
    .update({ current_editor_id: null })
    .eq("id", editorialRecordId);

  if (error) {
    logger.error(error, "Error releasing edit lock");
    return { success: false, error: error.message };
  }
  return { success: true };
}

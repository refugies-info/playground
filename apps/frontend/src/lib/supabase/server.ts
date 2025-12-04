import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createSupabaseServerClient(cookieStore);
}

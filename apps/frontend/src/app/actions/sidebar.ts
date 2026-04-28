"use server";

import { cookies } from "next/headers";
import { SIDEBAR_COOKIE } from "@/lib/cookies";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Persiste la préférence sidebar dans un cookie lisible côté serveur.
 * Appelé en fire-and-forget depuis AppSidebar au toggle.
 */
export async function setSidebarCollapsed(collapsed: boolean) {
  const cookieStore = await cookies();
  cookieStore.set(SIDEBAR_COOKIE, String(collapsed), {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
}

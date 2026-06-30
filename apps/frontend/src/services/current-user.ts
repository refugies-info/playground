"use server";

import { type CurrentUser, getCurrentUser } from "@/lib/auth";

export async function getCurrentUserAction(): Promise<CurrentUser> {
  return getCurrentUser();
}

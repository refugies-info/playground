import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import type {
  UserData,
  UserRole,
} from "@playground/ui/composites/user-card/UserCard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthUser, getUserProfile } from "@/lib/auth";
import { UserGrid } from "./user-grid";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const user = await getAuthUser(supabase);

  if (!user) {
    redirect("/login");
  }

  const currentUserProfile = await getUserProfile(supabase, user.id);
  if (currentUserProfile?.role !== "admin") {
    redirect("/");
  }

  const profilesResult = await supabase
    .from("profiles")
    .select("id, role, language, username, email, created_at")
    .order("created_at", { ascending: false });

  if (profilesResult.error) {
    logger.error({ err: profilesResult.error }, "Error fetching users");
    return <div>Erreur lors du chargement des utilisateurs.</div>;
  }

  const formattedUsers: UserData[] = profilesResult.data.map((p) => ({
    id: p.id,
    email: p.email || "",
    username: p.username || "",
    role: (p.role as UserRole) || "editor",
    language: p.language ?? undefined,
    created_at: p.created_at ?? undefined,
  }));

  return (
    <div className="w-full">
      <UserGrid initialUsers={formattedUsers} />
    </div>
  );
}

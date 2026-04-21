import { logger } from "@playground/shared-types";
import {
  createSupabaseServerClient,
  getSupabaseAdmin,
} from "@playground/supabase";
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

  const adminClient = getSupabaseAdmin();

  // Fetch users and profiles in parallel (independent queries)
  const [usersResult, profilesResult] = await Promise.all([
    adminClient.auth.admin.listUsers(),
    adminClient.from("profiles").select("id, role, language"),
  ]);

  if (usersResult.error) {
    logger.error({ err: usersResult.error }, "Error fetching users");
    return <div>Erreur lors du chargement des utilisateurs.</div>;
  }

  const { users } = usersResult.data;

  // Sort users by created_at desc
  const sortedUsers = users.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const profileMap = new Map((profilesResult.data ?? []).map((p) => [p.id, p]));

  // Map to UserData interface
  const formattedUsers: UserData[] = sortedUsers.map((u) => ({
    id: u.id,
    email: u.email || "",
    username: u.user_metadata?.username,
    role: (profileMap.get(u.id)?.role as UserRole) || "editor",
    language: profileMap.get(u.id)?.language ?? undefined,
    created_at: u.created_at,
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des utilisateurs
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérez les accès et les rôles des utilisateurs de la plateforme.
          </p>
        </div>

        <UserGrid initialUsers={formattedUsers} />
      </div>
    </div>
  );
}

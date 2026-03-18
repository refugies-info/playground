import { logger } from "@playground/shared-types";
import {
  createSupabaseServerClient,
  getSupabaseAdmin,
} from "@playground/supabase";
import type { UserData } from "@playground/ui/composites/user-card/UserCard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { UserGrid } from "./user-grid";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const user = await getAuthUser(supabase);

  if (!user) {
    redirect("/login");
  }

  const userRole = user.user_metadata?.role;
  if (userRole !== "admin") {
    redirect("/");
  }

  const adminClient = getSupabaseAdmin();
  const {
    data: { users },
    error,
  } = await adminClient.auth.admin.listUsers();

  if (error) {
    logger.error({ err: error }, "Error fetching users");
    return <div>Erreur lors du chargement des utilisateurs.</div>;
  }

  // Sort users by created_at desc
  const sortedUsers = users.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // Map to UserData interface
  const formattedUsers: UserData[] = sortedUsers.map((u) => ({
    id: u.id,
    email: u.email || "",
    username: u.user_metadata?.username,
    role: u.user_metadata?.role || "editor", // default fallback
    language: u.user_metadata?.language,
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

import type {
  UserData,
  UserRole,
} from "@playground/ui/composites/user-card/UserCard";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllProfilesForAdmin } from "@/services/profiles";
import { UserGrid } from "./user-grid";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [currentUser, profiles] = await Promise.all([
    getCurrentUser(),
    getAllProfilesForAdmin(),
  ]);

  if (currentUser.role !== "admin") {
    redirect("/");
  }

  const formattedUsers: UserData[] = profiles.map((p) => ({
    id: p.id,
    email: p.email,
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

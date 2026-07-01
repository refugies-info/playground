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

  return (
    <div className="w-full">
      <UserGrid initialUsers={profiles} />
    </div>
  );
}

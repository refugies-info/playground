import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { TopNav } from "@/components/TopNav";
import { getAuthUser } from "@/lib/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const user = await getAuthUser(supabase);

  const role = user?.user_metadata?.role;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav role={role} />
      <main>{children}</main>
    </div>
  );
}

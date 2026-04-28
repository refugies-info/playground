import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { AppSidebar } from "@/components/common/AppSidebar";
import { getAuthUser, getUserProfile } from "@/lib/auth";
import { SIDEBAR_COOKIE } from "@/lib/cookies";
import { PageShell } from "./page-shell";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const user = await getAuthUser(supabase);
  const profile = user ? await getUserProfile(supabase, user.id) : null;
  const sidebarCollapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "true";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background-alt-blue-france,#f5f5fe)]">
      <AppSidebar
        userRole={profile?.role ?? null}
        userEmail={user?.email ?? null}
        initialCollapsed={sidebarCollapsed}
      />
      {/* Panel principal — fond blanc, arrondi côté gauche, bordure */}
      <main className="flex flex-col flex-1 overflow-auto bg-white rounded-tl-[16px] rounded-bl-[16px] border-l border-t border-b border-[#dddddd]">
        {/* Suspense requis : PageShell appelle usePathname() qui provoque un
            CSR bailout sur les routes dynamiques (/documents/[id]) sans boundary */}
        <Suspense fallback={null}>
          <PageShell>{children}</PageShell>
        </Suspense>
      </main>
    </div>
  );
}

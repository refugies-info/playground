import { cookies } from "next/headers";
import { Suspense } from "react";
import { AppSidebar } from "@/components/common/AppSidebar";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { getCurrentUser } from "@/lib/auth";
import { SIDEBAR_COOKIE } from "@/lib/cookies";
import { PageShell } from "./page-shell";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, cookieStore] = await Promise.all([
    getCurrentUser(),
    cookies(),
  ]);
  const sidebarCollapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "true";

  return (
    <SidebarProvider initialCollapsed={sidebarCollapsed}>
      <div className="flex h-screen w-full bg-[var(--background-alt-blue-france,#f5f5fe)]">
        <AppSidebar userRole={currentUser.role} userEmail={currentUser.email} />
        <main className="flex flex-1 flex-col overflow-y-auto bg-white rounded-tl-[16px] rounded-bl-[16px] border-l border-t border-b border-[#dddddd]">
          {/* Suspense requis : usePathname() dans PageShell provoque un CSR bailout sans boundary */}
          <Suspense fallback={null}>
            <PageShell>{children}</PageShell>
          </Suspense>
        </main>
      </div>
    </SidebarProvider>
  );
}

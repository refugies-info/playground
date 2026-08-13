import { cookies } from "next/headers";
import { Suspense } from "react";
import { AppSidebar } from "@/components/common/AppSidebar";
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { getCurrentUser } from "@/lib/auth";
import { SIDEBAR_COOKIE } from "@/lib/cookies";
import { getNotificationCounts } from "@/services/notifications";
import { PageShell } from "./page-shell";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, cookieStore, notificationCounts] = await Promise.all([
    getCurrentUser(),
    cookies(),
    getNotificationCounts(),
  ]);
  const sidebarCollapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "true";
  return (
    <SidebarProvider initialCollapsed={sidebarCollapsed}>
      <NotificationsProvider
        userId={currentUser.id}
        initialUnreadCount={notificationCounts.unread}
      >
        <div className="flex h-screen w-full bg-[var(--background-alt-blue-france,#f5f5fe)]">
          <AppSidebar
            userRole={currentUser.role}
            userEmail={currentUser.email}
            avatarUrl={currentUser.avatarUrl}
          />
          <main className="flex flex-1 flex-col overflow-y-auto bg-white rounded-tl-[16px] rounded-bl-[16px] border-l border-t border-b border-[#dddddd]">
            {/* Suspense requis : usePathname() dans PageShell provoque un CSR bailout sans boundary */}
            <Suspense fallback={null}>
              <PageShell>{children}</PageShell>
            </Suspense>
          </main>
          <NotificationsPanel />
        </div>
      </NotificationsProvider>
    </SidebarProvider>
  );
}

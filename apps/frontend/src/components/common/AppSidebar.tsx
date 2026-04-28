"use client";

import {
  AppLogo,
  Avatar,
  BoutonMenu,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sidebar,
} from "@playground/ui";
import {
  RiAccountCircleLine,
  RiDownloadLine,
  RiFileTextLine,
  RiLogoutBoxRLine,
  RiTranslate2,
} from "@playground/ui/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { setSidebarCollapsed } from "@/app/actions/sidebar";
import { createClient } from "@/lib/supabase/client";

export interface AppSidebarProps {
  userRole?: string | null;
  userEmail?: string | null;
  /** État initial lu depuis le cookie côté serveur — évite le flash au chargement */
  initialCollapsed?: boolean;
}

/**
 * AppSidebar — Sidebar de navigation globale (layout principal)
 *
 * La préférence replié/déplié est persistée dans un cookie via la Server Action
 * `setSidebarCollapsed`. L'état initial est lu côté serveur dans le layout et
 * passé via `initialCollapsed` — zéro flash au chargement.
 */
export function AppSidebar({
  userRole,
  userEmail,
  initialCollapsed = false,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Initialisé depuis le cookie lu côté serveur → pas de flash au chargement
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const handleToggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    // Fire-and-forget : persiste dans un cookie lisible côté serveur
    setSidebarCollapsed(next);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh(); // Invalide le cache RSC pour éviter des données de session stale
    router.push("/login");
  };

  const isAdmin = userRole === "admin";
  const isTranslator = userRole === "translator";

  const userAvatar = (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Menu utilisateur"
          className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-action-high-blue-france)]"
        >
          <Avatar email={userEmail} className="size-12" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        variant="default"
        side="top"
        align="start"
        sideOffset={8}
        className="w-48"
      >
        <Button
          variant="quatrieme"
          size="sm"
          leftIcon={RiLogoutBoxRLine}
          onClick={handleLogout}
          className="w-full justify-start"
        >
          Se déconnecter
        </Button>
      </PopoverContent>
    </Popover>
  );

  const logo = (
    <AppLogo
      image={
        <Image
          src="/logo-ri.svg"
          alt="BOMO"
          width={24}
          height={24}
          className="h-6 w-6"
        />
      }
      title="BOMO"
      collapsed={isCollapsed}
      href="/"
      linkComponent={Link}
    />
  );

  return (
    <Sidebar
      isCollapsed={isCollapsed}
      onToggle={handleToggle}
      logo={logo}
      userAvatar={userAvatar}
    >
      {isAdmin && (
        <BoutonMenu
          icon={RiDownloadLine}
          label="Importer"
          active={pathname === "/workflow"}
          iconOnly={isCollapsed}
          href="/workflow"
          linkComponent={Link}
        />
      )}

      {!isTranslator && (
        <BoutonMenu
          icon={RiFileTextLine}
          label="Fiches"
          active={pathname?.startsWith("/documents") ?? false}
          iconOnly={isCollapsed}
          href="/documents"
          linkComponent={Link}
        />
      )}

      <BoutonMenu
        icon={RiTranslate2}
        label="Espace de traduction"
        active={pathname === "/translations"}
        iconOnly={isCollapsed}
        href="/translations"
        linkComponent={Link}
      />

      {isAdmin && (
        <BoutonMenu
          icon={RiAccountCircleLine}
          label="Utilisateurs"
          active={pathname === "/users"}
          iconOnly={isCollapsed}
          href="/users"
          linkComponent={Link}
        />
      )}
    </Sidebar>
  );
}

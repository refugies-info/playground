"use client";

import { AppLogo, Avatar, BoutonMenu, Sidebar } from "@playground/ui";
import {
  RiAccountCircleLine,
  RiDownloadLine,
  RiFileTextLine,
  RiTranslate2,
} from "@playground/ui/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { setSidebarCollapsed } from "@/app/actions/sidebar";

export interface DocumentSidebarProps {
  userRole?: string | null;
  userEmail?: string | null;
  /** État initial lu depuis le cookie côté serveur — évite le flash au chargement */
  initialCollapsed?: boolean;
}

/**
 * DocumentSidebar — Sidebar globale de l'éditeur de fiches
 *
 * Gère l'état replié/déplié en localStorage pour persister la préférence
 * entre les navigations. L'état initial est `false` (déplié) côté serveur pour
 * éviter les erreurs de hydratation, puis mis à jour depuis localStorage au
 * montage côté client.
 */
export function DocumentSidebar({
  userRole,
  userEmail,
  initialCollapsed = false,
}: DocumentSidebarProps) {
  const pathname = usePathname();

  // Initialisé depuis le cookie lu côté serveur → pas de flash au chargement
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const handleToggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    // Fire-and-forget : persiste dans un cookie HttpOnly lisible côté serveur
    setSidebarCollapsed(next);
  };

  const isAdmin = userRole === "admin";
  const isTranslator = userRole === "translator";

  const userAvatar = <Avatar email={userEmail} className="size-12" />;

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

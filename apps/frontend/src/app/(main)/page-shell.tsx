"use client";

import { usePathname } from "next/navigation";

/**
 * Pages liste avec titre statique injecté par ce composant.
 */
const PAGE_TITLES: Record<string, string> = {
  "/documents": "Fiches",
  "/users": "Gestion des utilisateurs",
  "/workflow": "Importer du contenu",
};

/**
 * Pages liste qui reçoivent le padding Figma mais gèrent leur propre h1
 * (titre dynamique selon le rôle, ex. /translations).
 */
const PADDED_PATHS = new Set([...Object.keys(PAGE_TITLES), "/translations"]);

interface PageShellProps {
  children: React.ReactNode;
}

/**
 * PageShell — injecte le padding Figma (56px haut/bas, 40px gauche/droite)
 * sur toutes les pages liste, et le h1 uniquement pour les titres statiques.
 *
 * - Pages éditeur (/documents/[id], /translations/[id]) : pass-through, aucun wrapper.
 * - /translations : padding uniquement — le composant gère son propre h1 dynamique.
 * - /documents, /users, /workflow : padding + h1.
 */
export function PageShell({ children }: PageShellProps) {
  const pathname = usePathname();

  if (!PADDED_PATHS.has(pathname)) {
    // Pages éditeur ou routes inconnues — pas de wrapper
    return <>{children}</>;
  }

  const title = PAGE_TITLES[pathname];

  return (
    <div className="py-14 px-10 flex flex-col gap-8">
      {title && (
        <h1 className="text-[40px] font-bold leading-[1.2]">{title}</h1>
      )}
      {children}
    </div>
  );
}

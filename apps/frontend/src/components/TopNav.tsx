"use client";

import { AppHeader, AppLogo, BoutonMenu } from "@playground/ui";
import {
  RiAccountCircleLine,
  RiDownloadLine,
  RiFileTextLine,
  RiLogoutBoxRLine,
  RiTranslate2,
} from "@playground/ui/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export interface TopNavProps {
  role?: string | null;
}

export function TopNav({ role }: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const currentSearch = searchParams.toString();
  const documentsHref =
    pathname === "/documents" && currentSearch
      ? `/documents?${currentSearch}`
      : "/documents";
  const translationsHref =
    pathname === "/translations" && currentSearch
      ? `/translations?${currentSearch}`
      : "/translations";

  const isTranslator = role === "translator";

  return (
    <AppHeader>
      <AppLogo
        image={
          <Image
            src="/logo-ri.svg"
            alt="BOMO"
            width={48}
            height={48}
            className="h-12 w-12"
          />
        }
        title="BOMO ?"
        href="/"
        linkComponent={Link}
      />
      <nav className="ml-auto flex items-center gap-2 py-3">
        {!isTranslator && (
          <>
            {role === "admin" && (
              <BoutonMenu
                icon={RiDownloadLine}
                label="Importer"
                active={pathname === "/workflow"}
                href="/workflow"
                linkComponent={Link}
              />
            )}
            <BoutonMenu
              icon={RiFileTextLine}
              label="Fiches"
              active={pathname === "/documents"}
              href={documentsHref}
              linkComponent={Link}
            />
            <BoutonMenu
              icon={RiTranslate2}
              label="Espace de traduction"
              active={pathname === "/translations"}
              href={translationsHref}
              linkComponent={Link}
            />
            {role === "admin" && (
              <BoutonMenu
                icon={RiAccountCircleLine}
                label="Utilisateurs"
                active={pathname === "/users"}
                href="/users"
                linkComponent={Link}
              />
            )}
          </>
        )}
        <BoutonMenu
          icon={RiLogoutBoxRLine}
          label="Se déconnecter"
          onClick={handleLogout}
        />
      </nav>
    </AppHeader>
  );
}

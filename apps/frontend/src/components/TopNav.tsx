"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export interface TopNavProps {
  role?: string | null;
}

export function TopNav({ role }: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isWorkflowActive = pathname === "/workflow";
  const isDocumentsActive = pathname === "/documents";
  const isTranslationsActive = pathname === "/translations";

  // Requirement: "pour les tranducteurs on affiche uniquement le bouton se deconnecter"
  const isTranslator = role === "translator";

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-ri.svg"
              alt="Content Playground"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <h1 className="text-xl font-semibold text-gray-900">
              Content Playground
            </h1>
          </div>
          <div className="flex items-center gap-8">
            {!isTranslator && (
              <>
                {role === "admin" && (
                  <Link
                    href="/workflow"
                    className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
                      isWorkflowActive
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                    }`}
                  >
                    Importer
                  </Link>
                )}
                <Link
                  href="/documents"
                  className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
                    isDocumentsActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                  }`}
                >
                  Documents
                </Link>
                <Link
                  href="/translations"
                  className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
                    isTranslationsActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                  }`}
                >
                  Traductions
                </Link>
                {role === "admin" && (
                  <Link
                    href="/users"
                    className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
                      pathname === "/users"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                    }`}
                  >
                    Utilisateurs
                  </Link>
                )}
              </>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:underline"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";

import { Button } from "@playground/ui";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      // Refresh router to update server components and middleware
      router.refresh();
      router.push("/login");
    } catch (err) {
      // biome-ignore lint/suspicious/noConsole: For debugging
      console.error("Logout failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Image
                src="/logo-ri.svg"
                alt="Réfugiés.info"
                width={50}
                height={50}
              />
              <span className="flex flex-col">
                Réfugiés.info
                <span className="text-gray-600 text-sm font-normal">
                  Content Playground
                </span>
              </span>
            </h1>
            <Button
              onClick={handleLogout}
              isLoading={isLoading}
              variant="ghost"
            >
              Se déconnecter
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        <p className="text-gray-600">Bienvenue dans l'administration</p>
      </main>
    </div>
  );
}

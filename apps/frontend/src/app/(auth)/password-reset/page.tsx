"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PasswordConfirmForm, PasswordResetForm } from "@/components/auth";
import { createClient } from "@/lib/supabase/client";

export default function PasswordResetPage() {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [lastResetTime, setLastResetTime] = useState<number>(0);
  const supabase = createClient();

  const RATE_LIMIT_MS = 60000; // 1 minute

  useEffect(() => {
    // Check if user has an active session (from PKCE recovery flow)
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setIsConfirming(true);
      }
    };

    checkSession();

    // Listen for PASSWORD_RECOVERY event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsConfirming(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleResetPassword = async (email: string) => {
    // Client-side rate limiting
    const now = Date.now();
    if (now - lastResetTime < RATE_LIMIT_MS) {
      throw new Error(
        "Veuillez attendre avant de renvoyer un email de réinitialisation",
      );
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      throw error;
    }

    // Update last reset time on success
    setLastResetTime(now);
  };

  const handleConfirmPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw error;
    }
    // Redirect to documents on success
    router.push("/documents");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-8 text-center">
            <Image
              src="/logo-ri.svg"
              alt="Content Playground"
              width={60}
              height={60}
              className="m-auto mb-2"
            />
            <h1 className="text-sm font-bold text-gray-900">
              Content Playground
            </h1>
          </div>
        </div>
        {isConfirming ? (
          <div className="rounded-md bg-blue-50 p-4 mb-4">
            <p className="text-sm text-blue-700">
              Entrez votre nouveau mot de passe pour terminer la
              réinitialisation.
            </p>
          </div>
        ) : null}
        {isConfirming ? (
          <PasswordConfirmForm onSubmit={handleConfirmPassword} />
        ) : (
          <PasswordResetForm onSubmit={handleResetPassword} />
        )}
      </div>
    </div>
  );
}

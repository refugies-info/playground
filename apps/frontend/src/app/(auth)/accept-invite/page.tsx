"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PasswordConfirmForm } from "@/components/auth";
import { createClient } from "@/lib/supabase/client";

export default function AcceptInvitePage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Session is already established by /login before redirecting here.
    // getUser() verifies the session server-side (safer than getSession()
    // which only reads local storage without validation).
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsReady(true);
      } else {
        setError(
          "Lien d'invitation invalide ou expiré. Veuillez contacter un administrateur.",
        );
      }
    });
  }, [supabase.auth]);

  const handleConfirmPassword = async (password: string) => {
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      return;
    }

    // Session is valid after setting password — redirect to role-based routing.
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
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

        {error ? (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : null}

        {isReady ? (
          <>
            <div className="rounded-md bg-blue-50 p-4 mb-4">
              <p className="text-sm text-blue-700">
                Bienvenue ! Créez votre mot de passe pour activer votre compte.
              </p>
            </div>
            <PasswordConfirmForm onSubmit={handleConfirmPassword} />
          </>
        ) : (
          <div className="text-center text-sm text-gray-500">
            Vérification de votre invitation…
          </div>
        )}
      </div>
    </div>
  );
}

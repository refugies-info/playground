"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LoginForm } from "@/components/auth";
import { createClient } from "@/lib/supabase/client";

function MessageBanner() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const error = searchParams.get("error");
  return (
    <>
      {message ? (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [hashError, setHashError] = useState<string | null>(null);

  useEffect(() => {
    // Detect auth errors returned by Supabase in the URL hash
    // e.g. expired invite/recovery links → #error=access_denied&error_description=...
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get("error");
    const errorDescription = hashParams.get("error_description");
    if (error) {
      setHashError(
        errorDescription?.replace(/\+/g, " ") ??
          "Lien invalide ou expiré. Veuillez réessayer.",
      );
      // Clean the hash from the URL without triggering a navigation
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // Supabase invite links land on /login by default (implicit flow with hash).
    // @supabase/ssr's createBrowserClient doesn't auto-process the hash —
    // we need to explicitly call setSession() with the tokens from the hash.
    if (!window.location.hash.includes("type=invite")) return;

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (!accessToken || !refreshToken) return;

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (!error) {
          router.replace("/accept-invite");
        } else {
          setHashError("Lien d'invitation invalide ou expiré.");
        }
      });
  }, [router, supabase.auth]);

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Refresh router to update server components and middleware
    router.refresh();
    router.push("/documents");
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
        <Suspense>
          <MessageBanner />
        </Suspense>
        {hashError ? (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {hashError}
          </div>
        ) : null}
        <LoginForm onSubmit={handleSignIn} />
      </div>
    </div>
  );
}

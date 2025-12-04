"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabaseClient } from "@playground/supabase";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
          setError(error);
          return;
        }

        if (code) {
          const { data, error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }

          if (data.session) {
            // Set auth cookie for middleware
            // biome-ignore lint/suspicious/noDocumentCookie: For setting auth cookie
            document.cookie = `sb-auth-token=${
              data.session.access_token
            }; path=/; max-age=${3600}; SameSite=Lax`;
          }
        }

        // Redirect to dashboard
        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Processing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Authentication Error
          </h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <a
            href="/login"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return null;
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

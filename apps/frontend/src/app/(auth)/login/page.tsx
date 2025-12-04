"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@playground/supabase";

import { LoginForm } from "@/components/auth";

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = async (email: string, password: string) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.session) {
      // Set auth cookie for middleware
      // biome-ignore lint/suspicious/noDocumentCookie: For setting auth cookie
      document.cookie = `sb-auth-token=${
        data.session.access_token
      }; path=/; max-age=${3600}; SameSite=Lax`;

      // Wait a moment for cookie to be set, then redirect
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push("/dashboard");
    }
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
        <LoginForm onSubmit={handleSignIn} />
      </div>
    </div>
  );
}

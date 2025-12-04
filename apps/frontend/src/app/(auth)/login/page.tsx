"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

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
    router.push("/dashboard");
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { supabaseClient } from "@playground/supabase";

import { SignupForm } from "@/components/auth";
import { SIGNUP_ENABLED } from "@/config/features";

export default function SignupPage() {
  const handleSignUp = async (email: string, password: string) => {
    if (!SIGNUP_ENABLED) {
      throw new Error(
        "Les créations de compte sont temporairement désactivées.",
      );
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      // Verification email will be sent by Supabase
      // User will see success message in the form
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
        {SIGNUP_ENABLED ? (
          <SignupForm onSubmit={handleSignUp} />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-base font-medium text-gray-900">
              Les créations de compte sont temporairement désactivées.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Merci de contacter un administrateur pour obtenir un accès ou
              d'utiliser un compte existant.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

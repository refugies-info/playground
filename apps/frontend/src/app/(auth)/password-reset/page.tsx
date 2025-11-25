"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { PasswordResetForm, PasswordConfirmForm } from "@/components/auth";
import { resetPassword, updatePassword } from "@/lib/auth";

export default function PasswordResetPage() {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    // Check if we have a recovery token in the hash
    const hash = window.location.hash;
    if (hash.includes("access_token") && hash.includes("type=recovery")) {
      setIsConfirming(true);
    }
  }, []);

  const handleResetPassword = async (email: string) => {
    const { error } = await resetPassword(email);
    if (error) {
      throw error;
    }
  };

  const handleConfirmPassword = async (password: string) => {
    const { error } = await updatePassword(password);
    if (error) {
      throw error;
    }
    // Redirect to dashboard on success
    router.push("/dashboard");
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

"use client";

import { useState } from "react";

import Link from "next/link";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@refugies/ui";

interface PasswordResetFormProps {
  onSubmit?: (email: string) => Promise<void>;
}

export function PasswordResetForm({ onSubmit }: PasswordResetFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(email);
      }
      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset link"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reinitialiser votre mot de passe</CardTitle>
        <CardDescription>
          Entrez votre email pour recevoir un lien de reinitialisation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              Un lien de reinitialisation a ete envoyé à votre email.
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="rosa@refugies.info"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Envoyer le lien de reinitialisation
          </Button>

          <div className="text-center text-sm">
            <p>
              <Link href="/login" className="text-blue-600 hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

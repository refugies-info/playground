"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@refugies/ui";

import Link from "next/link";
import { useState } from "react";

import { SIGNUP_ENABLED } from "@/config/features";

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connectez-vous</CardTitle>
        <CardDescription>
          Saisissez votre email et mot de passe pour vous connecter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="rosa@Réfugiés.info"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Se connecter
          </Button>

          <div className="space-y-2 text-center text-sm">
            <p>
              <Link
                href="/password-reset"
                className="text-blue-600 hover:underline"
              >
                Mot de passe oublié?
              </Link>
            </p>
            {SIGNUP_ENABLED ? (
              <p>
                Pas de compte?{" "}
                <Link href="/signup" className="text-blue-600 hover:underline">
                  S'inscrire
                </Link>
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

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

interface PasswordConfirmFormProps {
  onSubmit?: (password: string) => Promise<void>;
}

export function PasswordConfirmForm({ onSubmit }: PasswordConfirmFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caracteres";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Le mot de passe doit contenir des lettres minuscules";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Le mot de passe doit contenir des lettres majuscules";
    }
    if (!/\d/.test(pwd)) {
      return "Le mot de passe doit contenir des chiffres";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      // Validate passwords
      const validationError = validatePassword(password);
      if (validationError) {
        setError(validationError);
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        setIsLoading(false);
        return;
      }

      if (onSubmit) {
        await onSubmit(password);
      }
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Echec de la reinitialisation",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Confirmer votre mot de passe</CardTitle>
        <CardDescription>
          Entrez votre nouveau mot de passe pour terminer la réinitialisation.
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
              Votre mot de passe a ete reinitialise avec succes.
            </div>
          )}

          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <div className="text-xs text-gray-600">
            <p>Mot de passe doit contenir:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Au moins 8 caracteres</li>
              <li>Des lettres majuscules (A-Z)</li>
              <li>Des lettres minuscules (a-z)</li>
              <li>Des chiffres (0-9)</li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Confirmer
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

import { ErrorCard } from "@playground/ui/primitives";
import { WifiOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * Displayed when Supabase is unreachable (connection refused or network error).
 *
 * Intentionally outside (main)/ and (auth)/ route groups so it renders
 * without any authenticated layout.
 */
export default function ServiceUnavailablePage() {
  const isDev = process.env.NODE_ENV === "development";

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

        <ErrorCard
          title="Service temporairement indisponible"
          icon={<WifiOff className="size-6" />}
          // Using Link inside ErrorCard's retry button slot would require component changes,
          // so we render the button manually below
        >
          <p className="text-sm text-gray-600">
            {isDev ? (
              <>
                La base de données ne répond pas. Vérifiez que Supabase est
                lancé :{" "}
                <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs">
                  supabase start
                </code>
              </>
            ) : (
              "La base de données ne répond pas. Contactez l'équipe technique."
            )}
          </p>

          <Link
            href="/"
            className="mt-6 block w-full rounded-md bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            Réessayer
          </Link>
        </ErrorCard>
      </div>
    </div>
  );
}

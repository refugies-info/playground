import { logger } from "@playground/shared-types";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();

    // Read environment variables - they should be available in server context
    // NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is the preferred name (align with clients.ts)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error(
        {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
        },
        "Missing Supabase environment variables",
      );
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent("Erreur de configuration. Veuillez contacter un administrateur.")}`,
      );
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to password reset page on success
      return NextResponse.redirect(`${origin}/password-reset`);
    }

    logger.error({ error }, "Failed to exchange code for session");
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Lien invalide ou expiré. Veuillez réessayer.")}`,
    );
  }

  // No code in URL — redirect to login with error
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Lien invalide ou expiré. Veuillez réessayer.")}`,
  );
}

import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();

    const supabase = createSupabaseServerClient(cookieStore);

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

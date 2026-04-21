import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isConnectionError } from "./errors";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    // biome-ignore lint/style/noNonNullAssertion: Supabase URL is required
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // biome-ignore lint/style/noNonNullAssertion: Supabase Key is required
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data, error } = await supabase.auth.getUser();

  const user = data?.user;

  // Detect connection errors (Supabase unreachable).
  // getUser() never throws — it returns { data: { user: null }, error } on failure.
  // We must distinguish between:
  // - Actual connection errors (network down, DB unreachable) → redirect to /service-unavailable
  // - Normal auth errors (JWT expired, session not found after signOut) → proceed normally
  //
  // The tricky part: Supabase returns AuthSessionMissingError both when:
  // 1. User is genuinely not logged in (no cookie) → normal case
  // 2. DB is down and cannot validate an existing session → connection error
  //
  // Only treat genuine network errors as connection errors (fetch failed, ECONNREFUSED...).
  // We deliberately exclude cookie-based heuristics here: checking hasSessionCookie
  // caused a feedback loop — once a transient error set a cookie, every subsequent
  // request triggered connectionError and the user was stuck on /service-unavailable.
  const connectionError = isConnectionError(error);

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return { supabaseResponse, user, connectionError };
}

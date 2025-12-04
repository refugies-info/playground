import { createSupabaseServerClient } from "@playground/supabase";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES = ["/dashboard", "/documents", "/profile", "/account-linking"];

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = ["/login", "/signup", "/password-reset", "/callback"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createSupabaseServerClient({
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet: any[]) {
      cookiesToSet.forEach(({ name, value, options }) => {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      });
    },
  });

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // Handle root path "/"
  if (pathname === "/") {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing public auth route with session, redirect to dashboard
  // EXCEPT for password-reset (allow password reset even when authenticated)
  if (
    isPublicRoute &&
    user &&
    !pathname.startsWith("/password-reset")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};

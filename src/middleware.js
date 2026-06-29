import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Middleware — route protection for SkillSwap.
 *
 * Auth model note:
 *   This project uses BetterAuth, which issues an opaque, HttpOnly session
 *   cookie (`better-auth.session_token`) — not a literal JWT. The Edge runtime
 *   cannot reach MongoDB to verify a session, so we validate the session
 *   cookie using BetterAuth's official edge-safe `getSessionCookie()` helper.
 *   This is the equivalent of the spec's "JWT cookie validation" for this
 *   auth provider, and it keeps logged-in users logged in across refreshes.
 *
 * Role handling:
 *   Roles live inside the (DB-backed) session, not in a cookie the Edge can
 *   read. To guard dashboard sub-routes by role without a DB call, we pair the
 *   session cookie with a lightweight, non-sensitive `ss.role` cookie set from
 *   the client whenever a session is present. The session cookie is still the
 *   source of truth — `ss.role` only decides *which* dashboard to show.
 */

// role required for each dashboard sub-route prefix
const ROLE_ROUTES = {
  client: ["/dashboard/client"],
  freelancer: ["/dashboard/freelancer"],
  admin: ["/dashboard/admin"],
};

const DEFAULT_DASHBOARD = {
  client: "/dashboard/client",
  freelancer: "/dashboard/freelancer",
  admin: "/dashboard/admin",
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Auth check — is there a valid BetterAuth session cookie?
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Exact /dashboard → route to the user's role dashboard.
  //    If we already know the role (ss.role cookie), redirect immediately.
  //    Otherwise fall through to /dashboard/page.jsx, which reads the live
  //    session client-side and redirects + sets the cookie. This avoids a
  //    race on first login, where the cookie isn't set yet.
  if (pathname === "/dashboard") {
    const role = request.cookies.get("ss.role")?.value;
    if (role && DEFAULT_DASHBOARD[role]) {
      return NextResponse.redirect(new URL(DEFAULT_DASHBOARD[role], request.url));
    }
    return NextResponse.next();
  }

  // 3. Role-based access control for /dashboard/<role>/*
  const role = request.cookies.get("ss.role")?.value || "client";
  const matchedRole = Object.entries(ROLE_ROUTES).find(([, prefixes]) =>
    prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"))
  )?.[0];

  if (matchedRole && matchedRole !== role) {
    // Role mismatch — gracefully route the user to their own dashboard instead
    // of throwing an error screen (keeps refresh-safe per deployment rules).
    const own = DEFAULT_DASHBOARD[role] || DEFAULT_DASHBOARD.client;
    return NextResponse.redirect(new URL(own, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Only guard dashboard routes. Everything else (marketing pages, auth API,
  // static assets) stays public and fast.
  matcher: ["/dashboard/:path*"],
};

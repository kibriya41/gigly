"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2, AlertTriangle, ShieldX } from "lucide-react";

/**
 * RoleGuard — client-side authorization wrapper.
 *
 * Wraps any dashboard page to ensure the visitor is both authenticated AND
 * holds one of the allowed roles. The Edge middleware already blocks
 * unauthenticated / wrong-role traffic at the network layer (redirecting to
 * /login or the user's own dashboard). This guard is a second line of defense
 * that renders a clean "access denied" screen if the middleware is bypassed
 * (e.g. during the brief session-loading window, or if the role cookie drifts
 * from the real session).
 *
 * Props:
 *   allowedRoles: string[] — roles permitted to view the page (e.g. ["admin"])
 *   children: ReactNode     — the protected page content
 */
export default function RoleGuard({ allowedRoles = [], children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    // If logged in but wrong role, bounce to the user's own dashboard.
    if (session?.user && !allowedRoles.includes(session.user.role)) {
      const role = session.user.role || "client";
      const dest =
        role === "admin" ? "/dashboard/admin"
        : role === "freelancer" ? "/dashboard/freelancer"
        : "/dashboard/client";
      router.replace(dest);
    }
  }, [session, status, allowedRoles, router]);

  // Session still resolving — show a loader.
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
          <p className="text-[#5a7a72] font-semibold text-sm">Verifying access…</p>
        </div>
      </div>
    );
  }

  // Not signed in.
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
        <div className="bg-white p-8 rounded-3xl border border-[#d4ebe6]/50 shadow-md space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-[#1a3c34]">Access Denied</h2>
            <p className="text-[#5a7a72] text-[15px]">Please sign in to view this page.</p>
          </div>
          <Link href="/login" className="block w-full bg-[#1a3c34] hover:bg-[#255248] text-white py-3 rounded-xl font-medium transition-all shadow-sm">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Signed in but role not permitted.
  if (!allowedRoles.includes(session.user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-md space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldX className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-[#1a3c34]">403 — Forbidden</h2>
            <p className="text-[#5a7a72] text-[15px]">
              You don&apos;t have permission to access this area. This page is restricted to{" "}
              <span className="font-bold text-[#1a3c34] capitalize">{allowedRoles.join("/")}</span> accounts.
            </p>
          </div>
          <Link href="/" className="block w-full bg-[#1a3c34] hover:bg-[#255248] text-white py-3 rounded-xl font-medium transition-all shadow-sm">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Authorized — render the protected content.
  return <>{children}</>;
}

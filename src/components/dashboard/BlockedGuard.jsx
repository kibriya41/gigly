"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { isUserBlocked } from "@/lib/actions/users";
import { Loader2 } from "lucide-react";

/**
 * BlockedGuard — second line of defense against blocked accounts.
 *
 * The Edge middleware can't reach MongoDB, so it can't tell whether a
 * logged-in user has since been blocked by an admin. This guard closes that
 * gap: once the session resolves, it checks the backend (the source of truth
 * for `isBlocked`) and, if blocked, signs the user out and routes them to
 * /blocked. Used by the shared dashboard layout, so it covers every route
 * under /dashboard/*.
 *
 * Admins are exempt — they must always reach the admin dashboard to manage the
 * block list (the UI already prevents blocking admins anyway).
 *
 * State model (compiler-friendly): the verdict is stored as `{ email, verdict }`.
 * All setState calls happen inside the async `.then()` callback, never
 * synchronously in the effect body. Keying the verdict on `email` also makes
 * the guard correct if the signed-in user changes without a remount.
 */
export default function BlockedGuard({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [result, setResult] = useState(null); // { email, verdict: "ok" | "blocked" }

  const email = session?.user?.email || "";
  const isAdmin = (session?.user?.role || "").toLowerCase() === "admin";

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || !email || isAdmin) return;
    // Already verified for this exact email — don't re-check.
    if (result?.email === email) return;

    let cancelled = false;
    isUserBlocked(email).then((res) => {
      if (cancelled) return;
      const verdict = res.isBlocked ? "blocked" : "ok";
      setResult({ email, verdict });
      if (verdict === "blocked") {
        authClient.signOut({ fetchOptions: { onSuccess: () => router.refresh() } });
        router.replace("/blocked");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [session, status, email, isAdmin, result, router]);

  // Session resolving, or block status still pending for a non-admin user —
  // show a loader so a blocked user never sees protected content flash first.
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
          <p className="text-[#5a7a72] dark:text-[#9fb3c8] font-semibold text-sm">Checking access…</p>
        </div>
      </div>
    );
  }

  if (session?.user && email && !isAdmin && result?.email !== email) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
          <p className="text-[#5a7a72] dark:text-[#9fb3c8] font-semibold text-sm">Checking access…</p>
        </div>
      </div>
    );
  }

  if (result?.verdict === "blocked") {
    // Redirect in flight — render nothing while /blocked loads.
    return null;
  }

  return <>{children}</>;
}

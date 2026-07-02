"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

/**
 * /dashboard router.
 *
 * Handles the case where the Edge middleware can't yet determine the user's
 * role (e.g. first login before the `gigly.role` cookie is set). Reads the live
 * BetterAuth session here — where the DB is reachable — and redirects to the
 * correct role dashboard. The Navbar's role-sync effect keeps the cookie warm
 * afterwards so subsequent visits redirect straight from the middleware.
 */
const DEFAULT_DASHBOARD = {
  client: "/dashboard/client",
  freelancer: "/dashboard/freelancer",
  admin: "/dashboard/admin",
};

export default function DashboardRouterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
      return;
    }
    const role = session.user?.role || "client";
    // Navbar keeps gigly.role in sync; this redirect alone is enough.
    router.replace(DEFAULT_DASHBOARD[role] || DEFAULT_DASHBOARD.client);
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#2a9d8f]" />
        <p className="text-[#5a7a72] dark:text-[#9fb3c8] font-semibold text-sm">Loading your workspace…</p>
      </div>
    </div>
  );
}

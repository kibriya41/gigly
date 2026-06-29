"use client";

import Link from "next/link";
import { Ban, Mail, ArrowLeft } from "lucide-react";

/**
 * /blocked — landing page for accounts an admin has blocked.
 *
 * Shown when sign-in is refused because of a block, or when a BlockedGuard
 * catches an already-authenticated blocked user mid-session. Kept deliberately
 * static: no session lookup, no actions — just a clear explanation and a path
 * to contact support.
 */
export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9f6] via-[#f8fcfb] to-[#eaf5f2] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm border border-[#d4ebe6] shadow-xl shadow-red-500/5 rounded-3xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <Ban className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-bold text-[#1a3c34]">Account Blocked</h1>
            <p className="text-[#5a7a72] text-[15px] leading-relaxed">
              Your access to SkillSwap has been restricted by an administrator.
              You can no longer sign in or use the platform with this account.
            </p>
          </div>

          <div className="bg-[#f4f8f6] border border-[#d4ebe6]/60 rounded-2xl p-4 text-left">
            <p className="text-xs text-[#5a7a72] leading-relaxed">
              <span className="font-bold text-[#1a3c34]">Think this is a mistake?</span>
              <br />
              If you believe your account was blocked in error, please reach out
              to our support team and we&apos;ll review it as soon as possible.
            </p>
          </div>

          <a
            href="mailto:support@skillswap.example"
            className="flex items-center justify-center gap-2 w-full bg-[#1a3c34] hover:bg-[#255248] text-white py-3 rounded-xl font-medium transition-all shadow-sm"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full text-[#5a7a72] hover:text-[#1a3c34] py-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

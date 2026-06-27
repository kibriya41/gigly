"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronRight, Briefcase, User, Wallet, Loader2 } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const title = searchParams.get("title") || "Development Project";
  const freelancerName = searchParams.get("freelancerName") || "Professional Freelancer";
  const amount = searchParams.get("amount") || "0";

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white border border-[#d4ebe6]/50 rounded-3xl p-8 shadow-sm text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-[#1a3c34]">Payment Successful!</h2>
          <p className="text-xs text-[#5a7a72] max-w-xs mx-auto leading-relaxed">
            Your payment has been secure escrowed by SkillSwap. The freelancer has been notified and can begin working on the task.
          </p>
        </div>

        {/* Card Details */}
        <div className="bg-[#f4f8f6] border border-[#d4ebe6]/40 p-5 rounded-2xl text-left space-y-3.5">
          <div className="flex items-start gap-3">
            <Briefcase className="w-4 h-4 text-[#2a9d8f] shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] uppercase font-bold text-[#8aa89e] block leading-none">Task Hired</span>
              <span className="text-xs font-semibold text-[#1a3c34]">{title}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-[#2a9d8f] shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] uppercase font-bold text-[#8aa89e] block leading-none">Freelancer</span>
              <span className="text-xs font-semibold text-[#1a3c34]">{freelancerName}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Wallet className="w-4 h-4 text-[#2a9d8f] shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] uppercase font-bold text-[#8aa89e] block leading-none">Amount Hired (USD)</span>
              <span className="text-xs font-bold text-[#2a9d8f]">${amount} USD</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href="/dashboard/client"
          className="flex items-center justify-center gap-2 bg-[#1a3c34] hover:bg-[#255248] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm w-full hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          Go to Dashboard
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

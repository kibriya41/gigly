"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getTaskById, updateTask } from "@/lib/actions/tasks";
import { getProposals, updateProposalStatus } from "@/lib/actions/proposals";
import { createPayment } from "@/lib/actions/payments";
import {
  Loader2,
  CreditCard,
  Lock,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

function CheckoutFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  const proposalId = searchParams.get("proposalId");
  const taskId = searchParams.get("taskId");

  const [task, setTask] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);

  // Form states
  const [cardNum, setCardNum] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");
  const [cardName, setCardName] = useState("");

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      if (!proposalId || !taskId) {
        if (isMounted) {
          setError("Missing query parameters (proposalId/taskId).");
          setLoading(false);
        }
        return;
      }
      try {
        const taskRes = await getTaskById(taskId);
        const proposalsRes = await getProposals({ taskId });

        if (!isMounted) return;

        if (taskRes.success && proposalsRes.success) {
          setTask(taskRes.data);
          const foundProp = (proposalsRes.data || []).find((p) => p._id === proposalId);
          if (foundProp) {
            setProposal(foundProp);
          } else {
            setError("Proposal not found.");
          }
        } else {
          setError(taskRes.message || proposalsRes.message || "Failed to load details");
        }
      } catch (err) {
        if (isMounted) setError(err.message || "An unexpected error occurred");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [proposalId, taskId, session, sessionStatus, router]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!task || !proposal) return;

    setPaying(true);
    try {
      // 1. Update task status to In Progress
      const taskUpdateRes = await updateTask(taskId, {
        ...task,
        status: "In Progress",
      });

      if (!taskUpdateRes.success) {
        alert(taskUpdateRes.message || "Failed to update task status.");
        setPaying(false);
        return;
      }

      // 2. Update proposal status to accepted
      const propUpdateRes = await updateProposalStatus(proposalId, "accepted");
      if (propUpdateRes.success) {
        // 3. Record the payment transaction for Admin Transactions history
        await createPayment({
          taskId,
          taskTitle: task.title,
          proposalId,
          clientEmail: task.buyerEmail,
          clientName: session?.user?.name || task.buyerName || "",
          freelancerEmail: proposal.freelancerEmail,
          freelancerName: proposal.freelancerName,
          amount: proposal.amount,
          transactionId: `ss_${Date.now()}`,
          paymentStatus: "paid",
        });

        // Redirect to success page
        router.push(
          `/payment/success?taskId=${taskId}&proposalId=${proposalId}&amount=${proposal.amount}&title=${encodeURIComponent(
            task.title
          )}&freelancerName=${encodeURIComponent(proposal.freelancerName)}`
        );
      } else {
        alert(propUpdateRes.message || "Failed to update proposal status.");
      }
    } catch (err) {
      alert("An error occurred during payment processing.");
    } finally {
      setPaying(false);
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-[#1a3c34]">Checkout Error</h2>
        <p className="text-sm text-[#5a7a72]">{error}</p>
        <button
          onClick={() => router.push("/dashboard/client/proposals")}
          className="bg-[#1a3c34] text-white px-6 py-2 rounded-xl text-xs font-bold"
        >
          Back to Proposals
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Checkout Form */}
        <div className="lg:col-span-7 bg-white border border-[#d4ebe6]/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <Lock className="w-5 h-5 text-[#2a9d8f]" />
            <div>
              <h2 className="text-xl font-bold text-[#1a3c34]">Secure Payment</h2>
              <p className="text-xs text-[#8aa89e]">Powered by Stripe (Mock Integration)</p>
            </div>
          </div>

          <form onSubmit={handlePay} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#5a7a72] uppercase tracking-wider">
                Cardholder Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/10 rounded-xl text-sm outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#5a7a72] uppercase tracking-wider">
                Card Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                </span>
                <input
                  type="text"
                  required
                  value={cardNum}
                  onChange={(e) => setCardNum(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/10 rounded-xl text-sm outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#5a7a72] uppercase tracking-wider">
                  Expiration
                </label>
                <input
                  type="text"
                  required
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/10 rounded-xl text-sm outline-none transition-all font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#5a7a72] uppercase tracking-wider">
                  CVC / CVV
                </label>
                <input
                  type="text"
                  required
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/10 rounded-xl text-sm outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div className="bg-[#f0f9f6] border border-[#d4ebe6] p-4 rounded-2xl flex gap-3 text-xs text-[#5a7a72] leading-relaxed">
              <ShieldCheck className="w-5 h-5 text-[#2a9d8f] shrink-0 mt-0.5" />
              <p>
                Funds are held securely by SkillSwap and will only be released to the freelancer once you mark the task as completed.
              </p>
            </div>

            <button
              type="submit"
              disabled={paying}
              className="w-full bg-[#1a3c34] hover:bg-[#255248] disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {paying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  Pay ${proposal?.amount} USD
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 bg-[#f4f8f6] border border-[#d4ebe6]/50 rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="font-bold text-[#1a3c34] text-lg">Order Summary</h3>

          <div className="space-y-4 divide-y divide-[#d4ebe6]/40">
            <div className="space-y-1 pt-1">
              <span className="text-[10px] uppercase font-bold text-[#8aa89e]">Task Details</span>
              <h4 className="font-semibold text-sm text-[#1a3c34]">{task?.title}</h4>
              <span className="inline-block text-xs text-[#2a9d8f] font-semibold bg-[#eaf5f2] px-2 py-0.5 rounded-lg border border-[#d4ebe6]/40 mt-1">
                {task?.category}
              </span>
            </div>

            <div className="space-y-1 pt-4">
              <span className="text-[10px] uppercase font-bold text-[#8aa89e]">Freelancer</span>
              <p className="font-semibold text-sm text-[#1a3c34]">{proposal?.freelancerName}</p>
              <p className="text-xs text-[#5a7a72] italic line-clamp-2">
                &ldquo;{proposal?.pitch}&rdquo;
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between font-bold text-base text-[#1a3c34]">
              <span>Total Budget (USD)</span>
              <span className="text-xl text-[#2a9d8f]">${proposal?.amount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DummyCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
        </div>
      }
    >
      <CheckoutFormContent />
    </Suspense>
  );
}

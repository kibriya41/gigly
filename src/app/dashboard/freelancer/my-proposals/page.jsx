"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getProposals } from "@/lib/actions/proposals";
import {
  Loader2,
  Search,
  FileText,
  DollarSign,
  Clock,
  Calendar,
  Tag,
  ArrowUpDown,
  X,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  CircleDot,
  Plus,
  MessageSquare,
} from "lucide-react";

const PROPOSAL_STATUS = {
  accepted: { label: "Accepted", style: "text-[#2a9d8f] bg-[#eaf5f2] dark:bg-[#1a2435] border-[#d4ebe6] dark:border-[#1e293b]" },
  pending: { label: "Pending Review", style: "text-[#d97706] bg-[#fffbeb] border-[#fef3c7]" },
  declined: { label: "Declined", style: "text-red-600 bg-red-50 border-red-200" },
  rejected: { label: "Declined", style: "text-red-600 bg-red-50 border-red-200" },
};

export default function FreelancerProposalsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const user = session?.user;

  useEffect(() => {
    if (sessionStatus === "loading") return;
    let isMounted = true;

    const fetchMyProposals = async () => {
      if (!user?.email) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const res = await getProposals({ freelancerEmail: user.email });
        if (!isMounted) return;
        if (res.success) {
          setProposals(res.data || []);
        } else {
          setError(res.message || "Failed to fetch proposals");
        }
      } catch (err) {
        if (isMounted) setError(err.message || "An unexpected error occurred");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMyProposals();
    return () => { isMounted = false; };
  }, [user, sessionStatus]);

  const filteredProposals = proposals
    .filter(p => {
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (
        (p.taskTitle || "").toLowerCase().includes(s) ||
        (p.taskCategory || "").toLowerCase().includes(s) ||
        (p.pitch || "").toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      if (sortBy === "amount-desc") return Number(b.amount || 0) - Number(a.amount || 0);
      if (sortBy === "amount-asc") return Number(a.amount || 0) - Number(b.amount || 0);
      if (sortBy === "days-asc") return Number(a.days || 0) - Number(b.days || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const totalBidValue = proposals.reduce((s, p) => s + Number(p.amount || 0), 0);
  const acceptedCount = proposals.filter(p => p.status === "accepted").length;
  const pendingCount = proposals.filter(p => p.status === "pending").length;

  const stats = [
    { title: "Total Proposals", value: proposals.length, icon: FileText, iconBg: "bg-[#eaf5f2] dark:bg-[#1a2435]", iconColor: "text-[#2a9d8f]" },
    { title: "Accepted", value: acceptedCount, icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { title: "Pending Review", value: pendingCount, icon: CircleDot, iconBg: "bg-[#fffbeb]", iconColor: "text-[#d97706]" },
    {
      title: "Total Bid Value",
      value: `$${totalBidValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      iconBg: "bg-[#e2f1ed] dark:bg-[#1a2435]",
      iconColor: "text-[#1a3c34] dark:text-[#e8f4f0]",
      cardBg: "bg-[#f0f7f4] dark:bg-[#1a2435]",
    },
  ];

  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
        <div className="bg-white dark:bg-[#131c2b] p-8 rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/50 shadow-md space-y-6">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-[#1a3c34] dark:text-[#e8f4f0]">Access Denied</h2>
          <Link href="/login" className="block w-full bg-[#1a3c34] text-white py-3 rounded-xl font-medium text-center">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] dark:text-[#e8f4f0] tracking-tight">My Proposals</h1>
          <p className="text-[#5a7a72] dark:text-[#9fb3c8] mt-1.5 text-[15px]">
            Track all the bids and proposals you&apos;ve submitted across tasks.
          </p>
        </div>
        <Link
          href="/tasks"
          className="flex items-center justify-center gap-2 bg-[#1a3c34] hover:bg-[#255248] text-white px-5 py-3 rounded-full font-medium transition-all shadow-sm hover:shadow-md cursor-pointer w-fit self-start md:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <Search size={18} />
          <span>Find More Gigs</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`p-6 rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/50 shadow-sm flex flex-col justify-between h-[140px] transition-all hover:shadow-md ${stat.cardBg || "bg-white dark:bg-[#131c2b]"}`}
            >
              <div className={`p-2.5 rounded-xl w-fit ${stat.iconBg} ${stat.iconColor}`}>
                <Icon size={20} />
              </div>
              <div className="space-y-1 mt-4">
                <span className="text-xs font-semibold text-[#8aa89e] dark:text-[#6b7e94] uppercase tracking-wider">{stat.title}</span>
                <p className="text-2xl font-semibold text-[#1a3c34] dark:text-[#e8f4f0]">
                  {loading ? <span className="inline-block w-12 h-5 bg-gray-100 animate-pulse rounded" /> : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#131c2b] p-6 rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#8aa89e] dark:text-[#6b7e94]" />
          <input
            type="text"
            placeholder="Search by task title, category, or pitch..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-10 py-3 border border-gray-200 focus:border-[#2c7c74] focus:ring-2 focus:ring-[#2c7c74]/10 rounded-2xl text-sm outline-none transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-3.5">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-[#f4f8f6] dark:bg-[#1a2435] px-3.5 py-2.5 rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/60 text-xs text-[#5a7a72] dark:text-[#9fb3c8] font-semibold">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#2a9d8f]" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-transparent outline-none cursor-pointer text-[#1a3c34] dark:text-[#e8f4f0] font-bold"
          >
            <option value="newest">Newest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
            <option value="days-asc">Delivery: Fastest</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2a9d8f]" />
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="bg-white dark:bg-[#131c2b] rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 bg-[#eaf5f2] dark:bg-[#1a2435] text-[#2a9d8f] rounded-2xl flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1a3c34] dark:text-[#e8f4f0]">No Proposals Found</h3>
            <p className="text-[#8aa89e] dark:text-[#6b7e94] text-sm mt-1.5">
              {searchTerm ? "No proposals match your search." : "You haven't submitted any proposals yet."}
            </p>
          </div>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 bg-[#2a9d8f] hover:bg-[#238478] text-white px-6 py-3 rounded-full font-medium transition-all shadow-sm"
          >
            <Plus size={16} /> Browse Open Gigs
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredProposals.map((proposal, i) => {
            const statusInfo = PROPOSAL_STATUS[proposal.status] || PROPOSAL_STATUS["pending"];
            return (
              <div
                key={proposal._id || i}
                className="bg-white dark:bg-[#131c2b] rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 p-6 md:p-8 hover:shadow-md hover:border-[#2a9d8f]/30 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusInfo.style}`}>
                        {statusInfo.label}
                      </span>
                      {proposal.taskCategory && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#eaf5f2] dark:bg-[#1a2435] text-[#2a9d8f] px-2.5 py-1 rounded-lg">
                          <Tag className="w-3 h-3" /> {proposal.taskCategory}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/tasks/${proposal.taskId}`}
                      className="font-bold text-lg text-[#1a3c34] dark:text-[#e8f4f0] hover:text-[#2a9d8f] hover:underline transition-colors block"
                    >
                      {proposal.taskTitle || "Task"}
                    </Link>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-2xl font-extrabold text-[#2a9d8f]">
                      ${Number(proposal.amount || 0).toLocaleString()} USD
                    </span>
                    <span className="text-xs text-[#8aa89e] dark:text-[#6b7e94] font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2a9d8f]" />
                      {proposal.days} day{proposal.days !== 1 ? "s" : ""} delivery
                    </span>
                  </div>
                </div>

                {proposal.pitch && (
                  <div className="mt-5 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-[#8aa89e] dark:text-[#6b7e94] tracking-wider block mb-1">Your Pitch</span>
                    <p className="text-sm text-[#5a7a72] dark:text-[#9fb3c8] leading-relaxed italic">&ldquo;{proposal.pitch}&rdquo;</p>
                  </div>
                )}

                {/* Client comment visible to freelancer when declined */}
                {(proposal.status === "rejected" || proposal.status === "declined") && proposal.clientComment && (
                  <div className="mt-3 bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3">
                    <MessageSquare className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider block mb-1">Client&rsquo;s Note</span>
                      <p className="text-sm text-red-700 leading-relaxed italic">&ldquo;{proposal.clientComment}&rdquo;</p>
                    </div>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-[#8aa89e] dark:text-[#6b7e94] font-medium">
                    <Calendar className="w-4 h-4 text-[#2a9d8f]" />
                    <span>Submitted: <span className="text-[#1a3c34] dark:text-[#e8f4f0] font-bold">
                      {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : "Recently"}
                    </span></span>
                  </div>
                  <Link
                    href={`/tasks/${proposal.taskId}`}
                    className="flex items-center gap-2 bg-[#f4f8f6] dark:bg-[#1a2435] hover:bg-[#eaf5f2] dark:bg-[#1a2435] border border-[#d4ebe6] dark:border-[#1e293b] text-[#1a3c34] dark:text-[#e8f4f0] px-4 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#2a9d8f]" />
                    View Task
                  </Link>
                </div>
              </div>
            );
          })}

          <div className="bg-[#f4f8f6] dark:bg-[#1a2435] rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/60 px-6 py-4 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-bold text-[#5a7a72] dark:text-[#9fb3c8]">
              Showing {filteredProposals.length} of {proposals.length} proposal{proposals.length !== 1 ? "s" : ""}
            </span>
            <span className="text-sm font-extrabold text-[#1a3c34] dark:text-[#e8f4f0]">
              <span className="text-[#8aa89e] dark:text-[#6b7e94] font-semibold text-xs mr-1">Bid Total:</span>
              ${filteredProposals.reduce((s, p) => s + Number(p.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

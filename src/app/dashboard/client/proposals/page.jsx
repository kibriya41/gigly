"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getTasks, updateTask } from "@/lib/actions/tasks";
import { getProposals, updateProposalStatus, deleteProposal } from "@/lib/actions/proposals";
import {
  Loader2,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  X,
  MessageSquare,
  AlertTriangle,
  DollarSign,
  Calendar,
  Tag,
  Briefcase,
  Clock,
  Send,
  Plus,
  ThumbsDown,
  Award,
  RefreshCw
} from "lucide-react";

export default function ClientProposalsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Proposals from MongoDB
  const [proposals, setProposals] = useState([]);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [taskFilter, setTaskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Contact modal
  const [contactFreelancer, setContactFreelancer] = useState(null);
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Decline modal
  const [declineTarget, setDeclineTarget] = useState(null); // proposal to decline
  const [declineComment, setDeclineComment] = useState("");
  const [isDeclining, setIsDeclining] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Fetch client tasks + proposals from server ──────────────────────────
  const fetchClientData = useCallback(async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch tasks owned by this client
      const tasksRes = await getTasks(session.user.email);
      if (!tasksRes.success) {
        setError(tasksRes.message || "Failed to fetch tasks");
        return;
      }
      const clientTasks = tasksRes.data || [];
      setTasks(clientTasks);

      // 2. Fetch all proposals for this client's tasks from server
      const proposalsRes = await getProposals({ clientEmail: session.user.email });
      if (proposalsRes.success) {
        // Enrich proposals with task info
        const taskMap = {};
        clientTasks.forEach(t => { taskMap[t._id] = t; });

        const enriched = (proposalsRes.data || []).map(p => {
          const task = taskMap[p.taskId] || {};
          return {
            ...p,
            taskTitle: p.taskTitle || task.title || "Unknown Task",
            taskStatus: task.status || p.taskStatus || "Open",
            taskCategory: p.taskCategory || task.category || "",
            name: p.freelancerName || "Anonymous",
            initials: p.freelancerName
              ? p.freelancerName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
              : "FL",
          };
        });
        setProposals(enriched);
      } else {
        setError(proposalsRes.message || "Failed to fetch proposals");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (sessionStatus !== "loading") {
      fetchClientData();
    }
  }, [session, sessionStatus, fetchClientData]);

  // ─── Accept Proposal ─────────────────────────────────────────────────────
  const handleAcceptProposal = async (proposal) => {
    const alreadyAccepted = proposals.some(
      p => p.taskId === proposal.taskId && p.status === "accepted"
    );
    if (alreadyAccepted) {
      showToast("A proposal for this task is already accepted.", "error");
      return;
    }
    if (!confirm(`Accept ${proposal.name}'s proposal of $${proposal.amount} for "${proposal.taskTitle}"?`)) return;

    // Redirect to dummy stripe checkout page
    router.push(`/payment/checkout?proposalId=${proposal._id}&taskId=${proposal.taskId}`);
  };

  // ─── Decline Proposal ────────────────────────────────────────────────────
  const handleDeclineProposal = (proposal) => {
    setDeclineTarget(proposal);
    setDeclineComment("");
  };

  const handleConfirmDecline = async () => {
    if (!declineTarget) return;
    setIsDeclining(true);
    try {
      const comment = declineComment.trim() || undefined;
      const res = await updateProposalStatus(declineTarget._id, "rejected", comment);
      if (res.success) {
        setProposals(prev =>
          prev.map(p =>
            p._id === declineTarget._id
              ? { ...p, status: "rejected", clientComment: comment }
              : p
          )
        );
        showToast("Proposal declined.");
        setDeclineTarget(null);
      } else {
        showToast(res.message || "Failed to decline proposal", "error");
      }
    } catch {
      showToast("Error declining proposal", "error");
    } finally {
      setIsDeclining(false);
    }
  };

  // ─── Contact Modal ────────────────────────────────────────────────────────
  const handleContactClick = (proposal) => {
    setContactFreelancer(proposal);
    setContactMessage(
      `Hi ${proposal.name},\n\nI reviewed your proposal for "${proposal.taskTitle}" and I'm interested in discussing further details. Let me know when you're available.`
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setIsSendingMessage(true);
    await new Promise(r => setTimeout(r, 800));
    setIsSendingMessage(false);
    showToast(`Message sent to ${contactFreelancer.name}!`);
    setContactFreelancer(null);
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalCount = proposals.length;
  const pendingCount = proposals.filter(p => p.status === "pending").length;
  const acceptedCount = proposals.filter(p => p.status === "accepted").length;
  const avgBid = totalCount > 0
    ? proposals.reduce((s, p) => s + (Number(p.amount) || 0), 0) / totalCount
    : 0;

  const stats = [
    { title: "Total Proposals", value: totalCount, icon: Briefcase, iconBg: "bg-[#eaf5f2]", iconColor: "text-[#2a9d8f]", cardBg: "bg-white" },
    { title: "Pending Review", value: pendingCount, icon: Clock, iconBg: "bg-[#fffbeb]", iconColor: "text-[#d97706]", cardBg: "bg-white" },
    { title: "Accepted", value: acceptedCount, icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", cardBg: "bg-white" },
    { title: "Avg. Bid Value", value: totalCount > 0 ? `$${Math.round(avgBid).toLocaleString()}` : "$0", icon: DollarSign, iconBg: "bg-[#e2f1ed]", iconColor: "text-[#1a3c34]", cardBg: "bg-[#f0f7f4]" },
  ];

  // ─── Filter & Sort ─────────────────────────────────────────────────────────
  const filteredProposals = proposals
    .filter(p => {
      const search = searchTerm.toLowerCase();
      const matchSearch = !searchTerm ||
        p.name.toLowerCase().includes(search) ||
        (p.pitch || "").toLowerCase().includes(search) ||
        p.taskTitle.toLowerCase().includes(search);
      const matchTask = taskFilter === "All" || p.taskId === taskFilter;
      const matchStatus = statusFilter === "All" || p.status === statusFilter.toLowerCase();
      return matchSearch && matchTask && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "price-desc") return Number(b.amount || 0) - Number(a.amount || 0);
      if (sortBy === "price-asc") return Number(a.amount || 0) - Number(b.amount || 0);
      if (sortBy === "days-asc") return Number(a.days || 0) - Number(b.days || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  // ─── Guards ───────────────────────────────────────────────────────────────
  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
          <p className="text-[#5a7a72] font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
        <div className="bg-white p-8 rounded-3xl border border-[#d4ebe6]/50 shadow-md space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1a3c34]">Access Denied</h2>
          <p className="text-[#5a7a72] text-[15px]">Please sign in to manage proposals.</p>
          <Link href="/login" className="block w-full bg-[#1a3c34] hover:bg-[#255248] text-white py-3 rounded-xl font-medium transition-all">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const taskStatusStyle = status =>
    status?.toLowerCase() === "open"
      ? "text-[#d97706] bg-[#fffbeb] border-[#fef3c7]"
      : "text-[#2a9d8f] bg-[#eaf5f2] border-[#d4ebe6]";

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16 relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl shadow-xl border animate-in fade-in slide-in-from-bottom-5 duration-300
          ${toast.type === "error" ? "bg-red-50 text-red-800 border-red-200" : "bg-[#eaf5f2] text-[#1a3c34] border-[#d4ebe6]"}`}>
          {toast.type === "error"
            ? <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            : <CheckCircle2 className="w-5 h-5 text-[#2a9d8f] shrink-0" />}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] tracking-tight">Manage Proposals</h1>
          <p className="text-[#5a7a72] mt-1.5 text-[15px]">
            Review, evaluate, accept or decline proposals submitted by freelancers for your tasks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchClientData}
            disabled={loading}
            className="flex items-center gap-2 bg-[#f4f8f6] hover:bg-[#eaf5f2] border border-[#d4ebe6] text-[#1a3c34] px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/dashboard/client/post-task"
            className="flex items-center justify-center gap-2 bg-[#1a3c34] hover:bg-[#255248] text-white px-5 py-3 rounded-full font-medium transition-all shadow-sm hover:shadow-md cursor-pointer w-fit hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>Post a Task</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`p-6 rounded-2xl border border-[#d4ebe6]/50 shadow-sm flex flex-col justify-between h-[150px] transition-all hover:shadow-md ${stat.cardBg}`}>
              <div className={`p-2.5 rounded-xl w-fit ${stat.iconBg} ${stat.iconColor}`}>
                <Icon size={20} />
              </div>
              <div className="space-y-1 mt-4">
                <span className="text-xs font-semibold text-[#8aa89e] uppercase tracking-wider">{stat.title}</span>
                <p className="text-3xl font-semibold text-[#1a3c34]">
                  {loading ? <span className="inline-block w-12 h-6 bg-gray-100 animate-pulse rounded" /> : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-[#d4ebe6]/40 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#8aa89e]" />
          <input
            type="text"
            placeholder="Search by freelancer, pitch or task..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-10 py-3 border border-gray-200 focus:border-[#2c7c74] focus:ring-2 focus:ring-[#2c7c74]/10 rounded-2xl text-sm outline-none transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-3.5 p-0.5 hover:bg-gray-100 rounded-full">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#f4f8f6] px-3.5 py-2.5 rounded-2xl border border-[#d4ebe6]/60 text-xs text-[#5a7a72] font-semibold">
            <Filter className="w-3.5 h-3.5 text-[#2a9d8f] shrink-0" />
            <select
              value={taskFilter}
              onChange={e => setTaskFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-[#1a3c34] font-bold max-w-[140px]"
            >
              <option value="All">All Tasks</option>
              {tasks.map(task => (
                <option key={task._id} value={task._id}>{task.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#f4f8f6] px-3.5 py-2.5 rounded-2xl border border-[#d4ebe6]/60 text-xs text-[#5a7a72] font-semibold">
            <Award className="w-3.5 h-3.5 text-[#2a9d8f]" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-[#1a3c34] font-bold"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#f4f8f6] px-3.5 py-2.5 rounded-2xl border border-[#d4ebe6]/60 text-xs text-[#5a7a72] font-semibold">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#2a9d8f]" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-[#1a3c34] font-bold"
            >
              <option value="newest">Newest First</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="days-asc">Timeframe: Fastest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#2a9d8f]" />
            <p className="text-[#8aa89e] text-sm font-medium">Fetching proposals...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold text-red-800">Unable to load proposals</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={fetchClientData} className="px-5 py-2 bg-red-600 text-white text-xs font-medium rounded-xl hover:bg-red-700 transition-colors">
            Try Again
          </button>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 bg-[#eaf5f2] text-[#2a9d8f] rounded-2xl flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1a3c34]">No Proposals Found</h3>
            <p className="text-[#8aa89e] text-sm mt-1.5 px-4">
              {searchTerm || taskFilter !== "All" || statusFilter !== "All"
                ? "No proposals match your current filters."
                : proposals.length === 0
                ? "No freelancers have applied to your tasks yet. Share your task listings to attract bids!"
                : "No proposals match the selected filters."}
            </p>
          </div>
          {(searchTerm || taskFilter !== "All" || statusFilter !== "All") && (
            <button
              onClick={() => { setSearchTerm(""); setTaskFilter("All"); setStatusFilter("All"); }}
              className="px-5 py-2.5 bg-[#f4f8f6] hover:bg-[#eaf5f2] border border-[#d4ebe6] text-[#1a3c34] font-semibold text-xs rounded-xl transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredProposals.map((proposal, i) => {
            const taskStatus = proposal.taskStatus || "Open";
            const isAccepted = proposal.status === "accepted";
            const isRejected = proposal.status === "rejected";
            const hasAcceptedForTask = proposals.some(p => p.taskId === proposal.taskId && p.status === "accepted");
            const canAccept = !isAccepted && !isRejected && !hasAcceptedForTask;
            const canDecline = !isAccepted && !isRejected;

            return (
              <div
                key={proposal._id || i}
                className={`bg-white rounded-3xl border p-6 md:p-8 hover:shadow-md transition-all relative overflow-hidden
                  ${isAccepted ? "border-emerald-200 bg-emerald-50/30" : isRejected ? "border-red-200 bg-red-50/30" : "border-[#d4ebe6]/40 hover:border-[#2a9d8f]/30"}`}
              >
                {/* Accepted badge */}
                {isAccepted && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold text-emerald-700 bg-emerald-100 border-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      Accepted
                    </span>
                  </div>
                )}

                {/* Rejected badge */}
                {isRejected && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold text-red-700 bg-red-100 border-red-300">
                      <XCircle className="w-3 h-3" />
                      Declined
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border
                      ${isAccepted ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-[#f5ebe6] text-[#7c5e4d] border-teal-100"}`}>
                      {proposal.initials}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#1a3c34] text-lg">{proposal.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Link href={`/tasks/${proposal.taskId}`} className="text-[#2a9d8f] font-semibold hover:underline flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {proposal.taskTitle}
                        </Link>
                        <span className="text-gray-300">•</span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${taskStatusStyle(taskStatus)}`}>
                          Task: {taskStatus}
                        </span>
                        {proposal.taskCategory && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#eaf5f2] text-[#2a9d8f] px-2 py-0.5 rounded-lg">
                              <Tag className="w-3 h-3" />
                              {proposal.taskCategory}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-2xl font-extrabold text-[#2a9d8f]">
                      ${Number(proposal.amount || 0).toLocaleString()} USD
                    </span>
                    <span className="text-xs text-[#8aa89e] font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2a9d8f]" />
                      {proposal.days} Day{proposal.days !== 1 ? "s" : ""} Delivery
                    </span>
                  </div>
                </div>

                {/* Pitch */}
                <div className="mt-5 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-[#8aa89e] tracking-wider block mb-1">Freelancer Pitch</span>
                  <p className="text-sm text-[#5a7a72] leading-relaxed italic">
                    &ldquo;{proposal.pitch}&rdquo;
                  </p>
                </div>

                {/* Client comment on decline */}
                {isRejected && proposal.clientComment && (
                  <div className="mt-3 bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3">
                    <MessageSquare className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider block mb-1">Your Decline Reason</span>
                      <p className="text-sm text-red-700 leading-relaxed italic">&ldquo;{proposal.clientComment}&rdquo;</p>
                    </div>
                  </div>
                )}

                {/* Footer / Actions */}
                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-[#8aa89e] font-medium">
                    <Calendar className="w-4 h-4 text-[#2a9d8f]" />
                    <span>Submitted:</span>
                    <span className="text-[#1a3c34] font-bold">
                      {proposal.createdAt
                        ? new Date(proposal.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                        : "Recently"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleContactClick(proposal)}
                      className="flex items-center gap-2 bg-[#f4f8f6] hover:bg-[#eaf5f2] border border-[#d4ebe6] text-[#1a3c34] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#2a9d8f]" />
                      <span>Contact</span>
                    </button>

                    {canDecline && (
                      <button
                        onClick={() => handleDeclineProposal(proposal)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-[#5a7a72] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    )}

                    {canAccept && (
                      <button
                        onClick={() => handleAcceptProposal(proposal)}
                        className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#2a9d8f]/10 text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white transition-all cursor-pointer border border-[#2a9d8f]/30"
                      >
                        Accept Bid
                      </button>
                    )}

                    {!isAccepted && hasAcceptedForTask && (
                      <span className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-400 border border-gray-200 cursor-not-allowed">
                        Task Awarded
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary footer */}
          <div className="bg-[#f4f8f6] rounded-2xl border border-[#d4ebe6]/60 px-6 py-4 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-bold text-[#5a7a72]">
              Showing {filteredProposals.length} of {proposals.length} proposal{proposals.length !== 1 ? "s" : ""}
            </span>
            <span className="text-sm font-extrabold text-[#1a3c34]">
              <span className="text-[#8aa89e] font-semibold text-xs mr-1">Total Bid Value:</span>
              ${filteredProposals.reduce((s, p) => s + Number(p.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </span>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactFreelancer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#d4ebe6]/50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-[#d4ebe6]/30 flex items-center justify-between bg-[#f4f8f6]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#eaf5f2] flex items-center justify-center text-[#2a9d8f]">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a3c34]">Contact Freelancer</h3>
                  <p className="text-[10px] text-[#8aa89e] mt-0.5">Send a message to {contactFreelancer.name}</p>
                </div>
              </div>
              <button onClick={() => setContactFreelancer(null)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8aa89e] uppercase tracking-wider mb-2">Message</label>
                <textarea
                  required
                  rows={6}
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c7c74] text-sm outline-none resize-none leading-relaxed text-[#5a7a72]"
                  placeholder="Type your message here..."
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setContactFreelancer(null)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#5a7a72] hover:bg-gray-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSendingMessage} className="px-6 py-2.5 rounded-xl bg-[#1a3c34] hover:bg-[#255248] text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 cursor-pointer">
                  {isSendingMessage ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
                  ) : (
                    <><Send className="w-3.5 h-3.5" />Send Message</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {declineTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-red-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-red-50 flex items-center justify-between bg-red-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-500">
                  <ThumbsDown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a3c34]">Decline Proposal</h3>
                  <p className="text-[10px] text-[#8aa89e] mt-0.5">From {declineTarget.name} · {declineTarget.taskTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setDeclineTarget(null)}
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-[#5a7a72]">
                Are you sure you want to decline this proposal? You can optionally leave a comment for the freelancer explaining your decision.
              </p>
              <div>
                <label className="block text-xs font-semibold text-[#8aa89e] uppercase tracking-wider mb-2">
                  Decline Reason <span className="normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={declineComment}
                  onChange={e => setDeclineComment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-100 text-sm outline-none resize-none leading-relaxed text-[#5a7a72] transition-all"
                  placeholder="e.g. Budget doesn't match our current needs, looking for a different skill set..."
                />
              </div>
              <div className="pt-1 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeclineTarget(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#5a7a72] hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDecline}
                  disabled={isDeclining}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isDeclining ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Declining...</>
                  ) : (
                    <><ThumbsDown className="w-3.5 h-3.5" />Confirm Decline</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

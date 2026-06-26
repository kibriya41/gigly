"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getTaskById } from "@/lib/actions/tasks";
import { createProposal, getProposals } from "@/lib/actions/proposals";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Tag,
  Briefcase,
  User,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  Loader2,
  TrendingUp,
  Award,
  ChevronRight,
  Send,
  Sparkles,
  UserCheck
} from "lucide-react";

// Color definitions matching the project style
const THEME = {
  primary: "#1a3c34",
  primaryHover: "#255248",
  accent: "#2a9d8f",
  accentHover: "#238478",
  lightAccent: "#eaf5f2",
  bg: "#f4f8f6",
  cardBg: "#ffffff",
  textPrimary: "#1a3c34",
  textSecondary: "#5a7a72",
  textMuted: "#8aa89e",
  border: "#d4ebe6",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
  shadowHover: "0 4px 12px rgba(44,124,116,0.08)",
  error: "#dc2626",
  success: "#2a9d8f"
};

export default function TaskDetailPage({ params }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  
  // Unwrap parameters
  const resolvedParams = React.use(params);
  const taskId = resolvedParams.id;

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bid form states
  const [bidAmount, setBidAmount] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [proposalPitch, setProposalPitch] = useState("");
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [bidError, setBidError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [alreadyBid, setAlreadyBid] = useState(false);

  // Proposals fetched from server
  const [existingBids, setExistingBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);

  // Load task detail
  useEffect(() => {
    if (!taskId) return;
    const fetchTask = async () => {
      setLoading(true);
      try {
        const res = await getTaskById(taskId);
        if (res.success) {
          setTask(res.data);
          // Set default bid amount to task budget
          if (res.data?.budget) {
            setBidAmount(res.data.budget.toString());
          }
        } else {
          setError(res.message || "Failed to load task details");
        }
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  // Load existing proposals from MongoDB
  const fetchProposals = async () => {
    if (!taskId) return;
    setBidsLoading(true);
    try {
      const res = await getProposals({ taskId });
      if (res.success) {
        const bids = res.data || [];
        setExistingBids(bids);
        // Check if current user already submitted a proposal
        if (session?.user?.email) {
          const mine = bids.find(b => b.freelancerEmail === session.user.email);
          setAlreadyBid(!!mine);
        }
      }
    } catch (e) {
      console.error("Failed to load proposals", e);
    } finally {
      setBidsLoading(false);
    }
  };

  useEffect(() => {
    if (!taskId) return;
    fetchProposals();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, session]);

  // Validate Bid
  const validateForm = () => {
    const errors = {};
    if (!bidAmount || Number(bidAmount) <= 0) {
      errors.amount = "Bid amount must be greater than 0";
    }
    if (!deliveryDays || Number(deliveryDays) <= 0) {
      errors.days = "Delivery timeframe is required";
    }
    if (!proposalPitch.trim() || proposalPitch.length < 20) {
      errors.pitch = "Proposal pitch must be at least 20 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit proposal bid
  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmittingBid(true);
    setBidError("");

    const newBid = {
      taskId,
      taskTitle: task?.title || "",
      taskBudget: task?.budget || 0,
      taskCategory: task?.category || "",
      clientEmail: task?.buyerEmail || "",
      freelancerName: session?.user?.name || "Anonymous Freelancer",
      freelancerEmail: session?.user?.email || "",
      freelancerImage: session?.user?.image || "",
      amount: Number(bidAmount),
      days: Number(deliveryDays),
      pitch: proposalPitch,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await createProposal(newBid);
      if (res.success) {
        setExistingBids(prev => [newBid, ...prev]);
        setAlreadyBid(true);
        setBidSuccess(true);
        setProposalPitch("");
        setDeliveryDays("");
        // Refresh proposals list from server
        fetchProposals();
      } else {
        setBidError(res.message || "Failed to submit proposal. Please try again.");
      }
    } catch (err) {
      setBidError("An error occurred. Please try again.");
    }

    setIsSubmittingBid(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]" style={{ backgroundColor: THEME.bg }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#2a9d8f]" />
          <p className="text-[#5a7a72] font-semibold text-sm">Fetching task details...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" style={{ backgroundColor: THEME.bg }}>
        <div className="bg-white p-8 rounded-3xl border border-[#d4ebe6]/50 shadow-md max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-[#1a3c34]">Task Not Found</h2>
            <p className="text-[#5a7a72] text-[15px] leading-relaxed">
              {error || "The task you are looking for might have been removed, completed, or does not exist."}
            </p>
          </div>
          <Link
            href="/tasks"
            className="flex items-center justify-center gap-2 bg-[#1a3c34] hover:bg-[#255248] text-white py-3 rounded-xl font-bold transition-all shadow-sm w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse Gigs
          </Link>
        </div>
      </div>
    );
  }

  const isClient = session?.user?.role === "client";
  const isOwner = session?.user?.email === task.buyerEmail;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: THEME.bg }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center justify-between">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5a7a72] hover:text-[#1a3c34] transition-colors bg-white px-4 py-2.5 rounded-xl border border-[#d4ebe6]/40 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-[#2a9d8f]" />
            Back to Browse Gigs
          </Link>

          {isOwner && (
            <Link
              href="/dashboard/client/my-tasks"
              className="text-xs font-bold text-[#2a9d8f] hover:underline"
            >
              Manage in Dashboard &rarr;
            </Link>
          )}
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Task Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Header Information */}
            <div className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#2a9d8f]" />

              <div className="space-y-4">
                {/* Meta details */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#eaf5f2] text-[#2a9d8f] border border-[#d4ebe6]/50">
                    <Tag className="w-3 h-3" />
                    {task.category || "General"}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full border text-[#d97706] bg-[#fffbeb] border-[#fef3c7]">
                    {task.status || "Open"}
                  </span>
                  <span className="text-xs text-[#8aa89e] ml-auto font-medium">
                    Posted on: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "Recently"}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[#1a3c34] leading-tight">
                  {task.title}
                </h1>

                {/* Quick Stats bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-gray-100">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#8aa89e] tracking-wider block">Estimated Budget</span>
                    <span className="text-lg font-extrabold text-[#1a3c34] flex items-center gap-1">
                      <DollarSign className="w-4.5 h-4.5 text-[#2a9d8f]" />
                      {Number(task.budget || 0).toLocaleString()} USD
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#8aa89e] tracking-wider block">Delivery Deadline</span>
                    <span className="text-sm font-bold text-[#1a3c34] flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-4 h-4 text-[#2a9d8f]" />
                      {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, {
                        month: "short", day: "numeric", year: "numeric"
                      }) : "Flexible"}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#8aa89e] tracking-wider block">Total Bids/Proposals</span>
                    <span className="text-sm font-bold text-[#1a3c34] flex items-center gap-1.5 mt-0.5">
                      <TrendingUp className="w-4 h-4 text-[#2a9d8f]" />
                      {existingBids.length} Proposals
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1a3c34] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-[#2a9d8f]" />
                  Project Description
                </h3>
                <p className="text-sm text-[#5a7a72] leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>

              {/* Skills Tags */}
              {task.skills && task.skills.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-[#1a3c34] uppercase tracking-wider">
                    Skills Required
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-[#f4f8f6] hover:bg-[#eaf5f2] px-3.5 py-1.5 rounded-xl text-[#5a7a72] border border-gray-200/80 font-medium transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Poster Details / Client Card */}
            <div className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[#1a3c34] uppercase tracking-wider">
                About the Client
              </h3>
              <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                {task.buyerImage ? (
                  <img
                    src={task.buyerImage}
                    alt={task.buyerName}
                    className="w-14 h-14 rounded-full border border-[#d4ebe6] object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#eaf5f2] text-[#2a9d8f] flex items-center justify-center border border-[#d4ebe6]">
                    <User className="w-7 h-7" />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#1a3c34]">{task.buyerName || "Anonymous Client"}</h4>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                      <UserCheck className="w-3 h-3" /> Verified Client
                    </span>
                  </div>
                  <p className="text-xs text-[#8aa89e]">{task.buyerEmail}</p>
                </div>
              </div>
            </div>

            {/* Current Proposals/Bids Panel */}
            <div className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#1a3c34]">Active Proposals ({existingBids.length})</h3>
                <p className="text-[#8aa89e] text-xs mt-0.5">Proposals submitted by freelancers for this gig.</p>
              </div>

              {bidsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#2a9d8f]" />
                </div>
              ) : existingBids.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#d4ebe6] rounded-2xl">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-[#8aa89e]">No proposals placed yet. Be the first to place a bid!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {existingBids.map((bid, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl border border-[#d4ebe6]/60 hover:bg-[#f0f9f6]/20 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#f4f8f6] flex items-center justify-center font-bold text-xs text-[#2a9d8f] border border-teal-100">
                            {bid.freelancerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-[#1a3c34]">{bid.freelancerName}</h5>
                            <span className="text-[9px] text-[#8aa89e]">
                              {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString() : "Just now"}
                            </span>
                          </div>
                        </div>

                        {/* Bid Details */}
                        <div className="flex items-center gap-4 text-xs">
                          <span className="font-bold text-[#2a9d8f] text-sm">${bid.amount} USD</span>
                          <span className="text-[#8aa89e]">•</span>
                          <span className="font-semibold text-[#1a3c34]">{bid.days} days delivery</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#5a7a72] leading-relaxed pl-1">
                        {bid.pitch}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Bid Submission / Status panel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Proposal Submission Area */}
            <div className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-6 shadow-sm space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#2a9d8f]/5 rounded-full blur-xl"></div>
              
              {/* Scenario 1: Not Authenticated */}
              {sessionStatus === "unauthenticated" || !session ? (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-[#1a3c34] text-[15px]">Sign In to Apply</h4>
                    <p className="text-xs text-[#8aa89e] leading-relaxed">
                      You must be signed in with a freelancer account to submit work proposals and apply for this task.
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className="block w-full text-center bg-[#1a3c34] hover:bg-[#255248] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Sign In
                  </Link>
                </div>
              ) : 

              /* Scenario 2: User is the Buyer/Owner of the task */
              isOwner ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto border border-teal-100">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-[#1a3c34] text-[15px]">Your Task Listing</h4>
                    <p className="text-xs text-[#8aa89e] leading-relaxed">
                      You are the creator of this task listing. You can monitor proposals and manage deadlines in your client dashboard.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/client/my-tasks"
                    className="block w-full text-center bg-[#1a3c34] hover:bg-[#255248] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              ) :

              /* Scenario 3: User is a Client, but not the task owner */
              isClient ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-[#1a3c34] text-[15px]">Client Account</h4>
                    <p className="text-xs text-[#8aa89e] leading-relaxed">
                      Only Freelancer accounts can submit bids and work proposals. You are currently logged in as a Client.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full text-center bg-[#f4f8f6] hover:bg-[#eaf5f2] border border-[#d4ebe6] text-[#1a3c34] py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Back to Homepage
                  </button>
                </div>
              ) :

              /* Scenario 4: Logged in Freelancer (Ready to Bid!) */
              (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Sparkles className="w-4 h-4 text-[#2a9d8f]" />
                    <h4 className="font-bold text-[#1a3c34] text-[15px]">Place a Proposal</h4>
                  </div>

                  {/* Already submitted */}
                  {alreadyBid ? (
                    <div className="space-y-4 text-center py-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-emerald-800 text-[15px]">Proposal Submitted!</h4>
                        <p className="text-xs text-emerald-600/90 leading-relaxed px-2">
                          Your proposal has been sent to the client. You can track its status in your dashboard under &ldquo;My Proposals&rdquo;.
                        </p>
                      </div>
                      <a
                        href="/dashboard/freelancer/my-proposals"
                        className="block w-full text-center bg-[#1a3c34] hover:bg-[#255248] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        View My Proposals
                      </a>
                    </div>
                  ) : bidSuccess ? (
                    <div className="space-y-4 text-center py-4 animate-in fade-in duration-300">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-emerald-800 text-[15px]">Proposal Submitted!</h4>
                        <p className="text-xs text-emerald-600/90 leading-relaxed px-2">
                          Your proposal has been sent to the client. Track it in your dashboard.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleBidSubmit} className="space-y-4">
                      {/* API Error */}
                      {bidError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
                          {bidError}
                        </div>
                      )}

                      {/* Bid Amount */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#5a7a72] uppercase tracking-wider">
                          Your Bid Amount (USD)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-xs font-bold text-[#8aa89e]">$</span>
                          <input
                            type="number"
                            required
                            min="1"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className={`w-full pl-7 pr-3 py-3 border rounded-xl text-xs outline-none focus:border-[#2a9d8f] transition-all bg-white font-bold text-[#1a3c34]
                              ${formErrors.amount ? "border-red-400" : "border-gray-200"}`}
                          />
                        </div>
                        {formErrors.amount && <p className="text-[10px] text-red-500 font-bold">{formErrors.amount}</p>}
                      </div>

                      {/* Delivery Time */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#5a7a72] uppercase tracking-wider">
                          Delivery Timeframe (Days)
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="e.g. 3"
                          value={deliveryDays}
                          onChange={(e) => setDeliveryDays(e.target.value)}
                          className={`w-full px-3 py-3 border rounded-xl text-xs outline-none focus:border-[#2a9d8f] transition-all bg-white font-bold text-[#1a3c34]
                            ${formErrors.days ? "border-red-400" : "border-gray-200"}`}
                        />
                        {formErrors.days && <p className="text-[10px] text-red-500 font-bold">{formErrors.days}</p>}
                      </div>

                      {/* Pitch Text area */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#5a7a72] uppercase tracking-wider flex justify-between">
                          <span>Pitch / Proposal text</span>
                          <span className="text-[10px] text-[#8aa89e] lowercase">{proposalPitch.length} chars</span>
                        </label>
                        <textarea
                          required
                          rows={5}
                          placeholder="Describe your qualifications, explain how you will accomplish this task, and highlight why the client should pick you..."
                          value={proposalPitch}
                          onChange={(e) => setProposalPitch(e.target.value)}
                          className={`w-full px-3 py-3 border rounded-xl text-xs outline-none focus:border-[#2a9d8f] transition-all bg-white leading-relaxed text-[#5a7a72] resize-none
                            ${formErrors.pitch ? "border-red-400" : "border-gray-200"}`}
                        />
                        {formErrors.pitch && <p className="text-[10px] text-red-500 font-bold">{formErrors.pitch}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingBid}
                        className="w-full text-white bg-[#1a3c34] hover:bg-[#255248] disabled:bg-gray-400 py-3.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98]"
                      >
                        {isSubmittingBid ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            Submit Proposal
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Safety instructions */}
            <div className="bg-[#f0f9f6] border border-[#d4ebe6]/50 rounded-3xl p-5 space-y-3.5 text-xs text-[#5a7a72]">
              <h4 className="font-bold text-[#1a3c34] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#2a9d8f]" />
                SkillSwap Guarantees
              </h4>
              <ul className="space-y-2 list-disc list-inside leading-relaxed">
                <li>Bids can be edited or cancelled before selection.</li>
                <li>Ensure to keep communication secure within SkillSwap.</li>
                <li>Payments are secured and released upon work validation.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

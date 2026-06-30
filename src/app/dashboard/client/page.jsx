"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardCheck, CircleDot, Clock, Wallet, Plus, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { getTasks } from "@/lib/actions/tasks";
import { getProposals, deleteProposal } from "@/lib/actions/proposals";

export default function ClientDashboardHomePage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);

  // Fetch tasks and proposals
  const fetchClientData = async () => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch client tasks
      const tasksRes = await getTasks(session.user.email);
      if (tasksRes.success) {
        const clientTasks = tasksRes.data || [];
        setTasks(clientTasks);

        // 2. Fetch all proposals for this client's tasks
        const proposalsRes = await getProposals({ clientEmail: session.user.email });
        if (proposalsRes.success) {
          const taskMap = {};
          clientTasks.forEach(t => { taskMap[t._id] = t; });

          const allProposals = (proposalsRes.data || []).map(bid => ({
            ...bid,
            taskTitle: bid.taskTitle || taskMap[bid.taskId]?.title || "Unknown Task",
            initials: bid.freelancerName ? bid.freelancerName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "FL",
            name: bid.freelancerName || "Anonymous",
            description: `Bid for ${bid.taskTitle || taskMap[bid.taskId]?.title || "Task"}`,
            amount: `$${Number(bid.amount || 0).toLocaleString()}`,
            avatarBg: "bg-[#f5ebe6]",
            avatarColor: "text-[#7c5e4d]"
          }));
          setProposals(allProposals);
        }
      }
    } catch (err) {
      console.error("Error fetching client data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus !== "loading") {
      fetchClientData();
    }
  }, [session, sessionStatus]);

  // Handle Accept Proposal (redirects to payment)
  const handleAcceptProposal = (proposal) => {
    const alreadyAccepted = proposals.some(
      p => p.taskId === proposal.taskId && p.status === "accepted"
    );
    if (alreadyAccepted) {
      alert("A proposal for this task is already accepted.");
      return;
    }
    if (!confirm(`Accept ${proposal.name}'s proposal of ${proposal.amount} for "${proposal.taskTitle}"?`)) {
      return;
    }
    router.push(`/payment/checkout?proposalId=${proposal._id}&taskId=${proposal.taskId}`);
  };

  // Handle Decline Proposal (deletes from DB)
  const handleDeclineProposal = async (proposalToDelete) => {
    if (!confirm(`Are you sure you want to decline this proposal?`)) {
      return;
    }

    try {
      const res = await deleteProposal(proposalToDelete._id);
      if (res.success) {
        setProposals(prev => prev.filter(p => p._id !== proposalToDelete._id));
        alert("Proposal declined.");
      } else {
        alert("Failed to decline proposal: " + res.message);
      }
    } catch (e) {
      console.error("Failed to decline proposal", e);
      alert("Error declining proposal.");
    }
  };

  // Stats calculation
  const totalTasksCount = tasks.length;
  const openTasksCount = tasks.filter(t => (t.status || "Open").toLowerCase() === "open").length;
  const inProgressTasksCount = tasks.filter(t => (t.status || "").toLowerCase() === "in progress").length;
  
  // Total Spent is sum of budget of In Progress or Completed tasks
  const totalSpentVal = tasks
    .filter(t => (t.status || "").toLowerCase() === "in progress" || (t.status || "").toLowerCase() === "completed")
    .reduce((sum, t) => sum + (Number(t.budget) || 0), 0);

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasksCount.toString(),
      icon: ClipboardCheck,
      iconBg: "bg-[#eaf5f2] dark:bg-[#1a2435]",
      iconColor: "text-[#2a9d8f]",
      cardBg: "bg-white dark:bg-[#131c2b]",
    },
    {
      title: "Open Tasks",
      value: openTasksCount.toString(),
      icon: CircleDot,
      iconBg: "bg-[#fffbeb]",
      iconColor: "text-[#d97706]",
      cardBg: "bg-white dark:bg-[#131c2b]",
    },
    {
      title: "In Progress",
      value: inProgressTasksCount.toString(),
      icon: Clock,
      iconBg: "bg-[#eaf5f2] dark:bg-[#1a2435]",
      iconColor: "text-[#2a9d8f]",
      cardBg: "bg-white dark:bg-[#131c2b]",
    },
    {
      title: "Total Spent (USD)",
      value: totalSpentVal > 0 ? `$${totalSpentVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "$0",
      icon: Wallet,
      iconBg: "bg-[#e2f1ed] dark:bg-[#1a2435]",
      iconColor: "text-[#1a3c34] dark:text-[#e8f4f0]",
      cardBg: "bg-[#f0f7f4] dark:bg-[#1a2435]",
    },
  ];

  // Client's Active Tasks to show on Dashboard (Open or In Progress)
  const activeTasks = tasks.filter(t => t.status === "Open" || t.status === "In Progress");

  const getStatusColor = (status) => {
    if (status === "In Progress") {
      return "text-[#2a9d8f] bg-[#eaf5f2] dark:bg-[#1a2435] border-[#d4ebe6] dark:border-[#1e293b]";
    }
    return "text-[#d97706] bg-[#fffbeb] border-[#fef3c7]";
  };

  if (sessionStatus === "loading" || (loading && session)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#2a9d8f]" />
          <p className="text-[#5a7a72] dark:text-[#9fb3c8] font-semibold text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1a3c34] dark:text-[#e8f4f0]">Access Denied</h2>
        <p className="text-[#5a7a72] dark:text-[#9fb3c8]">Please log in to view your client dashboard.</p>
        <Link href="/login" className="bg-[#1a3c34] text-white px-6 py-2.5 rounded-full font-medium">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] dark:text-[#e8f4f0] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[#5a7a72] dark:text-[#9fb3c8] mt-1.5 text-[15px]">
            Manage tasks, proposals, and spending from one premium workspace.
          </p>
        </div>
        <Link
          href="/dashboard/client/post-task"
          className="flex items-center justify-center gap-2 bg-[#1a3c34] hover:bg-[#255248] text-white px-5 py-3 rounded-full font-medium transition-all shadow-sm hover:shadow-md cursor-pointer w-fit self-start md:self-auto"
        >
          <Plus size={18} />
          <span>Post a Task</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`p-6 rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/50 shadow-sm flex flex-col justify-between h-[150px] transition-all hover:shadow-md ${stat.cardBg}`}
            >
              <div className={`p-2.5 rounded-xl w-fit ${stat.iconBg} ${stat.iconColor}`}>
                <Icon size={20} />
              </div>
              <div className="space-y-1 mt-4">
                <span className="text-xs font-semibold text-[#8aa89e] dark:text-[#6b7e94] uppercase tracking-wider">
                  {stat.title}
                </span>
                <p className="text-3xl font-semibold text-[#1a3c34] dark:text-[#e8f4f0]">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: My Active Tasks */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131c2b] p-8 rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-[#1a3c34] dark:text-[#e8f4f0]">
              My Active Tasks
            </h2>
            <p className="text-[#8aa89e] dark:text-[#6b7e94] text-sm mt-1">
              Track active work without table clutter.
            </p>
          </div>

          <div className="space-y-4">
            {activeTasks.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#d4ebe6] dark:border-[#1e293b] rounded-2xl">
                <p className="text-sm text-[#8aa89e] dark:text-[#6b7e94]">No active tasks. Post a task to get started!</p>
              </div>
            ) : (
              activeTasks.map((task) => {
                const proposalCount = proposals.filter(p => p.taskId === task._id).length;

                return (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-5 rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/60 hover:border-[#2a9d8f]/40 hover:bg-[#f0f9f6] dark:bg-[#1a2435]/30 transition-all gap-4"
                  >
                    <div className="space-y-1.5">
                      <Link href={`/tasks/${task._id}`} className="hover:underline">
                        <h3 className="font-semibold text-[16px] text-[#1a3c34] dark:text-[#e8f4f0]">
                          {task.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-[#8aa89e] dark:text-[#6b7e94]">
                        <span>Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "Flexible"}</span>
                        <span>•</span>
                        <span>{proposalCount} proposal{proposalCount !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[12px] font-semibold px-3 py-1 rounded-full border ${getStatusColor(task.status)}`}
                    >
                      {task.status || "Open"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Recent Proposals */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131c2b] p-8 rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-[#1a3c34] dark:text-[#e8f4f0]">
              Recent Proposals
            </h2>
            <p className="text-[#8aa89e] dark:text-[#6b7e94] text-sm mt-1">
              Review freelancer bids and respond quickly.
            </p>
          </div>

          <div className="space-y-4">
            {proposals.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#d4ebe6] dark:border-[#1e293b] rounded-2xl">
                <p className="text-sm text-[#8aa89e] dark:text-[#6b7e94]">No proposals received yet.</p>
              </div>
            ) : (
              proposals.map((proposal, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/60 hover:border-[#2a9d8f]/30 hover:bg-[#f0f9f6] dark:bg-[#1a2435]/20 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm ${proposal.avatarBg} ${proposal.avatarColor}`}
                      >
                        {proposal.initials}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[15px] text-[#1a3c34] dark:text-[#e8f4f0]">
                          {proposal.name}
                        </h4>
                        <Link href={`/tasks/${proposal.taskId}`} className="text-xs text-[#8aa89e] dark:text-[#6b7e94] mt-0.5 hover:underline block">
                          {proposal.description}
                        </Link>
                      </div>
                    </div>
                    <span className="font-bold text-[16px] text-[#2a9d8f]">
                      {proposal.amount}
                    </span>
                  </div>

                  <div className="text-xs text-[#5a7a72] dark:text-[#9fb3c8] leading-relaxed italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    "{proposal.pitch}"
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleDeclineProposal(proposal)}
                      className="px-4 py-2 text-sm font-semibold rounded-xl text-[#5a7a72] dark:text-[#9fb3c8] hover:text-[#1a3c34] dark:text-[#e8f4f0] hover:bg-[#f0f9f6] dark:bg-[#1a2435] transition-all cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAcceptProposal(proposal)}
                      className="px-5 py-2 text-sm font-semibold rounded-xl bg-[#2a9d8f]/10 text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white transition-all cursor-pointer"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
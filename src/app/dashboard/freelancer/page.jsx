"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getTasks } from "@/lib/actions/tasks";
import { getProposals } from "@/lib/actions/proposals";
import {
  Loader2,
  Search,
  Briefcase,
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  FileText,
  CheckCircle2,
  Plus,
  ArrowRight,
  Zap,
  Award,
} from "lucide-react";

export default function FreelancerDashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [tasks, setTasks] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    let isMounted = true;

    const fetchFreelancerData = async () => {
      if (!session?.user?.email) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const tasksRes = await getTasks();
        const proposalsRes = await getProposals({ freelancerEmail: session.user.email });

        if (!isMounted) return;

        if (tasksRes.success) {
          setTasks(tasksRes.data || []);
        }
        if (proposalsRes.success) {
          setProposals(proposalsRes.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch freelancer dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFreelancerData();
    return () => { isMounted = false; };
  }, [session, sessionStatus]);

  const user = session?.user;

  // Map proposals to tasks
  const myProposals = useMemo(() => {
    const taskMap = {};
    tasks.forEach(t => { taskMap[t._id] = t; });

    return proposals.map(prop => ({
      ...prop,
      task: taskMap[prop.taskId] || { title: prop.taskTitle || "Task Details", budget: prop.taskBudget || 0 }
    }));
  }, [proposals, tasks]);

  // Active Projects where proposal status is accepted and task status is In Progress
  const activeProjects = useMemo(() => {
    const taskMap = {};
    tasks.forEach(t => { taskMap[t._id] = t; });

    return proposals
      .filter(p => p.status === "accepted")
      .map(p => ({
        ...p,
        task: taskMap[p.taskId]
      }))
      .filter(p => p.task && p.task.status === "In Progress");
  }, [proposals, tasks]);

  // Calculations for stats
  const totalProposalsCount = proposals.length;
  const pendingProposalsCount = proposals.filter(p => p.status === "pending").length;
  const acceptedProposalsCount = proposals.filter(p => p.status === "accepted").length;
  const openTasks = tasks.filter(t => (t.status || "Open").toLowerCase() === "open");

  const totalEarned = useMemo(() => {
    const taskMap = {};
    tasks.forEach(t => { taskMap[t._id] = t; });

    return proposals
      .filter(p => p.status === "accepted")
      .reduce((sum, p) => {
        const t = taskMap[p.taskId];
        if (t && t.status === "Completed") {
          return sum + (Number(p.amount) || 0);
        }
        return sum;
      }, 0);
  }, [proposals, tasks]);

  const stats = [
    {
      title: "Total Proposals",
      value: loading ? null : totalProposalsCount,
      icon: FileText,
      iconBg: "bg-[#eaf5f2] dark:bg-[#1a2435]",
      iconColor: "text-[#2a9d8f]",
      cardBg: "bg-white dark:bg-[#131c2b]",
    },
    {
      title: "Pending Proposals",
      value: loading ? null : pendingProposalsCount,
      icon: Clock,
      iconBg: "bg-[#fffbeb]",
      iconColor: "text-[#d97706]",
      cardBg: "bg-white dark:bg-[#131c2b]",
    },
    {
      title: "Accepted Proposals",
      value: loading ? null : acceptedProposalsCount,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      cardBg: "bg-white dark:bg-[#131c2b]",
    },
    {
      title: "Total Earnings (USD)",
      value: loading
        ? null
        : `$${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      iconBg: "bg-[#e2f1ed] dark:bg-[#1a2435]",
      iconColor: "text-[#1a3c34] dark:text-[#e8f4f0]",
      cardBg: "bg-[#f0f7f4] dark:bg-[#1a2435]",
    },
  ];

  if (sessionStatus === "loading" || (loading && !session)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#2a9d8f]" />
          <p className="text-[#5a7a72] dark:text-[#9fb3c8] font-semibold text-sm">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1a3c34] dark:text-[#e8f4f0]">Access Denied</h2>
        <p className="text-[#5a7a72] dark:text-[#9fb3c8]">Please log in to view your freelancer dashboard.</p>
        <Link href="/login" className="bg-[#1a3c34] text-white px-6 py-2.5 rounded-full font-medium">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] dark:text-[#e8f4f0] tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-[#5a7a72] dark:text-[#9fb3c8] mt-1.5 text-[15px]">
            Here&apos;s an overview of your freelance activity and open opportunities.
          </p>
        </div>
        <Link
          href="/tasks"
          className="flex items-center justify-center gap-2 bg-[#1a3c34] hover:bg-[#255248] text-white px-5 py-3 rounded-full font-medium transition-all shadow-sm hover:shadow-md cursor-pointer w-fit self-start md:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <Search size={18} />
          <span>Browse Gigs</span>
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
                  {stat.value === null ? (
                    <span className="inline-block w-16 h-6 bg-gray-100 animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Active Projects */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131c2b] p-8 rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-semibold text-[#1a3c34] dark:text-[#e8f4f0]">Active Projects</h2>
              <p className="text-[#8aa89e] dark:text-[#6b7e94] text-sm mt-1">Tasks you&apos;ve been hired for.</p>
            </div>
            <Link href="/dashboard/freelancer/projects" className="text-xs text-[#2a9d8f] font-bold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-5 rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/60 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              ))
            ) : activeProjects.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#d4ebe6] dark:border-[#1e293b] rounded-2xl space-y-3">
                <Briefcase className="w-8 h-8 text-[#d4ebe6] mx-auto" />
                <p className="text-sm text-[#8aa89e] dark:text-[#6b7e94]">No active projects yet.</p>
                <Link href="/tasks" className="inline-flex items-center gap-1.5 text-sm text-[#2a9d8f] font-semibold hover:underline">
                  <Plus className="w-4 h-4" /> Browse open gigs
                </Link>
              </div>
            ) : (
              activeProjects.slice(0, 4).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-5 rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/60 hover:border-[#2a9d8f]/40 hover:bg-[#f0f9f6] dark:bg-[#1a2435]/30 transition-all gap-4"
                >
                  <div className="space-y-1.5">
                    <Link href={`/tasks/${task._id}`} className="hover:underline">
                      <h3 className="font-semibold text-[16px] text-[#1a3c34] dark:text-[#e8f4f0]">{task.title}</h3>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-[#8aa89e] dark:text-[#6b7e94]">
                      <span className="bg-[#eaf5f2] dark:bg-[#1a2435] text-[#2a9d8f] px-2 py-0.5 rounded-full font-semibold">{task.category || "General"}</span>
                      <span>Budget: ${Number(task.budget || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold px-3 py-1 rounded-full border text-[#2a9d8f] bg-[#eaf5f2] dark:bg-[#1a2435] border-[#d4ebe6] dark:border-[#1e293b] shrink-0">
                    In Progress
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Recent Proposals */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131c2b] p-8 rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-semibold text-[#1a3c34] dark:text-[#e8f4f0]">My Proposals</h2>
              <p className="text-[#8aa89e] dark:text-[#6b7e94] text-sm mt-1">Your submitted bids on tasks.</p>
            </div>
            <Link href="/dashboard/freelancer/my-proposals" className="text-xs text-[#2a9d8f] font-bold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/60 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))
            ) : myProposals.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#d4ebe6] dark:border-[#1e293b] rounded-2xl space-y-3">
                <FileText className="w-8 h-8 text-[#d4ebe6] mx-auto" />
                <p className="text-sm text-[#8aa89e] dark:text-[#6b7e94]">No proposals submitted yet.</p>
                <Link href="/tasks" className="inline-flex items-center gap-1.5 text-sm text-[#2a9d8f] font-semibold hover:underline">
                  <Search className="w-4 h-4" /> Find tasks to bid on
                </Link>
              </div>
            ) : (
              myProposals.slice(0, 4).map((proposal, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/60 hover:border-[#2a9d8f]/30 hover:bg-[#f0f9f6] dark:bg-[#1a2435]/20 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/tasks/${proposal.task._id}`} className="font-semibold text-[14px] text-[#1a3c34] dark:text-[#e8f4f0] hover:text-[#2a9d8f] hover:underline transition-colors line-clamp-1">
                      {proposal.task.title}
                    </Link>
                    <span className="font-bold text-[#2a9d8f] text-sm shrink-0">${Number(proposal.amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8aa89e] dark:text-[#6b7e94]">
                    <Clock className="w-3 h-3" />
                    <span>{proposal.days} day{proposal.days !== 1 ? "s" : ""} delivery</span>
                    <span>•</span>
                    <span>{proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : "Recently"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[#1a3c34] to-[#2a9d8f] rounded-3xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-white/80" />
              <h2 className="text-xl font-serif font-bold">Ready to earn more?</h2>
            </div>
            <p className="text-white/70 text-sm max-w-md">
              There are <strong className="text-white">{openTasks.length} open gigs</strong> waiting for proposals. Browse tasks matching your skills and start bidding today.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/tasks"
              className="flex items-center gap-2 bg-white dark:bg-[#131c2b] text-[#1a3c34] dark:text-[#e8f4f0] px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:bg-[#eaf5f2] dark:bg-[#1a2435] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search size={16} />
              Browse Gigs
            </Link>
            <Link
              href="/dashboard/freelancer/profile"
              className="flex items-center gap-2 bg-white dark:bg-[#131c2b]/10 hover:bg-white dark:bg-[#131c2b]/20 border border-white/20 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Star size={16} />
              Update Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getTasks } from "@/lib/actions/tasks";
import {
  Loader2,
  Briefcase,
  DollarSign,
  Calendar,
  Tag,
  AlertTriangle,
  Search,
  Clock,
  CheckCircle2,
  ArrowRight,
  User,
} from "lucide-react";

export default function FreelancerProjectsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    const fetchTasks = async () => {
      try {
        const res = await getTasks();
        if (res.success) setAllTasks(res.data || []);
        else setError(res.message || "Failed to load projects");
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [sessionStatus]);

  const user = session?.user;

  const myProjects = useMemo(() => {
    if (typeof window === "undefined" || !user) return [];
    return allTasks.filter((task) => {
      if (!["In Progress", "Completed"].includes(task.status)) return false;
      const acceptedBidStr = localStorage.getItem(`accepted_bid_${task._id}`);
      if (!acceptedBidStr) return false;
      try {
        const accepted = JSON.parse(acceptedBidStr);
        return (
          accepted.freelancerName === user.name ||
          accepted.freelancerEmail === user.email
        );
      } catch (e) {
        return false;
      }
    });
  }, [allTasks, user]);

  const activeCount = myProjects.filter((t) => t.status === "In Progress").length;
  const completedCount = myProjects.filter((t) => t.status === "Completed").length;
  const totalEarned = myProjects
    .filter((t) => t.status === "Completed")
    .reduce((sum, task) => {
      const acceptedBidStr = localStorage.getItem(`accepted_bid_${task._id}`);
      if (!acceptedBidStr) return sum;
      try {
        const accepted = JSON.parse(acceptedBidStr);
        return sum + Number(accepted.amount?.toString().replace(/[^0-9.-]+/g, "") || 0);
      } catch (e) {
        return sum;
      }
    }, 0);

  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-white p-8 rounded-3xl border border-[#d4ebe6]/50 shadow-md space-y-6 max-w-sm w-full">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-[#1a3c34]">Access Denied</h2>
          <Link href="/login" className="block w-full bg-[#1a3c34] text-white py-3 rounded-xl font-medium text-center">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] tracking-tight">Active Projects</h1>
          <p className="text-[#5a7a72] mt-1.5 text-[15px]">Tasks where your proposal was accepted.</p>
        </div>
        <Link
          href="/tasks"
          className="flex items-center justify-center gap-2 bg-[#1a3c34] hover:bg-[#255248] text-white px-5 py-3 rounded-full font-medium transition-all shadow-sm hover:shadow-md w-fit self-start md:self-auto hover:scale-[1.02]"
        >
          <Search size={18} />
          <span>Find More Work</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: "In Progress", value: activeCount, icon: Clock, iconBg: "bg-[#eaf5f2]", iconColor: "text-[#2a9d8f]", cardBg: "bg-white" },
          { title: "Completed", value: completedCount, icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", cardBg: "bg-white" },
          { title: "Total Earned", value: `$${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, iconBg: "bg-[#e2f1ed]", iconColor: "text-[#1a3c34]", cardBg: "bg-[#f0f7f4]" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`p-6 rounded-2xl border border-[#d4ebe6]/50 shadow-sm flex flex-col justify-between h-[140px] transition-all hover:shadow-md ${stat.cardBg}`}>
              <div className={`p-2.5 rounded-xl w-fit ${stat.iconBg} ${stat.iconColor}`}><Icon size={20} /></div>
              <div className="space-y-1 mt-4">
                <span className="text-xs font-semibold text-[#8aa89e] uppercase tracking-wider">{stat.title}</span>
                <p className="text-2xl font-semibold text-[#1a3c34]">
                  {loading ? <span className="inline-block w-12 h-5 bg-gray-100 animate-pulse rounded" /> : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#2a9d8f]" />
            <p className="text-[#8aa89e] text-sm font-medium">Loading your projects...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      ) : myProjects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 bg-[#eaf5f2] text-[#2a9d8f] rounded-2xl flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1a3c34]">No Projects Yet</h3>
            <p className="text-[#8aa89e] text-sm mt-1.5 px-4">
              When a client accepts your proposal, the project will appear here.
            </p>
          </div>
          <Link href="/tasks" className="inline-flex items-center gap-2 bg-[#2a9d8f] hover:bg-[#238478] text-white px-6 py-3 rounded-full font-medium transition-all shadow-sm">
            <Search size={16} /> Browse Open Gigs
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {myProjects.map((task) => {
            const isInProgress = task.status === "In Progress";
            const statusStyle = isInProgress
              ? "text-[#2a9d8f] bg-[#eaf5f2] border-[#d4ebe6]"
              : "text-emerald-700 bg-emerald-50 border-emerald-100";

            let acceptedBid = null;
            if (typeof window !== "undefined") {
              const str = localStorage.getItem(`accepted_bid_${task._id}`);
              if (str) {
                try { acceptedBid = JSON.parse(str); } catch (e) {}
              }
            }
            const agreedAmount = acceptedBid
              ? Number(acceptedBid.amount?.toString().replace(/[^0-9.-]+/g, "") || task.budget || 0)
              : Number(task.budget || 0);

            return (
              <div
                key={task._id}
                className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-6 md:p-8 hover:shadow-md hover:border-[#2a9d8f]/30 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusStyle}`}>
                        {task.status}
                      </span>
                      {task.category && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#eaf5f2] text-[#2a9d8f] px-2.5 py-1 rounded-lg">
                          <Tag className="w-3 h-3" /> {task.category}
                        </span>
                      )}
                    </div>
                    <Link href={`/tasks/${task._id}`} className="font-bold text-xl text-[#1a3c34] hover:text-[#2a9d8f] hover:underline transition-colors block">
                      {task.title}
                    </Link>
                    <p className="text-sm text-[#5a7a72] leading-relaxed line-clamp-2">{task.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-2xl font-extrabold text-[#2a9d8f]">
                      ${agreedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </span>
                    <span className="text-xs text-[#8aa89e] font-medium">Agreed amount</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#8aa89e] font-medium">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#2a9d8f]" />
                      Client: <span className="text-[#1a3c34] font-bold ml-1">{task.buyerName || "Anonymous"}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#2a9d8f]" />
                      Deadline: <span className="text-[#1a3c34] font-bold ml-1">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Flexible"}
                      </span>
                    </span>
                  </div>
                  <Link
                    href={`/tasks/${task._id}`}
                    className="flex items-center gap-2 bg-[#f4f8f6] hover:bg-[#eaf5f2] border border-[#d4ebe6] text-[#1a3c34] px-4 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    View Task <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

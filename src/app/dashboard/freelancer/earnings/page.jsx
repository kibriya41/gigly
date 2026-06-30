"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getTasks } from "@/lib/actions/tasks";
import { getProposals } from "@/lib/actions/proposals";
import {
  Loader2,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  BarChart2,
  Tag,
  AlertTriangle,
  Search,
} from "lucide-react";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function FreelancerEarningsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [tasks, setTasks] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    let isMounted = true;

    const fetchEarningsData = async () => {
      if (!session?.user?.email) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const tasksRes = await getTasks();
        const proposalsRes = await getProposals({ freelancerEmail: session.user.email });

        if (!isMounted) return;

        if (tasksRes.success && proposalsRes.success) {
          setTasks(tasksRes.data || []);
          setProposals(proposalsRes.data || []);
        } else {
          setError(tasksRes.message || proposalsRes.message || "Failed to load earnings data");
        }
      } catch (err) {
        if (isMounted) setError(err.message || "An unexpected error occurred");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEarningsData();
    return () => { isMounted = false; };
  }, [session, sessionStatus]);

  const user = session?.user;

  // Filter accepted proposals and join with task details
  const earningData = useMemo(() => {
    if (!user) return { records: [], totalEarned: 0, pending: 0 };

    const taskMap = {};
    tasks.forEach((t) => { taskMap[t._id] = t; });

    const records = proposals
      .filter((p) => p.status === "accepted")
      .map((p) => {
        const task = taskMap[p.taskId];
        return {
          proposal: p,
          task: task || { title: p.taskTitle || "Task Details", category: p.taskCategory || "", buyerEmail: p.clientEmail || "" },
          amount: Number(p.amount || 0),
          isPaid: task ? task.status === "Completed" : false,
        };
      });

    const totalEarned = records.filter((r) => r.isPaid).reduce((s, r) => s + r.amount, 0);
    const pending = records.filter((r) => !r.isPaid).reduce((s, r) => s + r.amount, 0);

    return { records, totalEarned, pending };
  }, [proposals, tasks, user]);

  // Monthly earning chart data
  const monthlyData = useMemo(() => {
    const map = {};
    earningData.records
      .filter((r) => r.isPaid)
      .forEach((r) => {
        let dateStr = r.task.updatedAt || r.task.createdAt || r.proposal.createdAt;
        if (!dateStr && r.task._id && /^[0-9a-fA-F]{24}$/.test(r.task._id)) {
          const ts = parseInt(r.task._id.substring(0, 8), 16) * 1000;
          dateStr = new Date(ts).toISOString();
        }
        if (!dateStr) return;
        const d = new Date(dateStr);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!map[key]) map[key] = { year: d.getFullYear(), month: d.getMonth(), amount: 0 };
        map[key].amount += r.amount;
      });
    const sorted = Object.values(map).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    return sorted.slice(-7);
  }, [earningData]);

  const maxBarAmount = Math.max(...monthlyData.map((m) => m.amount), 1);

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
        <div className="bg-white dark:bg-[#131c2b] p-8 rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/50 shadow-md space-y-6 max-w-sm w-full">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-[#1a3c34] dark:text-[#e8f4f0]">Access Denied</h2>
          <Link href="/login" className="block w-full bg-[#1a3c34] text-white py-3 rounded-xl font-medium text-center">Sign In</Link>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Earned",
      value: `$${earningData.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      sub: "All time completed",
    },
    {
      title: "Pending Payout",
      value: `$${earningData.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Clock,
      iconBg: "bg-[#fffbeb]",
      iconColor: "text-[#d97706]",
      sub: "Awaiting completion",
    },
    {
      title: "Projects Paid",
      value: earningData.records.filter((r) => r.isPaid).length,
      icon: CheckCircle2,
      iconBg: "bg-[#eaf5f2] dark:bg-[#1a2435]",
      iconColor: "text-[#2a9d8f]",
      sub: "Completed gigs",
    },
    {
      title: "Active Contracts",
      value: earningData.records.filter((r) => !r.isPaid).length,
      icon: TrendingUp,
      iconBg: "bg-[#e2f1ed] dark:bg-[#1a2435]",
      iconColor: "text-[#1a3c34] dark:text-[#e8f4f0]",
      sub: "In progress",
    },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] dark:text-[#e8f4f0] tracking-tight">Earnings</h1>
          <p className="text-[#5a7a72] dark:text-[#9fb3c8] mt-1.5 text-[15px]">Track your income from completed and active projects.</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            getTasks().then(tasksRes => {
              getProposals({ freelancerEmail: session.user.email }).then(proposalsRes => {
                if (tasksRes.success && proposalsRes.success) {
                  setTasks(tasksRes.data || []);
                  setProposals(proposalsRes.data || []);
                } else {
                  setError("Failed to reload data");
                }
                setLoading(false);
              });
            });
          }}
          className="flex items-center justify-center gap-2 bg-[#f4f8f6] dark:bg-[#1a2435] hover:bg-[#eaf5f2] dark:bg-[#1a2435] border border-[#d4ebe6] dark:border-[#1e293b] text-[#1a3c34] dark:text-[#e8f4f0] px-5 py-2.5 rounded-full font-semibold text-xs transition-all shadow-sm w-fit"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-6 rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/50 shadow-sm bg-white dark:bg-[#131c2b] flex flex-col justify-between h-[150px] hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${stat.iconBg} ${stat.iconColor}`}><Icon size={20} /></div>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#8aa89e] dark:text-[#6b7e94] uppercase tracking-wider">{stat.title}</span>
                <p className="text-2xl font-semibold text-[#1a3c34] dark:text-[#e8f4f0]">
                  {loading ? <span className="inline-block w-16 h-6 bg-gray-100 animate-pulse rounded" /> : stat.value}
                </p>
                <p className="text-xs text-[#8aa89e] dark:text-[#6b7e94]">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Earnings Chart */}
      <div className="bg-white dark:bg-[#131c2b] rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#eaf5f2] dark:bg-[#1a2435] text-[#2a9d8f]"><BarChart2 size={20} /></div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#1a3c34] dark:text-[#e8f4f0]">Monthly Earnings</h2>
            <p className="text-xs text-[#8aa89e] dark:text-[#6b7e94]">Paid project history</p>
          </div>
        </div>
        {loading ? (
          <div className="h-48 bg-gray-50 animate-pulse rounded-2xl" />
        ) : monthlyData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-center border border-dashed border-[#d4ebe6] dark:border-[#1e293b] rounded-2xl">
            <div className="space-y-2">
              <BarChart2 className="w-8 h-8 text-[#d4ebe6] mx-auto" />
              <p className="text-sm text-[#8aa89e] dark:text-[#6b7e94]">No payment history yet.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-end gap-3 h-48 overflow-x-auto pb-2">
            {monthlyData.map((m, i) => {
              const heightPct = (m.amount / maxBarAmount) * 100;
              return (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 min-w-[60px]">
                  <span className="text-xs font-bold text-[#5a7a72] dark:text-[#9fb3c8]">
                    ${m.amount >= 1000
                      ? `${(m.amount / 1000).toFixed(1)}k`
                      : m.amount.toFixed(0)}
                  </span>
                  <div className="relative w-full flex items-end" style={{ height: "140px" }}>
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-[#2a9d8f] to-[#4ecdc4] transition-all duration-500 cursor-pointer hover:opacity-90"
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                      title={`$${m.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    />
                  </div>
                  <span className="text-[11px] text-[#8aa89e] dark:text-[#6b7e94] font-medium whitespace-nowrap">
                    {MONTH_LABELS[m.month]} {m.year !== new Date().getFullYear() ? m.year : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Earnings History Table */}
      <div className="bg-white dark:bg-[#131c2b] rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-[#d4ebe6] dark:border-[#1e293b]/40">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#1a3c34] dark:text-[#e8f4f0]">Earnings History</h2>
            <p className="text-xs text-[#8aa89e] dark:text-[#6b7e94] mt-0.5">All accepted project payments</p>
          </div>
        </div>
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : earningData.records.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 bg-[#eaf5f2] dark:bg-[#1a2435] text-[#2a9d8f] rounded-2xl flex items-center justify-center mx-auto">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-[#1a3c34] dark:text-[#e8f4f0]">No earnings yet</p>
              <p className="text-[#8aa89e] dark:text-[#6b7e94] text-sm mt-1">Submit proposals and get hired to start earning.</p>
            </div>
            <Link href="/tasks" className="inline-flex items-center gap-2 bg-[#2a9d8f] hover:bg-[#238478] text-white px-6 py-2.5 rounded-full font-medium transition-all text-sm">
              <Search size={14} /> Browse Gigs
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d4ebe6] dark:border-[#1e293b]/60 bg-[#f4f8f6] dark:bg-[#1a2435]">
                  <th className="text-left py-4 px-6 font-bold text-[#5a7a72] dark:text-[#9fb3c8] text-xs uppercase tracking-wider">Task</th>
                  <th className="text-left py-4 px-4 font-bold text-[#5a7a72] dark:text-[#9fb3c8] text-xs uppercase tracking-wider">Category</th>
                  <th className="text-left py-4 px-4 font-bold text-[#5a7a72] dark:text-[#9fb3c8] text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left py-4 px-4 font-bold text-[#5a7a72] dark:text-[#9fb3c8] text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-4 font-bold text-[#5a7a72] dark:text-[#9fb3c8] text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4ebe6]/40">
                {earningData.records.map((record, i) => {
                  let dateStr = record.task.updatedAt || record.task.createdAt || record.proposal.createdAt;
                  if (!dateStr && record.task._id && /^[0-9a-fA-F]{24}$/.test(record.task._id)) {
                    const ts = parseInt(record.task._id.substring(0, 8), 16) * 1000;
                    dateStr = new Date(ts).toISOString();
                  }
                  const dateFormatted = dateStr
                    ? new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                    : "—";
                  return (
                    <tr key={i} className="hover:bg-[#f9fcfb] transition-colors">
                      <td className="py-4 px-6">
                        <Link href={`/tasks/${record.task._id}`} className="font-semibold text-[#1a3c34] dark:text-[#e8f4f0] hover:text-[#2a9d8f] hover:underline">
                          {record.task.title}
                        </Link>
                        <div className="text-xs text-[#8aa89e] dark:text-[#6b7e94] mt-0.5">Client: {record.task.buyerEmail || "—"}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#eaf5f2] dark:bg-[#1a2435] text-[#2a9d8f] px-2 py-1 rounded-lg">
                          <Tag className="w-2.5 h-2.5" />{record.task.category || "General"}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-[#2a9d8f]">
                        ${record.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${
                          record.isPaid
                            ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                            : "text-[#d97706] bg-[#fffbeb] border-[#fef3c7]"
                        }`}>
                          {record.isPaid ? <><CheckCircle2 className="w-3 h-3" /> Paid</> : <><Clock className="w-3 h-3" /> Pending</>}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-[#8aa89e] dark:text-[#6b7e94] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#2a9d8f]" />{dateFormatted}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

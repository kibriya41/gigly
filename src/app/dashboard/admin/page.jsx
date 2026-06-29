"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getAdminStats } from "@/lib/actions/admin";
import {
  Users,
  Briefcase,
  DollarSign,
  Activity,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Star,
  Ban,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboardHome() {
  const { data: session, status: sessionStatus } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminStats();
      if (res.success) {
        setStats(res.data);
      } else {
        setError(res.message || "Failed to load stats");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus !== "loading") fetchStats();
  }, [sessionStatus]);

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
        <div className="bg-white p-8 rounded-3xl border border-[#d4ebe6]/50 shadow-md space-y-6">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-[#1a3c34]">Access Denied</h2>
          <p className="text-[#5a7a72]">Please sign in to view the admin dashboard.</p>
          <Link href="/login" className="block w-full bg-[#1a3c34] text-white py-3 rounded-xl font-medium text-center">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      iconBg: "bg-[#eaf5f2]",
      iconColor: "text-[#2a9d8f]",
      cardBg: "bg-white",
      sub: `${stats?.totalFreelancers ?? 0} freelancers · ${stats?.totalClients ?? 0} clients`,
    },
    {
      title: "Total Tasks",
      value: stats?.totalTasks ?? 0,
      icon: Briefcase,
      iconBg: "bg-[#fffbeb]",
      iconColor: "text-[#d97706]",
      cardBg: "bg-white",
      sub: `${stats?.openTasks ?? 0} open · ${stats?.inProgressTasks ?? 0} in progress`,
    },
    {
      title: "Total Revenue (USD)",
      value: stats?.totalRevenue
        ? `$${Number(stats.totalRevenue).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
        : "$0",
      icon: DollarSign,
      iconBg: "bg-[#e2f1ed]",
      iconColor: "text-[#1a3c34]",
      cardBg: "bg-[#f0f7f4]",
      sub: `${stats?.totalTransactions ?? 0} transactions`,
    },
    {
      title: "Active Tasks",
      value: stats?.activeTasks ?? 0,
      icon: Activity,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      cardBg: "bg-white",
      sub: "Open + In Progress combined",
    },
  ];

  const insightCards = [
    {
      label: "Avg. Platform Rating",
      value: stats?.avgRating ? Number(stats.avgRating).toFixed(1) : "4.9",
      icon: Star,
      sub: `${stats?.totalRatings ?? 0} reviews`,
    },
    {
      label: "Total Proposals",
      value: stats?.totalProposals ?? 0,
      icon: TrendingUp,
      sub: "Across all tasks",
    },
    {
      label: "Blocked Users",
      value: stats?.blockedUsers ?? 0,
      icon: Ban,
      sub: "Suspended accounts",
    },
    {
      label: "Total Payout Volume",
      value: `$${Number(stats?.totalPaidOut ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      sub: "Sum of task budgets",
    },
  ];

  const quickLinks = [
    { label: "Manage Users", href: "/dashboard/admin/users", icon: Users, desc: "Block or unblock accounts" },
    { label: "Manage Tasks", href: "/dashboard/admin/tasks", icon: Briefcase, desc: "Review & remove listings" },
    { label: "Transactions", href: "/dashboard/admin/transactions", icon: DollarSign, desc: "Payment history" },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-6 h-6 text-[#2a9d8f]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#2a9d8f] bg-[#eaf5f2] px-3 py-1 rounded-full border border-[#d4ebe6]">
              Admin Control Center
            </span>
          </div>
          <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-[#5a7a72] mt-1.5 text-[15px]">
            Platform-wide oversight of users, tasks, and transactions.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 bg-[#f4f8f6] hover:bg-[#eaf5f2] border border-[#d4ebe6] text-[#1a3c34] px-5 py-2.5 rounded-full text-xs font-semibold transition-all w-fit disabled:opacity-50"
        >
          <Loader2 className={`w-3.5 h-3.5 ${loading ? "animate-spin" : "hidden"}`} />
          Refresh Data
        </button>
      </div>

      {error ? (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={fetchStats} className="px-5 py-2 bg-red-600 text-white text-xs font-medium rounded-xl">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`p-6 rounded-2xl border border-[#d4ebe6]/50 shadow-sm flex flex-col justify-between h-[160px] transition-all hover:shadow-md ${stat.cardBg}`}>
                  <div className={`p-2.5 rounded-xl w-fit ${stat.iconBg} ${stat.iconColor}`}>
                    <Icon size={20} />
                  </div>
                  <div className="space-y-1 mt-4">
                    <span className="text-xs font-semibold text-[#8aa89e] uppercase tracking-wider">{stat.title}</span>
                    <p className="text-3xl font-semibold text-[#1a3c34]">
                      {loading ? <span className="inline-block w-16 h-7 bg-gray-100 animate-pulse rounded" /> : stat.value}
                    </p>
                    {stat.sub && <p className="text-[11px] text-[#8aa89e] font-medium">{stat.sub}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Insight Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {insightCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#d4ebe6]/40 p-5 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#2a9d8f]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8aa89e]">{card.label}</span>
                  </div>
                  <p className="text-xl font-bold text-[#1a3c34]">
                    {loading ? <span className="inline-block w-12 h-5 bg-gray-100 animate-pulse rounded" /> : card.value}
                  </p>
                  <p className="text-[10px] text-[#8aa89e] font-medium">{card.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl border border-[#d4ebe6]/40 shadow-sm p-6 md:p-8 space-y-5">
            <div>
              <h2 className="text-xl font-serif font-semibold text-[#1a3c34]">Quick Actions</h2>
              <p className="text-[#8aa89e] text-sm mt-0.5">Jump straight to management areas.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between gap-3 p-5 rounded-2xl border border-[#d4ebe6]/60 hover:border-[#2a9d8f]/40 hover:bg-[#f0f9f6]/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#eaf5f2] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#2a9d8f]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#1a3c34] group-hover:text-[#2a9d8f] transition-colors">{link.label}</h3>
                        <p className="text-[11px] text-[#8aa89e]">{link.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8aa89e] group-hover:text-[#2a9d8f] transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

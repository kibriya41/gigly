"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getTasks } from "@/lib/actions/tasks";
import { getProposals } from "@/lib/actions/proposals";
import {
  Loader2,
  Search,
  ArrowUpDown,
  AlertTriangle,
  DollarSign,
  Calendar,
  Tag,
  BarChart3,
  Plus,
  Receipt,
  Wallet,
  CheckCircle2,
  Clock,
  CircleDot,
  CreditCard,
  X
} from "lucide-react";

// Deterministic pseudo-random status per task ID so it doesn't flicker
function getPaymentMeta(taskId, status) {
  const hash = taskId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const methods = ["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "Stripe"];
  const method = methods[hash % methods.length];

  if (status === "Completed") {
    return { paymentStatus: "Paid", paymentMethod: method };
  }
  if (status === "In Progress") {
    return { paymentStatus: "Pending", paymentMethod: method };
  }
  return { paymentStatus: "Reserved", paymentMethod: method };
}

// Extract date from task createdAt or from MongoDB ObjectId timestamp
function getTaskDate(task) {
  if (task.createdAt) return new Date(task.createdAt);
  if (task._id && task._id.length === 24) {
    try {
      const timestamp = parseInt(task._id.substring(0, 8), 16) * 1000;
      if (!isNaN(timestamp)) {
        return new Date(timestamp);
      }
    } catch (e) {
      console.error("Failed to parse timestamp from _id", e);
    }
  }
  return new Date();
}

const STATUS_STYLE = {
  Paid: "text-emerald-700 bg-emerald-50 border-emerald-100",
  Pending: "text-[#d97706] bg-[#fffbeb] border-[#fef3c7]",
  Reserved: "text-[#2a9d8f] bg-[#eaf5f2] border-[#d4ebe6]",
};

const STATUS_ICON = {
  Paid: CheckCircle2,
  Pending: Clock,
  Reserved: CircleDot,
};

export default function ClientEarningsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [tasks, setTasks] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const fetchData = async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const res = await getTasks(session.user.email);
      const proposalsRes = await getProposals({ clientEmail: session.user.email });

      if (res.success) {
        setTasks(res.data || []);
      } else {
        setError(res.message || "Failed to fetch payment history");
      }

      if (proposalsRes.success) {
        setProposals(proposalsRes.data || []);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus !== "loading") {
      fetchData();
    }
  }, [session, sessionStatus]);

  // Build payment records from tasks that have any financial commitment
  const allPayments = useMemo(() => {
    return tasks.map((task) => {
      // Check if there is an accepted bid for this task in proposals
      const acceptedBid = proposals.find(p => p.taskId === task._id && p.status === "accepted");

      const { paymentStatus, paymentMethod } = getPaymentMeta(task._id, task.status || "Open");
      
      // If there's an accepted bid, we use its amount. Otherwise, we use the task's budget.
      let amount = Number(task.budget || 0);
      let freelancerName = null;
      if (acceptedBid) {
        amount = Number(acceptedBid.amount || 0);
        freelancerName = acceptedBid.name || acceptedBid.freelancerName;
      }

      return {
        ...task,
        paymentStatus,
        paymentMethod,
        amount,
        freelancerName,
      };
    });
  }, [tasks, proposals]);

  // Summary stats
  const totalSpent = allPayments
    .filter((p) => p.paymentStatus === "Paid")
    .reduce((s, p) => s + p.amount, 0);
  const totalPending = allPayments
    .filter((p) => p.paymentStatus === "Pending")
    .reduce((s, p) => s + p.amount, 0);
  const totalReserved = allPayments
    .filter((p) => p.paymentStatus === "Reserved")
    .reduce((s, p) => s + p.amount, 0);
  const totalAll = allPayments.reduce((s, p) => s + p.amount, 0);

  const stats = [
    {
      title: "Total Budget Committed",
      value: `$${totalAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Wallet,
      iconBg: "bg-[#eaf5f2]",
      iconColor: "text-[#2a9d8f]",
      cardBg: "bg-white",
    },
    {
      title: "Paid Out",
      value: `$${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      cardBg: "bg-white",
    },
    {
      title: "Pending Release",
      value: `$${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Clock,
      iconBg: "bg-[#fffbeb]",
      iconColor: "text-[#d97706]",
      cardBg: "bg-white",
    },
    {
      title: "Open Reservations",
      value: `$${totalReserved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CreditCard,
      iconBg: "bg-[#e2f1ed]",
      iconColor: "text-[#1a3c34]",
      cardBg: "bg-[#f0f7f4]",
    },
  ];

  // Filter & sort logic
  const filteredPayments = useMemo(
    () =>
      allPayments
        .filter((p) => {
          const matchesSearch =
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus =
            statusFilter === "All" || p.paymentStatus === statusFilter;
          return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
          if (sortBy === "amount-desc") return b.amount - a.amount;
          if (sortBy === "amount-asc") return a.amount - b.amount;
          const dateA = getTaskDate(a);
          const dateB = getTaskDate(b);
          return sortBy === "oldest" ? dateA - dateB : dateB - dateA;
        }),
    [allPayments, searchTerm, statusFilter, sortBy]
  );

  // Dynamic monthly spend data grouping based on actual task creation dates and budgets
  const monthlyData = useMemo(() => {
    // Generate the last 6 months dynamically (ending in the current month)
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        month: d.toLocaleString("en-US", { month: "short" }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        amount: 0,
      });
    }

    // Accumulate budget/amount of tasks into their respective month bucket
    allPayments.forEach((payment) => {
      const paymentDate = getTaskDate(payment);
      const paymentMonth = paymentDate.getMonth();
      const paymentYear = paymentDate.getFullYear();

      // Find if this month/year is in our last 6 months bucket
      const bucket = result.find(
        (r) => r.monthNum === paymentMonth && r.year === paymentYear
      );
      if (bucket) {
        bucket.amount += payment.amount;
      }
    });

    return result.map(({ month, amount }) => ({ month, amount }));
  }, [allPayments]);

  const maxMonthly = Math.max(...monthlyData.map((d) => d.amount), 1);

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
          <p className="text-[#5a7a72] text-[15px]">
            Please sign in to view your payment history.
          </p>
          <Link
            href="/login"
            className="block w-full bg-[#1a3c34] hover:bg-[#255248] text-white py-3 rounded-xl font-medium transition-all shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] tracking-tight">
            Payment History
          </h1>
          <p className="text-[#5a7a72] mt-1.5 text-[15px]">
            Track all your spending, reservations, and payment statuses across tasks.
          </p>
        </div>
        <Link
          href="/dashboard/client/post-task"
          className="flex items-center justify-center gap-2 bg-[#1a3c34] hover:bg-[#255248] text-white px-5 py-3 rounded-full font-medium transition-all shadow-sm hover:shadow-md cursor-pointer w-fit self-start md:self-auto hover:scale-[1.02] active:scale-[0.98]"
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
              className={`p-6 rounded-2xl border border-[#d4ebe6]/50 shadow-sm flex flex-col justify-between h-[150px] transition-all hover:shadow-md ${stat.cardBg}`}
            >
              <div className={`p-2.5 rounded-xl w-fit ${stat.iconBg} ${stat.iconColor}`}>
                <Icon size={20} />
              </div>
              <div className="space-y-1 mt-4">
                <span className="text-xs font-semibold text-[#8aa89e] uppercase tracking-wider">
                  {stat.title}
                </span>
                <p className="text-2xl font-semibold text-[#1a3c34]">
                  {loading ? (
                    <span className="inline-block w-20 h-6 bg-gray-100 animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Spend Chart */}
      <div className="bg-white p-8 rounded-3xl border border-[#d4ebe6]/40 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif font-semibold text-[#1a3c34]">Monthly Spend Overview</h2>
            <p className="text-[#8aa89e] text-sm mt-0.5">Budget distribution across recent months</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#eaf5f2] text-[#2a9d8f]">
            <BarChart3 size={20} />
          </div>
        </div>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-[#8aa89e]">
                ${Math.round(d.amount / 100) * 100}
              </span>
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-[#2a9d8f] to-[#52b8ac] hover:from-[#1a3c34] hover:to-[#2a9d8f] transition-all duration-300 cursor-pointer group relative"
                style={{ height: `${(d.amount / maxMonthly) * 100}%`, minHeight: "8px" }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a3c34] text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10">
                  ${d.amount.toLocaleString()}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#5a7a72]">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-3xl border border-[#d4ebe6]/40 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#8aa89e]" />
          <input
            type="text"
            placeholder="Search by task, category, or payment method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 focus:border-[#2c7c74] focus:ring-2 focus:ring-[#2c7c74]/10 rounded-2xl text-sm outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-3.5 p-0.5 hover:bg-gray-100 rounded-full"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Status Pills & Sort */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-[#f4f8f6] p-1.5 rounded-2xl border border-[#d4ebe6]/60">
            {["All", "Paid", "Pending", "Reserved"].map((tab) => {
              const isActive = statusFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-[#1a3c34] shadow-sm font-bold"
                      : "text-[#5a7a72] hover:text-[#1a3c34]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="relative flex items-center gap-1.5 bg-[#f4f8f6] px-3.5 py-2.5 rounded-2xl border border-[#d4ebe6]/60 text-xs text-[#5a7a72] font-semibold">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#2a9d8f]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-[#1a3c34] font-bold"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Records */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#2a9d8f]" />
            <p className="text-[#8aa89e] text-sm font-medium">Fetching payment history...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold text-red-800">Unable to load payments</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="px-5 py-2 bg-red-600 text-white text-xs font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 bg-[#eaf5f2] text-[#2a9d8f] rounded-2xl flex items-center justify-center mx-auto">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1a3c34]">No Payments Found</h3>
            <p className="text-[#8aa89e] text-sm mt-1.5 px-4">
              {searchTerm || statusFilter !== "All"
                ? "No payments match your current filters."
                : "You haven't committed any budget to tasks yet. Post a task to get started."}
            </p>
          </div>
          {(searchTerm || statusFilter !== "All") ? (
            <button
              onClick={() => { setSearchTerm(""); setStatusFilter("All"); }}
              className="px-5 py-2.5 bg-[#f4f8f6] hover:bg-[#eaf5f2] border border-[#d4ebe6] text-[#1a3c34] font-semibold text-xs rounded-xl transition-all"
            >
              Reset Filters
            </button>
          ) : (
            <Link
              href="/dashboard/client/post-task"
              className="inline-flex items-center justify-center gap-2 bg-[#2a9d8f] hover:bg-[#238478] text-white px-6 py-3 rounded-full font-medium transition-all shadow-sm"
            >
              <Plus size={16} />
              Post Your First Task
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-[#f4f8f6] rounded-2xl text-[10px] font-bold uppercase tracking-widest text-[#8aa89e] border border-[#d4ebe6]/60">
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Payment Method</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1 text-center">Date</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {/* Payment Rows */}
          {filteredPayments.map((payment) => {
            const StatusIcon = STATUS_ICON[payment.paymentStatus] || CircleDot;
            return (
              <div
                key={payment._id}
                className="bg-white rounded-2xl border border-[#d4ebe6]/40 hover:border-[#2a9d8f]/30 hover:shadow-md transition-all group"
              >
                {/* Mobile View */}
                <div className="md:hidden p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <Link href={`/tasks/${payment._id}`} className="font-bold text-[#1a3c34] group-hover:text-[#2a9d8f] transition-colors hover:underline text-sm">
                        {payment.title}
                      </Link>
                      {payment.freelancerName && (
                        <div className="text-[11px] text-[#5a7a72] font-medium">
                          Freelancer: <span className="font-semibold text-[#1a3c34]">{payment.freelancerName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-[#8aa89e]">
                        <Tag className="w-3 h-3" />
                        <span>{payment.category || "General"}</span>
                        <span>•</span>
                        <CreditCard className="w-3 h-3" />
                        <span>{payment.paymentMethod}</span>
                      </div>
                    </div>
                    <span className="text-xl font-extrabold text-[#1a3c34]">
                      ${payment.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${STATUS_STYLE[payment.paymentStatus]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {payment.paymentStatus}
                    </span>
                    <span className="text-xs text-[#8aa89e] font-medium">
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:grid grid-cols-12 px-6 py-4 items-center gap-2">
                  <div className="col-span-4">
                    <Link href={`/tasks/${payment._id}`} className="font-semibold text-[#1a3c34] group-hover:text-[#2a9d8f] transition-colors hover:underline text-sm line-clamp-1">
                      {payment.title}
                    </Link>
                    {payment.freelancerName && (
                      <span className="text-[11px] text-[#5a7a72] block mt-0.5 font-medium">
                        Freelancer: <span className="font-semibold text-[#1a3c34]">{payment.freelancerName}</span>
                      </span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#eaf5f2] text-[#2a9d8f] px-2.5 py-1 rounded-lg">
                      <Tag className="w-3 h-3" />
                      {payment.category || "General"}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 text-xs text-[#5a7a72] font-medium">
                    <CreditCard className="w-3.5 h-3.5 text-[#8aa89e]" />
                    {payment.paymentMethod}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${STATUS_STYLE[payment.paymentStatus]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {payment.paymentStatus}
                    </span>
                  </div>
                  <div className="col-span-1 text-center text-xs text-[#8aa89e] font-medium">
                    {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "—"}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="font-extrabold text-[#1a3c34] text-lg">
                      ${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-[#8aa89e] font-semibold uppercase tracking-wider ml-1">USD</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary Row */}
          <div className="bg-[#f4f8f6] rounded-2xl border border-[#d4ebe6]/60 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
            <span className="text-sm font-bold text-[#5a7a72]">
              Showing {filteredPayments.length} of {allPayments.length} payment record{allPayments.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#1a3c34]">
              <span className="text-[#8aa89e] font-semibold text-xs">Filtered Total:</span>
              ${filteredPayments.reduce((s, p) => s + p.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

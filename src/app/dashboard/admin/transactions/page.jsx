"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getPayments } from "@/lib/actions/payments";
import {
  DollarSign,
  Search,
  Loader2,
  AlertTriangle,
  X,
  Receipt,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

export default function AdminTransactionsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPayments();
      if (res.success) {
        setPayments(res.data || []);
      } else {
        setError(res.message || "Failed to fetch transactions");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus !== "loading") fetchPayments();
  }, [sessionStatus]);

  const filteredPayments = payments
    .filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        (p.clientEmail || "").toLowerCase().includes(q) ||
        (p.freelancerEmail || "").toLowerCase().includes(q) ||
        (p.taskTitle || "").toLowerCase().includes(q) ||
        (p.transactionId || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || (p.paymentStatus || "paid").toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.paidAt || 0) - new Date(a.paidAt || 0));

  const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalTransactions = payments.length;

  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
      </div>
    );
  }

  const stats = [
    { title: "Total Transactions", value: totalTransactions, icon: Receipt, iconBg: "bg-[#eaf5f2] dark:bg-[#1a2435]", iconColor: "text-[#2a9d8f]" },
    { title: "Total Revenue (USD)", value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, iconBg: "bg-[#e2f1ed] dark:bg-[#1a2435]", iconColor: "text-[#1a3c34] dark:text-[#e8f4f0]" },
    { title: "Avg. Transaction", value: totalTransactions > 0 ? `$${(totalRevenue / totalTransactions).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0", icon: TrendingUp, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] dark:text-[#e8f4f0] tracking-tight">Transactions History</h1>
        <p className="text-[#5a7a72] dark:text-[#9fb3c8] mt-1.5 text-[15px]">
          A complete record of all Stripe payments processed on the platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-6 rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/50 shadow-sm flex flex-col justify-between h-[140px] bg-white dark:bg-[#131c2b]">
              <div className={`p-2.5 rounded-xl w-fit ${stat.iconBg} ${stat.iconColor}`}>
                <Icon size={20} />
              </div>
              <div className="space-y-1 mt-4">
                <span className="text-xs font-semibold text-[#8aa89e] dark:text-[#6b7e94] uppercase tracking-wider">{stat.title}</span>
                <p className="text-2xl font-semibold text-[#1a3c34] dark:text-[#e8f4f0]">
                  {loading ? <span className="inline-block w-16 h-7 bg-gray-100 animate-pulse rounded" /> : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#131c2b] p-5 rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#8aa89e] dark:text-[#6b7e94]" />
            <input
              type="text"
              placeholder="Search by client, freelancer, task, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-3 border border-gray-200 focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/10 rounded-2xl text-sm outline-none transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-4 top-3.5 p-0.5 hover:bg-gray-100 rounded-full">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-[#f4f8f6] dark:bg-[#1a2435] px-3.5 py-2.5 rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/60 text-xs text-[#5a7a72] dark:text-[#9fb3c8] font-semibold w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-[#1a3c34] dark:text-[#e8f4f0] font-bold w-full sm:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2a9d8f]" />
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-red-600 text-sm">{error}</p>
          <button onClick={fetchPayments} className="px-5 py-2 bg-red-600 text-white text-xs font-medium rounded-xl">Try Again</button>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white dark:bg-[#131c2b] rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 bg-[#eaf5f2] dark:bg-[#1a2435] text-[#2a9d8f] rounded-2xl flex items-center justify-center mx-auto">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1a3c34] dark:text-[#e8f4f0]">No Transactions Found</h3>
            <p className="text-[#8aa89e] dark:text-[#6b7e94] text-sm mt-1.5">
              {searchTerm || statusFilter !== "All"
                ? "No transactions match your current filters."
                : "No payments have been processed on the platform yet. Transactions appear here once clients pay freelancers."}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#131c2b] rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f4f8f6] dark:bg-[#1a2435] border-b border-[#d4ebe6] dark:border-[#1e293b]/60">
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8aa89e] dark:text-[#6b7e94] px-6 py-4">Task</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8aa89e] dark:text-[#6b7e94] px-6 py-4">Client</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8aa89e] dark:text-[#6b7e94] px-6 py-4">Freelancer</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8aa89e] dark:text-[#6b7e94] px-6 py-4">Amount</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8aa89e] dark:text-[#6b7e94] px-6 py-4">Date</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8aa89e] dark:text-[#6b7e94] px-6 py-4">Status</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8aa89e] dark:text-[#6b7e94] px-6 py-4">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-[#f4f8f6] dark:bg-[#1a2435]/40 transition-colors">
                    <td className="px-6 py-4 text-sm text-[#1a3c34] dark:text-[#e8f4f0] font-semibold max-w-[200px] truncate">
                      {p.taskTitle || p.taskId}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5a7a72] dark:text-[#9fb3c8]">{p.clientEmail}</td>
                    <td className="px-6 py-4 text-sm text-[#5a7a72] dark:text-[#9fb3c8]">{p.freelancerEmail}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#2a9d8f]">
                      ${Number(p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#8aa89e] dark:text-[#6b7e94]">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border text-emerald-700 bg-emerald-50 border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> {(p.paymentStatus || "paid").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#8aa89e] dark:text-[#6b7e94] font-mono">{p.transactionId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-[#f4f8f6] dark:bg-[#1a2435] border-t border-[#d4ebe6] dark:border-[#1e293b]/60 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
            <span className="text-sm font-bold text-[#5a7a72] dark:text-[#9fb3c8]">
              Showing {filteredPayments.length} of {payments.length} transactions
            </span>
            <span className="text-sm font-extrabold text-[#1a3c34] dark:text-[#e8f4f0]">
              <span className="text-[#8aa89e] dark:text-[#6b7e94] font-semibold text-xs mr-1">Total:</span>
              ${filteredPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

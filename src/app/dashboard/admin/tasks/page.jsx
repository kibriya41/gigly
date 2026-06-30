"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getTasks, deleteTask } from "@/lib/actions/tasks";
import {
  Briefcase,
  Search,
  Loader2,
  AlertTriangle,
  Trash2,
  X,
  Tag,
  DollarSign,
  Calendar,
  Filter,
  ShieldAlert,
} from "lucide-react";

export default function AdminTasksPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTasks();
      if (res.success) {
        setTasks(res.data || []);
      } else {
        setError(res.message || "Failed to fetch tasks");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus !== "loading") fetchTasks();
  }, [sessionStatus]);

  const confirmDelete = async () => {
    if (!deletingTaskId) return;
    setIsDeleting(true);
    try {
      const res = await deleteTask(deletingTaskId._id);
      if (res.success) {
        showToast("Task deleted successfully.");
        setTasks((prev) => prev.filter((t) => t._id !== deletingTaskId._id));
        setDeletingTaskId(null);
      } else {
        showToast(res.message || "Failed to delete task", "error");
      }
    } catch (err) {
      showToast("Error deleting task", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTasks = tasks
    .filter((t) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        (t.title || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.buyerEmail || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || (t.status || "Open").toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const totalTasks = tasks.length;
  const openCount = tasks.filter((t) => (t.status || "Open").toLowerCase() === "open").length;
  const inProgressCount = tasks.filter((t) => (t.status || "").toLowerCase() === "in progress").length;
  const completedCount = tasks.filter((t) => (t.status || "").toLowerCase() === "completed").length;

  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
      </div>
    );
  }

  const stats = [
    { title: "Total Tasks", value: totalTasks, icon: Briefcase, iconBg: "bg-[#eaf5f2] dark:bg-[#1a2435]", iconColor: "text-[#2a9d8f]" },
    { title: "Open", value: openCount, icon: Tag, iconBg: "bg-[#fffbeb]", iconColor: "text-[#d97706]" },
    { title: "In Progress", value: inProgressCount, icon: Loader2, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { title: "Completed", value: completedCount, icon: Calendar, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  ];

  const statusStyle = (status) => {
    const s = (status || "Open").toLowerCase();
    if (s === "open") return "text-[#d97706] bg-[#fffbeb] border-[#fef3c7]";
    if (s === "in progress") return "text-[#2a9d8f] bg-[#eaf5f2] dark:bg-[#1a2435] border-[#d4ebe6] dark:border-[#1e293b]";
    return "text-emerald-700 bg-emerald-50 border-emerald-100";
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl shadow-xl border animate-in fade-in slide-in-from-bottom-5 duration-300
          ${toast.type === "error" ? "bg-red-50 text-red-800 border-red-200" : "bg-[#eaf5f2] dark:bg-[#1a2435] text-[#1a3c34] dark:text-[#e8f4f0] border-[#d4ebe6] dark:border-[#1e293b]"}`}>
          {toast.type === "error" ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <ShieldAlert className="w-5 h-5 text-[#2a9d8f]" />}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] dark:text-[#e8f4f0] tracking-tight">Manage Tasks</h1>
        <p className="text-[#5a7a72] dark:text-[#9fb3c8] mt-1.5 text-[15px]">
          Review every task on the platform. Delete listings that violate safety guidelines.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
                  {loading ? <span className="inline-block w-12 h-6 bg-gray-100 animate-pulse rounded" /> : stat.value}
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
              placeholder="Search by title, description, or client email..."
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
            <Filter className="w-3.5 h-3.5 text-[#2a9d8f]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-[#1a3c34] dark:text-[#e8f4f0] font-bold w-full sm:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2a9d8f]" />
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={fetchTasks} className="px-5 py-2 bg-red-600 text-white text-xs font-medium rounded-xl">Try Again</button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-[#131c2b] rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 bg-[#eaf5f2] dark:bg-[#1a2435] text-[#2a9d8f] rounded-2xl flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1a3c34] dark:text-[#e8f4f0]">No Tasks Found</h3>
            <p className="text-[#8aa89e] dark:text-[#6b7e94] text-sm mt-1.5">No tasks match your current filters.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const taskStatus = task.status || "Open";
            return (
              <div key={task._id} className="bg-white dark:bg-[#131c2b] rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 p-6 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#eaf5f2] dark:bg-[#1a2435] text-[#2a9d8f] border border-[#d4ebe6] dark:border-[#1e293b]/50">
                        <Tag className="w-3 h-3" /> {task.category || "General"}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusStyle(taskStatus)}`}>
                        {taskStatus}
                      </span>
                    </div>
                    <Link href={`/tasks/${task._id}`} className="font-bold text-lg text-[#1a3c34] dark:text-[#e8f4f0] hover:text-[#2a9d8f] transition-colors block">
                      {task.title}
                    </Link>
                    <p className="text-sm text-[#5a7a72] dark:text-[#9fb3c8] line-clamp-2">{task.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#8aa89e] dark:text-[#6b7e94] font-medium pt-1">
                      <span>Client: <span className="text-[#1a3c34] dark:text-[#e8f4f0] font-bold">{task.buyerEmail}</span></span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-[#2a9d8f]" />
                        <span className="text-[#1a3c34] dark:text-[#e8f4f0] font-bold">${Number(task.budget || 0).toLocaleString()}</span>
                      </span>
                      {task.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#2a9d8f]" />
                          <span className="text-[#1a3c34] dark:text-[#e8f4f0] font-bold">{new Date(task.deadline).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setDeletingTaskId(task)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-red-200 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="bg-[#f4f8f6] dark:bg-[#1a2435] rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/60 px-6 py-4">
            <span className="text-sm font-bold text-[#5a7a72] dark:text-[#9fb3c8]">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#131c2b] w-full max-w-md rounded-3xl shadow-2xl border border-red-100 p-6 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-red-950">Delete Task</h3>
                <p className="text-xs text-[#8aa89e] dark:text-[#6b7e94] mt-0.5">This action is permanent and cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-[#5a7a72] dark:text-[#9fb3c8] leading-relaxed">
              Are you sure you want to delete <strong>&ldquo;{deletingTaskId.title}&rdquo;</strong>? It will be removed from all listings and dashboards.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setDeletingTaskId(null)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#5a7a72] dark:text-[#9fb3c8] hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={isDeleting} className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

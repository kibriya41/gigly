"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getPaginatedTasks } from "@/lib/actions/tasks";
import {
  Search,
  Tag,
  Calendar,
  DollarSign,
  Briefcase,
  X,
  Loader2,
  AlertTriangle,
  ArrowRight,
  User,
  Zap,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const CATEGORIES = ["Design", "Writing", "Development", "Marketing", "Other"];

// Theme configuration matching client dashboard
const THEME = {
  primary: "var(--text-strong, #1a3c34)",
  primaryHover: "var(--color-primary-dark, #255248)",
  accent: "var(--color-primary, #2a9d8f)",
  accentHover: "var(--color-primary-dark, #238478)",
  lightAccent: "var(--bg-muted, #eaf5f2)",
  bg: "var(--bg-page, #f4f8f6)",
  cardBg: "var(--bg-surface, #ffffff)",
  textPrimary: "var(--text-strong, #1a3c34)",
  textSecondary: "var(--text-body, #5a7a72)",
  textMuted: "var(--text-muted, #8aa89e)",
  border: "var(--border-soft, #d4ebe6)",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
  shadowHover: "0 4px 12px rgba(42, 157, 143, 0.08)",
};

const PAGE_SIZE = 9; // Challenge 3: max 9 task documents per query

export default function BrowseTasksPage() {
  const { data: session } = useSession();

  // ── Data state ──
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Pagination state (server-driven) ──
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // ── Filter state (Challenge 1: search + category) ──
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Debounce the search box so we don't fire a request on every keystroke.
  // This keeps filtering live (Challenge 1 Part A) while staying efficient.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Server-side fetch (Challenge 3) ──
  const fetchTasks = useCallback(
    async (opts = {}) => {
      const targetPage = opts.page ?? page;
      setLoading(true);
      setError(null);
      try {
        const response = await getPaginatedTasks({
          page: targetPage,
          limit: PAGE_SIZE,
          search: debouncedSearch,
          category: selectedCategory,
        });
        if (response?.success) {
          const d = response.data || {};
          setTasks(d.tasks || []);
          setTotalPages(d.totalPages || 1);
          setTotal(d.total || 0);
          setHasNextPage(!!d.hasNextPage);
          setHasPrevPage(!!d.hasPrevPage);
        } else {
          setError(response?.message || "Failed to fetch tasks");
        }
      } catch (err) {
        setError(err.message || "An error occurred while loading tasks");
      } finally {
        setLoading(false);
      }
    },
    [page, debouncedSearch, selectedCategory]
  );

  // Load whenever page / search / category changes — these are the query inputs
  // the backend pagination endpoint consumes.
  useEffect(() => {
    fetchTasks({ page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, selectedCategory]);

  // Whenever a filter changes, jump back to page 1 so the offset stays valid
  // (Challenge 3: keep pagination correct when search/category change).
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedCategory("All");
    setPage(1);
  };

  const goToPage = (p) => {
    const target = Math.min(Math.max(p, 1), totalPages);
    setPage(target);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const hasActiveFilters = debouncedSearch !== "" || selectedCategory !== "All";

  // Page number buttons (e.g. 1 2 3 … ) with simple windowing
  const pageNumbers = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: THEME.bg }}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Banner Section */}
        <div className="bg-gradient-to-br from-[#1a3c34] to-[#255248] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg border border-[#d4ebe6] dark:border-slate-800/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2a9d8f]/20 text-[#2a9d8f] border border-[#2a9d8f]/30">
              <Zap className="w-3.5 h-3.5" />
              Micro-Task Marketplace
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-tight">
              Find Your Next Gig
            </h1>
            <p className="text-emerald-100/80 text-base sm:text-lg">
              Explore open tasks posted by clients, filter by your expertise, and make proposals to earn money instantly.
            </p>
          </div>
        </div>

        {/* Search & Categories Bar */}
        <div className="bg-white dark:bg-[#131c2b] p-6 rounded-3xl border border-[#d4ebe6] dark:border-slate-800/40 shadow-sm space-y-6">
          {/* Main Row: Search + Refresh */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search (Challenge 1 Part A — live title/description search) */}
            <div className="relative w-full lg:max-w-xl">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#8aa89e] dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks by title or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 border border-gray-200 dark:border-slate-700 focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/10 rounded-2xl text-sm outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-3.5 p-0.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <button
              onClick={() => fetchTasks({ page })}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-transparent hover:bg-[#eaf5f2] dark:bg-teal-950/30 border border-[#d4ebe6] dark:border-slate-800 text-[#1a3c34] dark:text-slate-100 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer w-full sm:w-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-[#2a9d8f] ${loading ? "animate-spin" : ""}`} />
              <span className="sm:hidden lg:inline">Refresh</span>
            </button>
          </div>

          {/* Category Dropdown (Challenge 1 Part B) */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8aa89e] dark:text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#2a9d8f]" /> Category
            </span>
            <div className="flex items-center gap-1.5 bg-transparent px-4 py-2 rounded-2xl border border-[#d4ebe6] dark:border-slate-800/60 text-sm text-[#5a7a72] dark:text-slate-300 font-semibold">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent outline-none cursor-pointer text-[#1a3c34] dark:text-slate-100 font-bold"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Quick category pills */}
            <div className="flex flex-wrap gap-2">
              {["All", ...CATEGORIES].map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#1a3c34] text-white shadow-sm font-semibold hover:bg-[#255248]"
                        : "bg-transparent text-[#5a7a72] dark:text-slate-300 hover:text-[#1a3c34] dark:text-slate-100 hover:bg-[#eaf5f2] dark:bg-teal-950/30"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="ml-auto text-xs font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="bg-[#eaf5f2] dark:bg-teal-950/30 border border-[#d4ebe6] dark:border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-[#1a3c34] dark:text-slate-100 font-medium">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">Active filters:</span>
              {selectedCategory !== "All" && (
                <span className="bg-white dark:bg-[#131c2b] px-2 py-1 rounded-lg border border-[#d4ebe6] dark:border-slate-800">Category: {selectedCategory}</span>
              )}
              {debouncedSearch && (
                <span className="bg-white dark:bg-[#131c2b] px-2 py-1 rounded-lg border border-[#d4ebe6] dark:border-slate-800">Search: &quot;{debouncedSearch}&quot;</span>
              )}
            </div>
            <button onClick={handleResetFilters} className="font-bold hover:underline text-[#2a9d8f] cursor-pointer">
              Reset All
            </button>
          </div>
        )}

        {/* Results count */}
        {!loading && !error && (
          <p className="text-sm text-[#8aa89e] dark:text-slate-400 font-medium px-1">
            Showing{" "}
            <span className="font-bold text-[#1a3c34] dark:text-slate-100">{tasks.length}</span> of{" "}
            <span className="font-bold text-[#1a3c34] dark:text-slate-100">{total}</span> open task{total !== 1 ? "s" : ""}
            {hasActiveFilters ? " matching your filters" : ""}
          </p>
        )}

        {/* Tasks Grid / states */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
              <p className="text-[#5a7a72] dark:text-slate-300 font-semibold text-sm">Searching the marketplace...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold text-red-800">Connection Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => fetchTasks({ page })}
              className="px-6 py-2.5 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
            >
              Try Reconnecting
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white dark:bg-[#131c2b] rounded-3xl border border-[#d4ebe6] dark:border-slate-800/40 p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
            <div className="w-16 h-16 bg-[#eaf5f2] dark:bg-teal-950/30 text-[#2a9d8f] rounded-2xl flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-[#1a3c34] dark:text-slate-100">No Open Gigs Found</h3>
              <p className="text-[#8aa89e] dark:text-slate-400 text-sm px-4">
                There are no matching open gigs at the moment. Try resetting your search filters or browse other categories.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-6 py-3 bg-transparent hover:bg-[#eaf5f2] dark:bg-teal-950/30 border border-[#d4ebe6] dark:border-slate-800 text-[#1a3c34] dark:text-slate-100 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Tasks List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tasks.map((task) => {
                const taskStatus = task.status || "Open";
                const statusStyle =
                  taskStatus.toLowerCase() === "open"
                    ? "text-[#d97706] bg-[#fffbeb] border-[#fef3c7]"
                    : "text-[#2a9d8f] bg-[#eaf5f2] dark:bg-teal-950/30 border-[#d4ebe6] dark:border-slate-800";

                return (
                  <div
                    key={task._id}
                    className="bg-white dark:bg-[#131c2b] rounded-3xl border border-[#d4ebe6] dark:border-slate-800/40 p-6 md:p-7 hover:shadow-md hover:border-[#2a9d8f]/30 transition-all relative overflow-hidden group flex flex-col"
                  >
                    {/* Top Row */}
                    <div>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eaf5f2] dark:bg-teal-950/30 text-[#2a9d8f] border border-[#d4ebe6] dark:border-slate-800/50">
                              <Tag className="w-3 h-3" />
                              {task.category || "General"}
                            </span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle}`}>
                              {taskStatus}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-[#1a3c34] dark:text-slate-100 tracking-tight group-hover:text-[#2a9d8f] transition-colors line-clamp-2 break-words [word-break:break-word]">
                            {task.title}
                          </h3>
                        </div>

                        {/* Budget */}
                        <div className="bg-[#f0f7f4] border border-[#d4ebe6] dark:border-slate-800/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0">
                          <DollarSign className="w-4 h-4 text-[#2a9d8f]" />
                          <span className="font-extrabold text-[#1a3c34] dark:text-slate-100 text-base">
                            {Number(task.budget || 0).toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-[10px] text-[#8aa89e] dark:text-slate-400 font-semibold uppercase tracking-wider">USD</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mt-4 text-[#5a7a72] dark:text-slate-300 text-sm leading-relaxed line-clamp-3 break-words [word-break:break-word]">
                        {task.description}
                      </p>
                    </div>

                    {/* Lower Row */}
                    <div className="mt-auto pt-5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                      {/* Buyer profile */}
                      <div className="flex items-center gap-2.5">
                        {task.buyerImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={task.buyerImage}
                            alt={task.buyerName || "Client"}
                            className="w-9 h-9 rounded-full border border-[#d4ebe6] dark:border-slate-800 object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#eaf5f2] dark:bg-teal-950/30 text-[#2a9d8f] flex items-center justify-center border border-[#d4ebe6] dark:border-slate-800">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold text-[#1a3c34] dark:text-slate-100">{task.buyerName || "Anonymous Client"}</span>
                          <span className="text-[10px] text-[#8aa89e] dark:text-slate-400">Client</span>
                        </div>
                      </div>

                      {/* Deadline */}
                      <div className="flex items-center gap-1.5 text-xs text-[#8aa89e] dark:text-slate-400 font-medium">
                        <Calendar className="w-4 h-4 text-[#2a9d8f]" />
                        <span>
                          {task.deadline
                            ? new Date(task.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                            : "Flexible"}
                        </span>
                      </div>

                      {/* Action Button */}
                      <Link
                        href={`/tasks/${task._id}`}
                        className="inline-flex items-center justify-center gap-1.5 bg-[#1a3c34] hover:bg-[#255248] text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm group-hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        <span>Apply</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Pagination Controls (Challenge 3) ── */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#131c2b] rounded-2xl border border-[#d4ebe6] dark:border-slate-800/40 p-4 shadow-sm">
                <p className="text-xs text-[#8aa89e] dark:text-slate-400 font-medium">
                  Page <span className="font-bold text-[#1a3c34] dark:text-slate-100">{page}</span> of{" "}
                  <span className="font-bold text-[#1a3c34] dark:text-slate-100">{totalPages}</span>
                </p>

                <div className="flex items-center gap-1.5">
                  {/* Previous */}
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={!hasPrevPage || loading}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold border border-[#d4ebe6] dark:border-slate-800 bg-white dark:bg-[#131c2b] text-[#1a3c34] dark:text-slate-100 hover:bg-[#f0f9f6] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>

                  {/* Numbered pages */}
                  {start > 1 && (
                    <>
                      <button
                        onClick={() => goToPage(1)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          page === 1
                            ? "bg-[#1a3c34] text-white shadow-sm"
                            : "border border-[#d4ebe6] dark:border-slate-800 bg-white dark:bg-[#131c2b] text-[#1a3c34] dark:text-slate-100 hover:bg-[#f0f9f6]"
                        }`}
                      >
                        1
                      </button>
                      {start > 2 && <span className="px-1 text-[#8aa89e] dark:text-slate-400">…</span>}
                    </>
                  )}

                  {pageNumbers.map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        p === page
                          ? "bg-[#1a3c34] text-white shadow-sm"
                          : "border border-[#d4ebe6] dark:border-slate-800 bg-white dark:bg-[#131c2b] text-[#1a3c34] dark:text-slate-100 hover:bg-[#f0f9f6]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  {end < totalPages && (
                    <>
                      {end < totalPages - 1 && <span className="px-1 text-[#8aa89e] dark:text-slate-400">…</span>}
                      <button
                        onClick={() => goToPage(totalPages)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          page === totalPages
                            ? "bg-[#1a3c34] text-white shadow-sm"
                            : "border border-[#d4ebe6] dark:border-slate-800 bg-white dark:bg-[#131c2b] text-[#1a3c34] dark:text-slate-100 hover:bg-[#f0f9f6]"
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  {/* Next */}
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={!hasNextPage || loading}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold border border-[#d4ebe6] dark:border-slate-800 bg-white dark:bg-[#131c2b] text-[#1a3c34] dark:text-slate-100 hover:bg-[#f0f9f6] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

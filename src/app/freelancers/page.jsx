"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { getAllUsers } from "@/lib/actions/users";
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  Loader2,
  AlertTriangle,
  Users,
  DollarSign,
  Briefcase,
  Zap,
  BadgeCheck,
  Star,
  ArrowRight,
  Heart,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Scale,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

const SUGGESTED_SKILLS = [
  "React", "Next.js", "TypeScript", "Figma", "UI/UX", "Node.js",
  "Python", "SEO", "Content Writing", "Logo Design", "Branding",
  "Social Media", "WordPress", "Shopify", "Illustration", "3D Modeling",
  "Video Editing", "Copywriting",
];

const PAGE_SIZE = 9;
const MAX_COMPARE = 3;
const RECENT_SEARCH_KEY = "freelancer-recent-searches";

function StarRow({ rating, size = "w-3.5 h-3.5" }) {
  const num = parseFloat(rating) || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= Math.floor(num);
        const half = !filled && s - 0.5 <= num;
        return (
          <svg key={s} className={`${size} ${filled || half ? "text-amber-400" : "text-gray-200"}`}
            fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#131c2b] rounded-3xl border border-[#d4ebe6] dark:border-slate-800/40 p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 bg-gray-100 dark:bg-slate-800 rounded" />
          <div className="h-3 w-1/3 bg-gray-100 dark:bg-slate-800 rounded" />
        </div>
      </div>
      <div className="mt-4 h-3 w-1/2 bg-gray-100 dark:bg-slate-800 rounded" />
      <div className="mt-3 space-y-1.5">
        <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-800 rounded" />
        <div className="h-2.5 w-4/5 bg-gray-100 dark:bg-slate-800 rounded" />
      </div>
      <div className="mt-4 flex gap-1.5">
        <div className="h-5 w-14 bg-gray-100 dark:bg-slate-800 rounded-lg" />
        <div className="h-5 w-14 bg-gray-100 dark:bg-slate-800 rounded-lg" />
      </div>
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 h-8 bg-gray-50 dark:bg-slate-800/50 rounded-xl" />
    </div>
  );
}

export default function BrowseFreelancersPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 250);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [skillSuggestionsOpen, setSkillSuggestionsOpen] = useState(false);
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("rating-desc");
  const [viewMode, setViewMode] = useState("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [favorites, setFavorites] = useState(() => new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const skillInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadFreelancers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllUsers();
        if (!isMounted) return;
        if (response?.success) {
          const all = response.data || [];
          setFreelancers(all.filter((u) => u.role === "freelancer" && !u.isBlocked));
        } else {
          setError(response?.message || "Failed to fetch freelancers");
        }
      } catch (err) {
        if (isMounted) setError(err.message || "An error occurred while loading freelancers");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadFreelancers();
    return () => { isMounted = false; };
  }, []);

  // Load favorites from memory-safe state only (no localStorage per sandbox constraints)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, selectedSkills, minRate, maxRate, minRating, sortBy, showFavoritesOnly]);

  const allSkillsInData = useMemo(() => {
    const set = new Set();
    freelancers.forEach((f) => (f.skills || []).forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [freelancers]);

  const skillSuggestions = useMemo(() => {
    const pool = allSkillsInData.length ? allSkillsInData : SUGGESTED_SKILLS;
    const q = skillInput.trim().toLowerCase();
    return pool
      .filter((s) => !selectedSkills.includes(s))
      .filter((s) => !q || s.toLowerCase().includes(q))
      .slice(0, 8);
  }, [allSkillsInData, skillInput, selectedSkills]);

  const handleAddSkill = useCallback((skill) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
    setSkillSuggestionsOpen(false);
  }, [selectedSkills]);

  const handleRemoveSkill = (s) => setSelectedSkills(selectedSkills.filter((x) => x !== s));

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (skillSuggestions[0] && skillInput.trim()) {
        handleAddSkill(skillSuggestions[0]);
      } else {
        handleAddSkill(skillInput);
      }
    } else if (e.key === "Backspace" && !skillInput && selectedSkills.length) {
      handleRemoveSkill(selectedSkills[selectedSkills.length - 1]);
    } else if (e.key === "Escape") {
      setSkillSuggestionsOpen(false);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCompare = (freelancer) => {
    const id = freelancer._id || freelancer.email;
    setCompareList((prev) => {
      const exists = prev.find((f) => (f._id || f.email) === id);
      if (exists) return prev.filter((f) => (f._id || f.email) !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, freelancer];
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedSkills([]);
    setSkillInput("");
    setMinRate("");
    setMaxRate("");
    setMinRating(0);
    setSortBy("rating-desc");
    setShowFavoritesOnly(false);
  };

  const filteredFreelancers = useMemo(() => {
    return freelancers
      .filter((f) => {
        const id = f._id || f.email;
        const q = debouncedSearch.toLowerCase();
        const matchesSearch =
          !q ||
          (f.name || "").toLowerCase().includes(q) ||
          (f.bio || "").toLowerCase().includes(q) ||
          (f.skills || []).some((s) => s.toLowerCase().includes(q));

        const rate = Number(f.hirePrice || 0);
        const matchesMinRate = minRate === "" || rate >= Number(minRate);
        const matchesMaxRate = maxRate === "" || rate <= Number(maxRate);

        const matchesSkills =
          selectedSkills.length === 0 ||
          (f.skills &&
            selectedSkills.every((fs) =>
              f.skills.some((ts) => ts.toLowerCase() === fs.toLowerCase())
            ));

        const matchesRating = (Number(f.avgRating) || 0) >= minRating;
        const matchesFavorite = !showFavoritesOnly || favorites.has(id);

        return (
          matchesSearch &&
          matchesMinRate &&
          matchesMaxRate &&
          matchesSkills &&
          matchesRating &&
          matchesFavorite
        );
      })
      .sort((a, b) => {
        if (sortBy === "rate-asc") return Number(a.hirePrice || 0) - Number(b.hirePrice || 0);
        if (sortBy === "rate-desc") return Number(b.hirePrice || 0) - Number(a.hirePrice || 0);
        if (sortBy === "rating-desc") return (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0);
        if (sortBy === "rating-asc") return (Number(a.avgRating) || 0) - (Number(b.avgRating) || 0);
        if (sortBy === "reviews-desc") return (Number(b.ratingCount) || 0) - (Number(a.ratingCount) || 0);
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [
    freelancers,
    debouncedSearch,
    selectedSkills,
    minRate,
    maxRate,
    minRating,
    sortBy,
    showFavoritesOnly,
    favorites,
  ]);

  const visibleFreelancers = filteredFreelancers.slice(0, visibleCount);
  const hasMore = visibleCount < filteredFreelancers.length;

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedSkills.length > 0 ||
    minRate !== "" ||
    maxRate !== "" ||
    minRating > 0 ||
    showFavoritesOnly;

  const currencyFmt = (n) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);

  const FilterPanel = (
    <div className="bg-white dark:bg-[#131c2b] p-6 rounded-3xl border border-[#d4ebe6] dark:border-slate-800/40 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
        <h2 className="text-base font-bold flex items-center gap-2 text-[#1a3c34] dark:text-slate-100">
          <Filter className="w-4 h-4 text-[#2a9d8f]" />
          Filters
        </h2>
        {hasActiveFilters && (
          <button onClick={handleResetFilters}
            className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Favorites toggle */}
      <button
        onClick={() => setShowFavoritesOnly((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
          showFavoritesOnly
            ? "bg-[#1a3c34] border-[#1a3c34] text-white"
            : "bg-transparent border-gray-200 dark:border-slate-700 text-[#5a7a72] dark:text-slate-300 hover:border-[#2a9d8f]"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? "fill-white" : ""}`} />
          Saved Only
        </span>
        {favorites.size > 0 && (
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${showFavoritesOnly ? "bg-white/20" : "bg-[#eaf5f2] dark:bg-teal-950/30 text-[#2a9d8f]"}`}>
            {favorites.size}
          </span>
        )}
      </button>

      {/* Hire Rate Filter */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8aa89e] dark:text-slate-400">
          Hire Rate (USD/hr)
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-[#8aa89e] dark:text-slate-400 font-semibold">$</span>
            <input type="number" min="0" placeholder="Min" value={minRate}
              onChange={(e) => setMinRate(e.target.value)}
              className="w-full pl-6 pr-2 py-2 border border-gray-200 dark:border-slate-700 focus:border-[#2a9d8f] rounded-xl text-xs outline-none bg-white dark:bg-[#131c2b]" />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-[#8aa89e] dark:text-slate-400 font-semibold">$</span>
            <input type="number" min="0" placeholder="Max" value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
              className="w-full pl-6 pr-2 py-2 border border-gray-200 dark:border-slate-700 focus:border-[#2a9d8f] rounded-xl text-xs outline-none bg-white dark:bg-[#131c2b]" />
          </div>
        </div>
      </div>

      {/* Minimum Rating Filter */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8aa89e] dark:text-slate-400">
          Minimum Rating
        </h3>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                minRating === r
                  ? "bg-[#2a9d8f] border-[#2a9d8f] text-white"
                  : "bg-transparent border-gray-200 dark:border-slate-700 text-[#5a7a72] dark:text-slate-300 hover:border-[#2a9d8f]"
              }`}
            >
              {r === 0 ? "Any" : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Filter */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8aa89e] dark:text-slate-400">
          Filter by Skills
        </h3>
        <div className="relative">
          <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-2 bg-white dark:bg-[#131c2b] focus-within:border-[#2a9d8f] transition-all">
            <div className="flex flex-wrap gap-1.5 items-center">
              {selectedSkills.map((skill) => (
                <span key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#eaf5f2] dark:bg-teal-950/30 text-[#2a9d8f]">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)}
                    className="hover:bg-white dark:hover:bg-[#131c2b]/50 rounded-full p-0.5">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <input
                ref={skillInputRef}
                type="text"
                placeholder={selectedSkills.length === 0 ? "e.g. React, Python..." : "Add..."}
                value={skillInput}
                onChange={(e) => { setSkillInput(e.target.value); setSkillSuggestionsOpen(true); }}
                onFocus={() => setSkillSuggestionsOpen(true)}
                onBlur={() => setTimeout(() => setSkillSuggestionsOpen(false), 120)}
                onKeyDown={handleSkillKeyDown}
                className="flex-1 min-w-[70px] px-1 py-1 outline-none text-xs bg-transparent"
              />
            </div>
          </div>
          {skillSuggestionsOpen && skillSuggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white dark:bg-[#131c2b] border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {skillSuggestions.map((skill) => (
                <button
                  key={skill}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAddSkill(skill)}
                  className="w-full text-left px-3 py-2 text-xs text-[#1a3c34] dark:text-slate-200 hover:bg-[#eaf5f2] dark:hover:bg-teal-950/30 transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedSkills.length < 5 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#8aa89e] dark:text-slate-400 uppercase block">Popular:</span>
            <div className="flex flex-wrap gap-1">
              {(allSkillsInData.length ? allSkillsInData : SUGGESTED_SKILLS)
                .filter((s) => !selectedSkills.includes(s))
                .slice(0, 8)
                .map((skill) => (
                  <button key={skill} onClick={() => handleAddSkill(skill)}
                    className="text-[10px] bg-transparent hover:bg-[#eaf5f2] dark:hover:bg-teal-950/30 text-[#5a7a72] dark:text-slate-300 px-2.5 py-1 rounded-lg transition-colors border border-gray-50 dark:border-slate-800">
                    + {skill}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-[#1a3c34] to-[#255248] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2a9d8f]/20 text-[#2a9d8f] border border-[#2a9d8f]/30">
              <Zap className="w-3.5 h-3.5" />
              Talent Marketplace
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-tight">
              Browse Freelancers
            </h1>
            <p className="text-emerald-100/80 text-base sm:text-lg">
              Discover skilled professionals ready to bring your projects to life. Filter by skill,
              rate, and expertise to find your perfect match.
            </p>
            <div className="flex items-center gap-6 pt-2 text-sm text-emerald-200/70 font-medium flex-wrap">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#2a9d8f]" />
                {loading ? "..." : freelancers.length} freelancers available
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                Rated & reviewed
              </span>
              {favorites.size > 0 && (
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
                  {favorites.size} saved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="bg-white dark:bg-[#131c2b] p-5 rounded-3xl border border-[#d4ebe6] dark:border-slate-800/40 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-xl">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#8aa89e] dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, skills, bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 border border-gray-200 dark:border-slate-700 focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/10 rounded-2xl text-sm outline-none transition-all bg-white dark:bg-[#131c2b]"
              />
              {searchTerm !== debouncedSearch && searchTerm && (
                <Loader2 className="absolute right-10 top-3.5 w-4 h-4 animate-spin text-[#2a9d8f]" />
              )}
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-3.5 p-0.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFiltersOpen((v) => !v)}
                className="lg:hidden flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-[#d4ebe6] dark:border-slate-800/60 text-sm font-bold text-[#1a3c34] dark:text-slate-100"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#2a9d8f]" />
                Filters
                {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#2a9d8f]" />}
              </button>

              {/* View toggle */}
              <div className="hidden sm:flex items-center bg-transparent border border-[#d4ebe6] dark:border-slate-800/60 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-xl transition-colors ${viewMode === "grid" ? "bg-[#1a3c34] text-white" : "text-[#8aa89e] dark:text-slate-400"}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-xl transition-colors ${viewMode === "list" ? "bg-[#1a3c34] text-white" : "text-[#8aa89e] dark:text-slate-400"}`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 bg-transparent px-4 py-3 rounded-2xl border border-[#d4ebe6] dark:border-slate-800/60 text-sm text-[#5a7a72] dark:text-slate-300 font-semibold">
                <ArrowUpDown className="w-4 h-4 text-[#2a9d8f]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer text-[#1a3c34] dark:text-slate-100 font-bold"
                >
                  <option value="rating-desc">⭐ Top Rated First</option>
                  <option value="reviews-desc">Most Reviewed</option>
                  <option value="name-asc">Name: A → Z</option>
                  <option value="rate-asc">Rate: Low to High</option>
                  <option value="rate-desc">Rate: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Filter Sidebar (desktop) */}
          <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-6">
            {FilterPanel}
          </div>

          {/* Filter Sidebar (mobile, collapsible) */}
          {mobileFiltersOpen && (
            <div className="lg:hidden col-span-1">{FilterPanel}</div>
          )}

          {/* Freelancer Cards */}
          <div className="lg:col-span-9 space-y-6">

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="bg-[#eaf5f2] dark:bg-teal-950/30 border border-[#d4ebe6] dark:border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-[#1a3c34] dark:text-slate-100 font-medium">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">Active filters:</span>
                  {searchTerm && (
                    <span className="bg-white dark:bg-[#131c2b] px-2 py-1 rounded-lg border border-[#d4ebe6] dark:border-slate-800">
                      Search: &ldquo;{searchTerm}&rdquo;
                    </span>
                  )}
                  {(minRate || maxRate) && (
                    <span className="bg-white dark:bg-[#131c2b] px-2 py-1 rounded-lg border border-[#d4ebe6] dark:border-slate-800">
                      Rate: ${minRate || "0"} – ${maxRate || "∞"}/hr
                    </span>
                  )}
                  {minRating > 0 && (
                    <span className="bg-white dark:bg-[#131c2b] px-2 py-1 rounded-lg border border-[#d4ebe6] dark:border-slate-800">
                      Rating: {minRating}+
                    </span>
                  )}
                  {showFavoritesOnly && (
                    <span className="bg-white dark:bg-[#131c2b] px-2 py-1 rounded-lg border border-[#d4ebe6] dark:border-slate-800">
                      Saved only
                    </span>
                  )}
                  {selectedSkills.map((s) => (
                    <span key={s} className="bg-white dark:bg-[#131c2b] px-2 py-1 rounded-lg border border-[#d4ebe6] dark:border-slate-800 flex items-center gap-1">
                      Skill: {s}
                      <button onClick={() => handleRemoveSkill(s)} className="text-gray-400 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
                <button onClick={handleResetFilters} className="font-bold hover:underline text-[#2a9d8f]">
                  Reset All
                </button>
              </div>
            )}

            {/* Results Count */}
            {!loading && !error && (
              <p className="text-sm text-[#8aa89e] dark:text-slate-400 font-medium px-1">
                Showing{" "}
                <span className="font-bold text-[#1a3c34] dark:text-slate-100">{visibleFreelancers.length}</span>
                {" "}of{" "}
                <span className="font-bold text-[#1a3c34] dark:text-slate-100">{filteredFreelancers.length}</span>{" "}
                freelancer{filteredFreelancers.length !== 1 ? "s" : ""}
                {hasActiveFilters ? " matching your filters" : ""}
              </p>
            )}

            {/* States */}
            {loading ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" : "space-y-4"}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-red-800">Connection Error</h3>
                <p className="text-red-600 text-sm">{error}</p>
                <button onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors">
                  Try Reconnecting
                </button>
              </div>
            ) : filteredFreelancers.length === 0 ? (
              <div className="bg-white dark:bg-[#131c2b] rounded-3xl border border-[#d4ebe6] dark:border-slate-800/40 p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
                <div className="w-16 h-16 bg-[#eaf5f2] dark:bg-teal-950/30 text-[#2a9d8f] rounded-2xl flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-[#1a3c34] dark:text-slate-100">No Freelancers Found</h3>
                  <p className="text-[#8aa89e] dark:text-slate-400 text-sm px-4">
                    No freelancers match your current filters. Try adjusting your search or clearing filters.
                  </p>
                </div>
                <button onClick={handleResetFilters}
                  className="px-6 py-3 bg-transparent hover:bg-[#eaf5f2] dark:hover:bg-teal-950/30 border border-[#d4ebe6] dark:border-slate-800 text-[#1a3c34] dark:text-slate-100 font-bold text-xs rounded-xl transition-all">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                  : "space-y-4"
                }>
                  {visibleFreelancers.map((freelancer) => {
                    const id = freelancer._id || freelancer.email;
                    const avgRating = Number(freelancer.avgRating) || 0;
                    const ratingCount = Number(freelancer.ratingCount) || 0;
                    const skills = freelancer.skills || [];
                    const rate = Number(freelancer.hirePrice || 0);
                    const isFav = favorites.has(id);
                    const isComparing = compareList.some((f) => (f._id || f.email) === id);
                    const isList = viewMode === "list";

                    return (
                      <div
                        key={id}
                        className={`bg-white dark:bg-[#131c2b] rounded-3xl border ${isComparing ? "border-[#2a9d8f]" : "border-[#d4ebe6] dark:border-slate-800/40"} p-6 hover:shadow-lg hover:border-[#2a9d8f]/30 transition-all group relative overflow-hidden ${isList ? "flex flex-col sm:flex-row sm:items-center gap-5" : "flex flex-col"}`}
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#eaf5f2] to-transparent rounded-bl-3xl opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        {/* Favorite button */}
                        <button
                          onClick={() => toggleFavorite(id)}
                          className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 transition-colors"
                          aria-label={isFav ? "Remove from saved" : "Save freelancer"}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500" : "text-gray-300"}`} />
                        </button>

                        {/* Avatar & Name */}
                        <div className={`flex items-start gap-4 relative z-10 ${isList ? "sm:w-64 shrink-0" : ""}`}>
                          {freelancer.image ? (
                            <img src={freelancer.image} alt={freelancer.name}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#d4ebe6] dark:border-slate-800 group-hover:border-[#2a9d8f]/40 transition-all shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#eaf5f2] to-[#d4ebe6] flex items-center justify-center border-2 border-[#d4ebe6] dark:border-slate-800 shrink-0 text-[#1a3c34] font-bold text-xl">
                              {(freelancer.name || "?")[0].toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-[15px] font-bold text-[#1a3c34] dark:text-slate-100 truncate group-hover:text-[#2a9d8f] transition-colors">
                                {freelancer.name || "Anonymous"}
                              </h3>
                              <BadgeCheck className="w-4 h-4 text-[#2a9d8f] shrink-0" />
                            </div>
                            <span className="text-xs font-semibold text-[#2a9d8f] bg-[#eaf5f2] dark:bg-teal-950/30 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                              Freelancer
                            </span>
                            <div className="mt-1.5 flex items-center gap-2">
                              <StarRow rating={avgRating} />
                              <span className="text-xs font-bold text-[#1a3c34] dark:text-slate-100">
                                {avgRating > 0 ? avgRating.toFixed(1) : "New"}
                              </span>
                              <span className="text-[10px] text-[#8aa89e] dark:text-slate-400">
                                {ratingCount > 0 ? `(${ratingCount})` : "(0)"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={isList ? "flex-1 min-w-0" : ""}>
                          {/* Bio */}
                          <p className={`text-xs text-[#5a7a72] dark:text-slate-300 leading-relaxed flex-1 relative z-10 break-words [word-break:break-word] ${isList ? "line-clamp-1 mt-0" : "line-clamp-2 mt-3"}`}>
                            {freelancer.bio || "This freelancer hasn't added a bio yet."}
                          </p>

                          {/* Skills */}
                          {skills.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5 relative z-10 break-words">
                              {skills.slice(0, isList ? 5 : 4).map((skill) => (
                                <span key={skill}
                                  className="text-[10px] bg-transparent text-[#5a7a72] dark:text-slate-300 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-slate-800 font-medium break-all">
                                  {skill}
                                </span>
                              ))}
                              {skills.length > (isList ? 5 : 4) && (
                                <span className="text-[10px] bg-transparent text-[#8aa89e] dark:text-slate-400 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-slate-800 font-medium shrink-0">
                                  +{skills.length - (isList ? 5 : 4)} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Rate + CTA */}
                        <div className={`flex items-center justify-between gap-3 relative z-10 ${isList ? "sm:flex-col sm:items-end sm:w-48 shrink-0" : "mt-5 pt-4 border-t border-gray-100 dark:border-slate-800"}`}>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-[#2a9d8f]" />
                            <span className="font-extrabold text-[#1a3c34] dark:text-slate-100 text-base">
                              {rate > 0 ? currencyFmt(rate) : "—"}
                            </span>
                            {rate > 0 && (
                              <span className="text-[10px] text-[#8aa89e] dark:text-slate-400 font-semibold">/hr</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleCompare(freelancer)}
                              disabled={!isComparing && compareList.length >= MAX_COMPARE}
                              title={isComparing ? "Remove from compare" : "Add to compare"}
                              className={`p-2 rounded-xl border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                                isComparing
                                  ? "bg-[#2a9d8f] border-[#2a9d8f] text-white"
                                  : "bg-transparent border-gray-200 dark:border-slate-700 text-[#5a7a72] dark:text-slate-300"
                              }`}
                            >
                              <Scale className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/freelancers/${encodeURIComponent(freelancer.email)}`}
                              className="inline-flex items-center gap-1.5 bg-[#1a3c34] hover:bg-[#255248] text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm group-hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                            >
                              <Briefcase className="w-3.5 h-3.5" />
                              View Profile
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-[#d4ebe6] dark:border-slate-800 text-[#1a3c34] dark:text-slate-100 font-bold text-xs hover:bg-[#eaf5f2] dark:hover:bg-teal-950/30 transition-colors"
                    >
                      Load More
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#1a3c34] text-white shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-200">
                <Scale className="w-4 h-4" />
                Comparing {compareList.length}/{MAX_COMPARE}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {compareList.map((f) => (
                  <span key={f._id || f.email} className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold">
                    {f.name || "Anonymous"}
                    <button onClick={() => toggleCompare(f)} className="hover:text-rose-300">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setCompareList([])} className="text-xs font-semibold text-emerald-200 hover:text-white">
                Clear
              </button>
              <button
                disabled={compareList.length < 2}
                className="px-5 py-2.5 bg-[#2a9d8f] hover:bg-[#238579] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-colors"
              >
                Compare Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom padding so compare bar doesn't cover content */}
      {compareList.length > 0 && <div className="h-20" />}
    </div>
  );
}
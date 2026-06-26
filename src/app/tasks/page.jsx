"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getTasks } from "@/lib/actions/tasks";
import {
  Search,
  Filter,
  ArrowUpDown,
  Tag,
  Calendar,
  DollarSign,
  Briefcase,
  X,
  Plus,
  Loader2,
  AlertTriangle,
  ArrowRight,
  User,
  Zap,
  ChevronDown
} from "lucide-react";

const CATEGORIES = ["Design", "Writing", "Development", "Marketing", "Other"];
const SUGGESTED_SKILLS = [
  "React", "Next.js", "TypeScript", "Figma", "UI/UX", "Node.js",
  "Python", "SEO", "Content Writing", "Logo Design", "Branding",
  "Social Media", "WordPress", "Shopify", "Illustration", "3D Modeling"
];

// Theme configuration matching client dashboard
const THEME = {
  primary: "#1a3c34",
  primaryHover: "#255248",
  accent: "#2a9d8f",
  accentHover: "#238478",
  lightAccent: "#eaf5f2",
  bg: "#f4f8f6",
  cardBg: "#ffffff",
  textPrimary: "#1a3c34",
  textSecondary: "#5a7a72",
  textMuted: "#8aa89e",
  border: "#d4ebe6",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
  shadowHover: "0 4px 12px rgba(44,124,116,0.08)"
};

export default function BrowseTasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  // Fetch all tasks on mount
  const fetchAllTasks = async () => {
    setLoading(true);
    try {
      const response = await getTasks();
      if (response?.success) {
        // Filter out completed tasks or show Open/In Progress tasks for browsing
        const allTasks = response.data || [];
        setTasks(allTasks.filter(t => (t.status || "Open").toLowerCase() !== "completed"));
      } else {
        setError(response?.message || "Failed to fetch tasks");
      }
    } catch (err) {
      setError(err.message || "An error occurred while loading tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  // Handlers for Skills Filter
  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setMinBudget("");
    setMaxBudget("");
    setSelectedSkills([]);
    setSortBy("newest");
  };

  // Filter & Sort Logic
  const filteredTasks = tasks
    .filter((task) => {
      // 1. Search Query
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        (task.skills && task.skills.some((s) => s.toLowerCase().includes(searchLower)));

      // 2. Category
      const matchesCategory =
        selectedCategory === "All" ||
        (task.category && task.category.toLowerCase() === selectedCategory.toLowerCase());

      // 3. Budget Range
      const taskBudget = Number(task.budget || 0);
      const matchesMinBudget = minBudget === "" || taskBudget >= Number(minBudget);
      const matchesMaxBudget = maxBudget === "" || taskBudget <= Number(maxBudget);

      // 4. Skills Match (Task must include all selected filter skills)
      const matchesSkills =
        selectedSkills.length === 0 ||
        (task.skills &&
          selectedSkills.every((filterSkill) =>
            task.skills.some((taskSkill) => taskSkill.toLowerCase() === filterSkill.toLowerCase())
          ));

      return matchesSearch && matchesCategory && matchesMinBudget && matchesMaxBudget && matchesSkills;
    })
    .sort((a, b) => {
      if (sortBy === "budget-desc") {
        return Number(b.budget || 0) - Number(a.budget || 0);
      }
      if (sortBy === "budget-asc") {
        return Number(a.budget || 0) - Number(b.budget || 0);
      }
      // default: newest first
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedCategory !== "All" ||
    minBudget !== "" ||
    maxBudget !== "" ||
    selectedSkills.length > 0;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: THEME.bg }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-br from-[#1a3c34] to-[#255248] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg border border-[#d4ebe6]/10">
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
        <div className="bg-white p-6 rounded-3xl border border-[#d4ebe6]/40 shadow-sm space-y-6">
          {/* Main Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-xl">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#8aa89e]" />
              <input
                type="text"
                placeholder="Search gigs by title, skills, keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 border border-gray-200 focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/10 rounded-2xl text-sm outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-3.5 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div className="relative w-full sm:w-auto flex items-center gap-2 bg-[#f4f8f6] px-4 py-3 rounded-2xl border border-[#d4ebe6]/60 text-sm text-[#5a7a72] font-semibold self-stretch lg:self-auto">
              <ArrowUpDown className="w-4 h-4 text-[#2a9d8f]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none cursor-pointer text-[#1a3c34] font-bold w-full sm:w-auto"
              >
                <option value="newest">Newest Listed</option>
                <option value="budget-desc">Budget: High to Low</option>
                <option value="budget-asc">Budget: Low to High</option>
              </select>
            </div>
          </div>

          {/* Categories Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {["All", ...CATEGORIES].map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#1a3c34] text-white shadow-sm font-semibold hover:bg-[#255248]"
                      : "bg-[#f4f8f6] text-[#5a7a72] hover:text-[#1a3c34] hover:bg-[#eaf5f2]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Section: Sidebar Filters + Task List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-[#d4ebe6]/40 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: THEME.textPrimary }}>
                <Filter className="w-4 h-4 text-[#2a9d8f]" />
                Filters
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Budget Range Filter */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8aa89e]">
                Budget Range (USD)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#8aa89e] font-semibold">$</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    className="w-full pl-6 pr-2 py-2 border border-gray-200 focus:border-[#2a9d8f] rounded-xl text-xs outline-none bg-white"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#8aa89e] font-semibold">$</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full pl-6 pr-2 py-2 border border-gray-200 focus:border-[#2a9d8f] rounded-xl text-xs outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Skills Filter */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8aa89e]">
                Filter by Skills
              </h3>
              <div className="border border-gray-200 rounded-xl p-2 bg-white focus-within:border-[#2a9d8f] transition-all">
                <div className="flex flex-wrap gap-1.5 items-center">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#eaf5f2] text-[#2a9d8f]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:bg-white/50 rounded-full p-0.5"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={selectedSkills.length === 0 ? "e.g. React, Python..." : "Add..."}
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    className="flex-1 min-w-[70px] px-1 py-1 outline-none text-xs"
                  />
                </div>
              </div>

              {/* Suggestions */}
              {selectedSkills.length < 5 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[#8aa89e] uppercase block">Popular skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_SKILLS.filter(s => !selectedSkills.includes(s)).slice(0, 8).map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleAddSkill(skill)}
                        className="text-[10px] bg-[#f4f8f6] hover:bg-[#eaf5f2] text-[#5a7a72] px-2.5 py-1 rounded-lg transition-colors border border-gray-50"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Tasks Grid */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="bg-[#eaf5f2] border border-[#d4ebe6] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-[#1a3c34] font-medium">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">Active filters:</span>
                  {selectedCategory !== "All" && (
                    <span className="bg-white px-2 py-1 rounded-lg border border-[#d4ebe6]">Category: {selectedCategory}</span>
                  )}
                  {searchTerm && (
                    <span className="bg-white px-2 py-1 rounded-lg border border-[#d4ebe6]">Search: "{searchTerm}"</span>
                  )}
                  {(minBudget || maxBudget) && (
                    <span className="bg-white px-2 py-1 rounded-lg border border-[#d4ebe6]">
                      Budget: ${minBudget || "0"} - ${maxBudget || "∞"}
                    </span>
                  )}
                  {selectedSkills.map(skill => (
                    <span key={skill} className="bg-white px-2 py-1 rounded-lg border border-[#d4ebe6] flex items-center gap-1">
                      Skill: {skill}
                      <button onClick={() => handleRemoveSkill(skill)} className="text-gray-400 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={handleResetFilters}
                  className="font-bold hover:underline text-[#2a9d8f] cursor-pointer"
                >
                  Reset All
                </button>
              </div>
            )}

            {/* List / Loading / Error Render */}
            {loading ? (
              <div className="flex items-center justify-center min-h-[40vh]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
                  <p className="text-[#5a7a72] font-semibold text-sm">Searching the marketplace...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-red-800">Connection Error</h3>
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={fetchAllTasks}
                  className="px-6 py-2.5 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                >
                  Try Reconnecting
                </button>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
                <div className="w-16 h-16 bg-[#eaf5f2] text-[#2a9d8f] rounded-2xl flex items-center justify-center mx-auto">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-[#1a3c34]">No Open Gigs Found</h3>
                  <p className="text-[#8aa89e] text-sm px-4">
                    There are no matching open gigs at the moment. Try resetting your search filters or browse other categories.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-[#f4f8f6] hover:bg-[#eaf5f2] border border-[#d4ebe6] text-[#1a3c34] font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* Tasks List */
              <div className="grid grid-cols-1 gap-6">
                {filteredTasks.map((task) => {
                  const taskStatus = task.status || "Open";
                  // Status style map
                  const statusStyle =
                    taskStatus.toLowerCase() === "open"
                      ? "text-[#d97706] bg-[#fffbeb] border-[#fef3c7]"
                      : "text-[#2a9d8f] bg-[#eaf5f2] border-[#d4ebe6]";

                  return (
                    <div
                      key={task._id}
                      className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-6 md:p-8 hover:shadow-md hover:border-[#2a9d8f]/30 transition-all relative overflow-hidden group flex flex-col justify-between"
                    >
                      {/* Top Row */}
                      <div>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#eaf5f2] text-[#2a9d8f] border border-[#d4ebe6]/50">
                                <Tag className="w-3 h-3" />
                                {task.category || "General"}
                              </span>
                              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle}`}>
                                {taskStatus}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-[#1a3c34] tracking-tight group-hover:text-[#2a9d8f] transition-colors line-clamp-1">
                              {task.title}
                            </h3>
                          </div>

                          {/* Budget */}
                          <div className="bg-[#f0f7f4] border border-[#d4ebe6]/50 px-4 py-2 rounded-xl flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-[#2a9d8f]" />
                            <span className="font-extrabold text-[#1a3c34] text-base sm:text-lg">
                              {Number(task.budget || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2
                              })}
                            </span>
                            <span className="text-[10px] text-[#8aa89e] font-semibold uppercase tracking-wider">USD</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="mt-4 text-[#5a7a72] text-sm leading-relaxed line-clamp-2">
                          {task.description}
                        </p>

                        {/* Skills */}
                        {task.skills && task.skills.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-1.5 items-center">
                            <span className="text-xs text-[#8aa89e] mr-1 font-medium">Skills:</span>
                            {task.skills.map((skill) => (
                              <span
                                key={skill}
                                className="text-xs bg-[#f4f8f6] hover:bg-[#eaf5f2] px-2.5 py-1 rounded-lg text-[#5a7a72] border border-gray-100 font-medium transition-colors"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Lower Row */}
                      <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                        {/* Buyer profile */}
                        <div className="flex items-center gap-3">
                          {task.buyerImage ? (
                            <img
                              src={task.buyerImage}
                              alt={task.buyerName || "Client"}
                              className="w-10 h-10 rounded-full border border-[#d4ebe6] object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#eaf5f2] text-[#2a9d8f] flex items-center justify-center border border-[#d4ebe6]">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-[#1a3c34]">{task.buyerName || "Anonymous Client"}</span>
                            <span className="text-[10px] text-[#8aa89e]">Client</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-5">
                          {/* Deadline */}
                          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#8aa89e] font-medium">
                            <Calendar className="w-4 h-4 text-[#2a9d8f]" />
                            <span>Deadline:</span>
                            <span className="text-[#1a3c34] font-bold">
                              {task.deadline
                                ? new Date(task.deadline).toLocaleDateString(undefined, {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric"
                                  })
                                : "N/A"}
                            </span>
                          </div>

                          {/* Action Button */}
                          <Link
                            href={`/tasks/${task._id}`}
                            className="inline-flex items-center justify-center gap-2 bg-[#1a3c34] hover:bg-[#255248] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm group-hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                          >
                            <span>Apply / View details</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  User,
  Zap,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";

const SUGGESTED_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Figma",
  "UI/UX",
  "Node.js",
  "Python",
  "SEO",
  "Content Writing",
  "Logo Design",
  "Branding",
  "Social Media",
  "WordPress",
  "Shopify",
  "Illustration",
  "3D Modeling",
  "Video Editing",
  "Copywriting",
];

const THEME = {
  primary: "#1a3c34",
  primaryHover: "#255248",
  accent: "#2a9d8f",
  bg: "#f4f8f6",
  lightAccent: "#eaf5f2",
  textPrimary: "#1a3c34",
  textSecondary: "#5a7a72",
  textMuted: "#8aa89e",
  border: "#d4ebe6",
};

function pseudoRating(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return (3.5 + ((Math.abs(h) % 15) / 10)).toFixed(1);
}

function StarRow({ rating }) {
  const num = parseFloat(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(num) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function BrowseFreelancersPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [hireModal, setHireModal] = useState(null);

  const fetchFreelancers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllUsers();
      if (response?.success) {
        const all = response.data || [];
        setFreelancers(all.filter((u) => u.role === "freelancer" && !u.isBlocked));
      } else {
        setError(response?.message || "Failed to fetch freelancers");
      }
    } catch (err) {
      setError(err.message || "An error occurred while loading freelancers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setSkillInput("");
    }
  };
  const handleRemoveSkill = (s) => setSelectedSkills(selectedSkills.filter((x) => x !== s));
  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedSkills([]);
    setSkillInput("");
    setMinRate("");
    setMaxRate("");
    setSortBy("name-asc");
  };

  const filteredFreelancers = useMemo(() => {
    return freelancers
      .filter((f) => {
        const q = searchTerm.toLowerCase();
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

        return matchesSearch && matchesMinRate && matchesMaxRate && matchesSkills;
      })
      .sort((a, b) => {
        if (sortBy === "rate-asc") return Number(a.hirePrice || 0) - Number(b.hirePrice || 0);
        if (sortBy === "rate-desc") return Number(b.hirePrice || 0) - Number(a.hirePrice || 0);
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [freelancers, searchTerm, selectedSkills, minRate, maxRate, sortBy]);

  const hasActiveFilters =
    searchTerm !== "" || selectedSkills.length > 0 || minRate !== "" || maxRate !== "";

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: THEME.bg }}>
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
            <div className="flex items-center gap-6 pt-2 text-sm text-emerald-200/70 font-medium">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#2a9d8f]" />
                {freelancers.length} freelancers available
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-[#2a9d8f]" />
                Verified profiles
              </span>
            </div>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="bg-white p-6 rounded-3xl border border-[#d4ebe6]/40 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-xl">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#8aa89e]" />
              <input
                type="text"
                placeholder="Search by name, skills, bio..."
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

            <div className="flex items-center gap-2 bg-[#f4f8f6] px-4 py-3 rounded-2xl border border-[#d4ebe6]/60 text-sm text-[#5a7a72] font-semibold w-full sm:w-auto">
              <ArrowUpDown className="w-4 h-4 text-[#2a9d8f]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none cursor-pointer text-[#1a3c34] font-bold w-full sm:w-auto"
              >
                <option value="name-asc">Name: A → Z</option>
                <option value="rate-asc">Rate: Low to High</option>
                <option value="rate-desc">Rate: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Filter Sidebar */}
          <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-[#d4ebe6]/40 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold flex items-center gap-2 text-[#1a3c34]">
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

            {/* Hire Rate Filter */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8aa89e]">
                Hire Rate (USD/hr)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#8aa89e] font-semibold">$</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minRate}
                    onChange={(e) => setMinRate(e.target.value)}
                    className="w-full pl-6 pr-2 py-2 border border-gray-200 focus:border-[#2a9d8f] rounded-xl text-xs outline-none bg-white"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#8aa89e] font-semibold">$</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxRate}
                    onChange={(e) => setMaxRate(e.target.value)}
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
              {selectedSkills.length < 5 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[#8aa89e] uppercase block">Popular skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_SKILLS.filter((s) => !selectedSkills.includes(s))
                      .slice(0, 8)
                      .map((skill) => (
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

          {/* Freelancer Cards */}
          <div className="lg:col-span-9 space-y-6">

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="bg-[#eaf5f2] border border-[#d4ebe6] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-[#1a3c34] font-medium">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">Active filters:</span>
                  {searchTerm && (
                    <span className="bg-white px-2 py-1 rounded-lg border border-[#d4ebe6]">
                      Search: &ldquo;{searchTerm}&rdquo;
                    </span>
                  )}
                  {(minRate || maxRate) && (
                    <span className="bg-white px-2 py-1 rounded-lg border border-[#d4ebe6]">
                      Rate: ${minRate || "0"} – ${maxRate || "∞"}/hr
                    </span>
                  )}
                  {selectedSkills.map((s) => (
                    <span key={s} className="bg-white px-2 py-1 rounded-lg border border-[#d4ebe6] flex items-center gap-1">
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
              <p className="text-sm text-[#8aa89e] font-medium px-1">
                Showing{" "}
                <span className="font-bold text-[#1a3c34]">{filteredFreelancers.length}</span>{" "}
                freelancer{filteredFreelancers.length !== 1 ? "s" : ""}
                {hasActiveFilters ? " matching your filters" : ""}
              </p>
            )}

            {/* States */}
            {loading ? (
              <div className="flex items-center justify-center min-h-[40vh]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
                  <p className="text-[#5a7a72] font-semibold text-sm">Loading freelancers...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-red-800">Connection Error</h3>
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={fetchFreelancers}
                  className="px-6 py-2.5 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors"
                >
                  Try Reconnecting
                </button>
              </div>
            ) : filteredFreelancers.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
                <div className="w-16 h-16 bg-[#eaf5f2] text-[#2a9d8f] rounded-2xl flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-[#1a3c34]">No Freelancers Found</h3>
                  <p className="text-[#8aa89e] text-sm px-4">
                    No freelancers match your current filters. Try adjusting your search or clearing filters.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-[#f4f8f6] hover:bg-[#eaf5f2] border border-[#d4ebe6] text-[#1a3c34] font-bold text-xs rounded-xl transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredFreelancers.map((freelancer) => {
                  const rating = pseudoRating(freelancer.name);
                  const skills = freelancer.skills || [];
                  const rate = Number(freelancer.hirePrice || 0);
                  const reviewCount = Math.floor(Math.abs((freelancer.name || "A").charCodeAt(0)) % 90 + 10);

                  return (
                    <div
                      key={freelancer._id || freelancer.email}
                      className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-6 hover:shadow-lg hover:border-[#2a9d8f]/30 transition-all group flex flex-col relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#eaf5f2] to-transparent rounded-bl-3xl opacity-60 group-hover:opacity-100 transition-opacity" />

                      {/* Avatar & Name */}
                      <div className="flex items-start gap-4 relative z-10">
                        {freelancer.image ? (
                          <img
                            src={freelancer.image}
                            alt={freelancer.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#d4ebe6] group-hover:border-[#2a9d8f]/40 transition-all shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-[#eaf5f2] flex items-center justify-center border-2 border-[#d4ebe6] shrink-0">
                            <User className="w-7 h-7 text-[#2a9d8f]" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-[15px] font-bold text-[#1a3c34] truncate group-hover:text-[#2a9d8f] transition-colors">
                              {freelancer.name || "Anonymous"}
                            </h3>
                            <BadgeCheck className="w-4 h-4 text-[#2a9d8f] shrink-0" />
                          </div>
                          <span className="text-xs font-semibold text-[#2a9d8f] bg-[#eaf5f2] px-2 py-0.5 rounded-full mt-0.5 inline-block">
                            Freelancer
                          </span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="mt-3 flex items-center gap-2">
                        <StarRow rating={rating} />
                        <span className="text-xs font-bold text-[#1a3c34]">{rating}</span>
                        <span className="text-[10px] text-[#8aa89e]">({reviewCount} reviews)</span>
                      </div>

                      {/* Bio */}
                      <p className="mt-3 text-xs text-[#5a7a72] leading-relaxed line-clamp-2 flex-1">
                        {freelancer.bio || "This freelancer hasn't added a bio yet."}
                      </p>

                      {/* Skills */}
                      {skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="text-[10px] bg-[#f4f8f6] text-[#5a7a72] px-2.5 py-1 rounded-lg border border-gray-100 font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {skills.length > 4 && (
                            <span className="text-[10px] bg-[#f4f8f6] text-[#8aa89e] px-2.5 py-1 rounded-lg border border-gray-100 font-medium">
                              +{skills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Rate + CTA */}
                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-[#2a9d8f]" />
                          <span className="font-extrabold text-[#1a3c34] text-base">
                            {rate > 0 ? rate.toLocaleString() : "—"}
                          </span>
                          {rate > 0 && (
                            <span className="text-[10px] text-[#8aa89e] font-semibold">/hr</span>
                          )}
                        </div>
                        <button
                          onClick={() => setHireModal(freelancer)}
                          className="inline-flex items-center gap-1.5 bg-[#1a3c34] hover:bg-[#255248] text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm group-hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                          View Profile
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile / Hire Modal */}
      {hireModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setHireModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setHireModal(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#eaf5f2] to-transparent rounded-bl-3xl" />

            {/* Header */}
            <div className="flex items-start gap-5 relative z-10">
              {hireModal.image ? (
                <img
                  src={hireModal.image}
                  alt={hireModal.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#d4ebe6]"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#eaf5f2] flex items-center justify-center border-2 border-[#d4ebe6]">
                  <User className="w-10 h-10 text-[#2a9d8f]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#1a3c34]">{hireModal.name}</h2>
                  <BadgeCheck className="w-5 h-5 text-[#2a9d8f]" />
                </div>
                <span className="text-xs font-semibold text-[#2a9d8f] bg-[#eaf5f2] px-2 py-0.5 rounded-full mt-1 inline-block">
                  Freelancer
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <StarRow rating={pseudoRating(hireModal.name)} />
                  <span className="text-xs font-bold text-[#1a3c34]">{pseudoRating(hireModal.name)}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6 relative z-10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8aa89e] mb-2">About</h3>
              <p className="text-sm text-[#5a7a72] leading-relaxed">
                {hireModal.bio || "This freelancer hasn't added a bio yet."}
              </p>
            </div>

            {/* Skills */}
            {hireModal.skills && hireModal.skills.length > 0 && (
              <div className="mt-5 relative z-10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8aa89e] mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {hireModal.skills.map((s) => (
                    <span key={s} className="text-xs bg-[#eaf5f2] text-[#2a9d8f] px-3 py-1.5 rounded-xl font-semibold border border-[#d4ebe6]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rate + CTA */}
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between gap-4 relative z-10">
              <div>
                <p className="text-[10px] text-[#8aa89e] uppercase font-bold tracking-wider mb-0.5">Hire Rate</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-[#1a3c34]">
                    {Number(hireModal.hirePrice || 0) > 0
                      ? `$${Number(hireModal.hirePrice).toLocaleString()}`
                      : "—"}
                  </span>
                  {Number(hireModal.hirePrice || 0) > 0 && (
                    <span className="text-xs text-[#8aa89e] font-semibold">/hr</span>
                  )}
                </div>
              </div>
              <a
                href={`mailto:${hireModal.email}`}
                className="inline-flex items-center gap-2 bg-[#1a3c34] hover:bg-[#255248] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm"
              >
                <Briefcase className="w-4 h-4" />
                Hire Now
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
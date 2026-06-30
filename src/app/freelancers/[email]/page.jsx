"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getUserByEmail } from "@/lib/actions/users";
import { getFreelancerRatings } from "@/lib/actions/ratings";
import { getProposals } from "@/lib/actions/proposals";
import {
  ArrowLeft,
  BadgeCheck,
  Star,
  Briefcase,
  DollarSign,
  MessageSquare,
  Loader2,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Zap,
  Rocket,
  Sparkles,
} from "lucide-react";

function StarRow({ rating, size = "md" }) {
  const num = parseFloat(rating) || 0;
  const sz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`${sz} ${s <= Math.round(num) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-12 text-right text-[#5a7a72] dark:text-[#9fb3c8] font-medium shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-[#8aa89e] dark:text-[#6b7e94] font-semibold">{count}</span>
    </div>
  );
}

export default function FreelancerProfilePage() {
  const params = useParams();
  const emailParam = decodeURIComponent(params.email || "");

  const [freelancer, setFreelancer] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about"); // 'about' | 'reviews'

  useEffect(() => {
    const fetchAll = async () => {
      if (!emailParam) return;
      setLoading(true);
      setError(null);
      try {
        const [userRes, ratingsRes, proposalsRes] = await Promise.all([
          getUserByEmail(emailParam),
          getFreelancerRatings(emailParam),
          getProposals({ freelancerEmail: emailParam }),
        ]);

        if (!userRes.success) {
          setError(userRes.message || "Freelancer not found");
          return;
        }
        setFreelancer(userRes.data);

        if (ratingsRes.success) {
          setRatings(ratingsRes.data || []);
        }

        if (proposalsRes.success) {
          // Count accepted proposals as completed jobs
          const accepted = (proposalsRes.data || []).filter((p) => p.status === "accepted");
          setCompletedJobs(accepted.length);
        }
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [emailParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f8f6] dark:bg-[#1a2435] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
          <p className="text-[#5a7a72] dark:text-[#9fb3c8] font-semibold text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !freelancer) {
    return (
      <div className="min-h-screen bg-[#f4f8f6] dark:bg-[#1a2435] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#131c2b] rounded-3xl border border-red-100 p-8 max-w-sm text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-red-800">Profile Not Found</h2>
          <p className="text-red-500 text-sm">{error || "This freelancer does not exist."}</p>
          <Link href="/freelancers"
            className="inline-flex items-center gap-2 bg-[#1a3c34] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#255248] transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Freelancers
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = Number(freelancer.avgRating) || 0;
  const ratingCount = Number(freelancer.ratingCount) || 0;
  const skills = freelancer.skills || [];
  const rate = Number(freelancer.hirePrice || 0);

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="min-h-screen bg-[#f4f8f6] dark:bg-[#1a2435] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back Link */}
        <Link href="/freelancers"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a7a72] dark:text-[#9fb3c8] hover:text-[#1a3c34] dark:text-[#e8f4f0] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Browse Freelancers
        </Link>

        {/* Profile Hero Card */}
        <div className="bg-gradient-to-br from-[#1a3c34] to-[#255248] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-teal-400/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            {freelancer.image ? (
              <img src={freelancer.image} alt={freelancer.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-xl shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#131c2b]/10 border-4 border-white/20 flex items-center justify-center text-3xl font-bold shrink-0">
                {(freelancer.name || "?")[0].toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-serif font-bold">{freelancer.name || "Anonymous"}</h1>
                <BadgeCheck className="w-6 h-6 text-[#2a9d8f]" />
                <span className="text-xs font-bold bg-[#2a9d8f]/20 text-[#2a9d8f] border border-[#2a9d8f]/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Freelancer
                </span>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-3">
                <StarRow rating={avgRating} size="lg" />
                <span className="text-lg font-extrabold">
                  {avgRating > 0 ? avgRating.toFixed(1) : "New"}
                </span>
                <span className="text-emerald-200/70 text-sm">
                  {ratingCount > 0 ? `${ratingCount} review${ratingCount !== 1 ? "s" : ""}` : "No reviews yet"}
                </span>
              </div>

              <p className="text-emerald-100/70 text-sm">{freelancer.email}</p>

              {/* Journey started badge */}
              {freelancer.createdAt && (
                <div className="inline-flex items-center gap-2 bg-white dark:bg-[#131c2b]/10 border border-white/20 backdrop-blur-sm px-4 py-2 rounded-full w-fit">
                  <Rocket className="w-3.5 h-3.5 text-[#2a9d8f]" />
                  <span className="text-xs font-semibold text-emerald-100">
                    Journey started{" "}
                    <span className="text-white font-bold">
                      {new Date(freelancer.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Rate badge — top right, no hire button */}
            {rate > 0 && (
              <div className="shrink-0 text-right">
                <p className="text-emerald-200/60 text-[10px] uppercase font-bold tracking-wider">Hire Rate</p>
                <p className="text-3xl font-extrabold">${rate.toLocaleString()}<span className="text-lg font-medium text-emerald-200/60">/hr</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              icon: Star,
              label: "Avg. Rating",
              value: avgRating > 0 ? avgRating.toFixed(1) : "—",
              color: "text-amber-500",
              bg: "bg-amber-50",
            },
            {
              icon: MessageSquare,
              label: "Total Reviews",
              value: ratingCount,
              color: "text-[#2a9d8f]",
              bg: "bg-[#eaf5f2] dark:bg-[#1a2435]",
            },
            {
              icon: CheckCircle2,
              label: "Jobs Completed",
              value: completedJobs,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              icon: DollarSign,
              label: "Hourly Rate",
              value: rate > 0 ? `$${rate}` : "—",
              color: "text-[#1a3c34] dark:text-[#e8f4f0]",
              bg: "bg-[#f0f7f4] dark:bg-[#1a2435]",
            },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label}
              className="bg-white dark:bg-[#131c2b] rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/40 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#8aa89e] dark:text-[#6b7e94] uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-extrabold text-[#1a3c34] dark:text-[#e8f4f0] mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-[#131c2b] rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/40 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {["about", "reviews"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-bold capitalize transition-all ${
                  activeTab === tab
                    ? "text-[#1a3c34] dark:text-[#e8f4f0] border-b-2 border-[#2a9d8f]"
                    : "text-[#8aa89e] dark:text-[#6b7e94] hover:text-[#5a7a72] dark:text-[#9fb3c8]"
                }`}>
                {tab === "about" ? "About & Skills" : `Reviews (${ratingCount})`}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === "about" ? (
              <div className="space-y-8">
                {/* Bio */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#8aa89e] dark:text-[#6b7e94] mb-3">About</h2>
                  <p className="text-[#5a7a72] dark:text-[#9fb3c8] leading-relaxed text-sm">
                    {freelancer.bio || "This freelancer hasn't added a bio yet."}
                  </p>
                </div>

                {/* Skills */}
                {skills.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#8aa89e] dark:text-[#6b7e94] mb-3">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill}
                          className="text-sm bg-[#eaf5f2] dark:bg-[#1a2435] text-[#2a9d8f] px-4 py-2 rounded-xl font-semibold border border-[#d4ebe6] dark:border-[#1e293b]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Journey Timeline */}
                <div className="bg-gradient-to-r from-[#eaf5f2] to-white rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/60 p-5 relative overflow-hidden">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
                    <Sparkles className="w-16 h-16 text-[#2a9d8f]" />
                  </div>
                  <p className="text-[10px] font-bold text-[#8aa89e] dark:text-[#6b7e94] uppercase tracking-wider mb-3">Freelancer Journey</p>
                  <div className="flex items-start gap-4 relative">
                    {/* timeline line */}
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#2a9d8f] ring-4 ring-[#2a9d8f]/20 mt-0.5" />
                      <div className="w-0.5 flex-1 bg-gradient-to-b from-[#2a9d8f]/40 to-transparent min-h-[2.5rem]" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div>
                        <p className="text-xs font-bold text-[#1a3c34] dark:text-[#e8f4f0]">
                          {freelancer.createdAt
                            ? `Joined ${new Date(freelancer.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}`
                            : "Member since joining"}
                        </p>
                        <p className="text-[11px] text-[#8aa89e] dark:text-[#6b7e94] mt-0.5">
                          {freelancer.createdAt
                            ? (() => {
                                const joined = new Date(freelancer.createdAt);
                                const now = new Date();
                                const diffMs = now - joined;
                                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                const diffMonths = Math.floor(diffDays / 30);
                                const diffYears = Math.floor(diffDays / 365);
                                if (diffYears >= 1) return `${diffYears} year${diffYears > 1 ? "s" : ""} on Gigly`;
                                if (diffMonths >= 1) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} on Gigly`;
                                return `${diffDays} day${diffDays !== 1 ? "s" : ""} on Gigly`;
                              })()
                            : "Active member"}
                        </p>
                      </div>
                      {completedJobs > 0 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <p className="text-xs text-[#5a7a72] dark:text-[#9fb3c8] font-semibold">
                            {completedJobs} job{completedJobs !== 1 ? "s" : ""} successfully completed
                          </p>
                        </div>
                      )}
                      {ratingCount > 0 && (
                        <div className="flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                          <p className="text-xs text-[#5a7a72] dark:text-[#9fb3c8] font-semibold">
                            {avgRating.toFixed(1)} avg rating across {ratingCount} review{ratingCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Reviews Tab */
              <div className="space-y-8">
                {ratingCount === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
                      <Star className="w-8 h-8 text-amber-300" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1a3c34] dark:text-[#e8f4f0]">No Reviews Yet</h3>
                    <p className="text-[#8aa89e] dark:text-[#6b7e94] text-sm max-w-xs mx-auto">
                      This freelancer hasn&apos;t received any reviews yet. Be the first to hire and rate them!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Rating Summary */}
                    <div className="flex flex-col sm:flex-row gap-8 p-6 bg-[#f4f8f6] dark:bg-[#1a2435] rounded-2xl border border-[#d4ebe6] dark:border-[#1e293b]/50">
                      {/* Big Score */}
                      <div className="flex flex-col items-center justify-center shrink-0 gap-2">
                        <span className="text-6xl font-extrabold text-[#1a3c34] dark:text-[#e8f4f0]">
                          {avgRating.toFixed(1)}
                        </span>
                        <StarRow rating={avgRating} size="lg" />
                        <span className="text-xs text-[#8aa89e] dark:text-[#6b7e94] font-semibold">
                          {ratingCount} review{ratingCount !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Distribution Bars */}
                      <div className="flex-1 space-y-2.5">
                        {dist.map(({ star, count }) => (
                          <RatingBar key={star} label={`${star} ★`} count={count} total={ratingCount} />
                        ))}
                      </div>
                    </div>

                    {/* Individual Reviews */}
                    <div className="space-y-5">
                      {ratings.map((r) => (
                        <div key={r._id}
                          className="border border-[#d4ebe6] dark:border-[#1e293b]/40 rounded-2xl p-5 bg-white dark:bg-[#131c2b] hover:shadow-sm transition-all">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#eaf5f2] dark:bg-[#1a2435] flex items-center justify-center text-[#2a9d8f] font-bold text-sm shrink-0">
                                {(r.clientEmail || "C")[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#1a3c34] dark:text-[#e8f4f0]">
                                  {r.clientEmail?.split("@")[0] || "Client"}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <StarRow rating={r.rating} />
                                  <span className="text-xs font-bold text-amber-600">{r.rating}/5</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#8aa89e] dark:text-[#6b7e94]">
                              <Calendar className="w-3.5 h-3.5" />
                              {r.createdAt
                                ? new Date(r.createdAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Recently"}
                            </div>
                          </div>

                          {r.review && (
                            <p className="mt-4 text-sm text-[#5a7a72] dark:text-[#9fb3c8] leading-relaxed border-l-2 border-[#d4ebe6] dark:border-[#1e293b] pl-4 italic">
                              &ldquo;{r.review}&rdquo;
                            </p>
                          )}

                          {/* Rating label badge */}
                          <div className="mt-3 flex">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              r.rating >= 5 ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : r.rating >= 4 ? "text-blue-700 bg-blue-50 border-blue-200"
                              : r.rating >= 3 ? "text-amber-700 bg-amber-50 border-amber-200"
                              : "text-red-700 bg-red-50 border-red-200"
                            }`}>
                              {["", "Needs Work", "Fair", "Good", "Great", "Excellent!"][r.rating]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

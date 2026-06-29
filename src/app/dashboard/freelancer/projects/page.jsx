"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getTasks, updateTask } from "@/lib/actions/tasks";
import { getProposals } from "@/lib/actions/proposals";
import {
  Loader2,
  Briefcase,
  DollarSign,
  Calendar,
  Tag,
  AlertTriangle,
  Search,
  Clock,
  CheckCircle2,
  ArrowRight,
  User,
  ExternalLink,
  Send,
  X
} from "lucide-react";

export default function FreelancerProjectsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [tasks, setTasks] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Deliverable Submission Modal State
  const [submittingProject, setSubmittingProject] = useState(null);
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);

  // Load tasks + this freelancer's proposals from the server.
  // Defined in component scope so it can be reused by the Refresh button and
  // the deliverable submit handler (previously it was trapped inside useEffect
  // under a different name, which caused a ReferenceError).
  const fetchProjectsData = async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    setError(null);
    try {
      const tasksRes = await getTasks();
      const proposalsRes = await getProposals({ freelancerEmail: session.user.email });

      if (tasksRes.success && proposalsRes.success) {
        setTasks(tasksRes.data || []);
        setProposals(proposalsRes.data || []);
      } else {
        setError(tasksRes.message || proposalsRes.message || "Failed to load data");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === "loading" || !session?.user?.email) return;
    fetchProjectsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, sessionStatus]);

  const user = session?.user;

  // Freelancer's hired projects (where their proposal is accepted)
  const myProjects = useMemo(() => {
    const taskMap = {};
    tasks.forEach((t) => { taskMap[t._id] = t; });

    // Filter proposals that are accepted, then map to their tasks
    return proposals
      .filter((p) => p.status === "accepted")
      .map((p) => {
        const task = taskMap[p.taskId];
        return {
          ...p,
          task: task || null,
          taskStatus: task?.status || p.taskStatus || "In Progress",
          deliverableUrl: task?.deliverable_url || ""
        };
      })
      .filter((p) => p.task !== null);
  }, [proposals, tasks]);

  // Statistics
  const activeCount = myProjects.filter((p) => p.taskStatus === "In Progress").length;
  const completedCount = myProjects.filter((p) => p.taskStatus === "Completed").length;
  const totalEarned = myProjects
    .filter((p) => p.taskStatus === "Completed")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Submit Deliverable Logic
  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (!submittingProject || !deliverableUrl.trim()) return;

    setSubmittingDeliverable(true);
    try {
      const taskToUpdate = submittingProject.task;
      const response = await updateTask(taskToUpdate._id, {
        ...taskToUpdate,
        status: "Completed",
        deliverable_url: deliverableUrl.trim()
      });

      if (response?.success) {
        alert("Deliverable submitted and project marked as Completed!");
        setSubmittingProject(null);
        setDeliverableUrl("");
        fetchProjectsData(); // Refresh list
      } else {
        alert(response?.message || "Failed to submit deliverable");
      }
    } catch (err) {
      alert("Error submitting deliverable");
    } finally {
      setSubmittingDeliverable(false);
    }
  };

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
        <div className="bg-white p-8 rounded-3xl border border-[#d4ebe6]/50 shadow-md space-y-6 max-w-sm w-full">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-[#1a3c34]">Access Denied</h2>
          <Link href="/login" className="block w-full bg-[#1a3c34] text-white py-3 rounded-xl font-medium text-center">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] tracking-tight">Active Projects</h1>
          <p className="text-[#5a7a72] mt-1.5 text-[15px]">Tasks where your proposal was accepted.</p>
        </div>
        <button
          onClick={fetchProjectsData}
          className="flex items-center justify-center gap-2 bg-[#f4f8f6] hover:bg-[#eaf5f2] border border-[#d4ebe6] text-[#1a3c34] px-5 py-2.5 rounded-full font-semibold text-xs transition-all shadow-sm w-fit"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: "In Progress", value: activeCount, icon: Clock, iconBg: "bg-[#eaf5f2]", iconColor: "text-[#2a9d8f]", cardBg: "bg-white" },
          { title: "Completed", value: completedCount, icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", cardBg: "bg-white" },
          { title: "Total Earned", value: `$${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, iconBg: "bg-[#e2f1ed]", iconColor: "text-[#1a3c34]", cardBg: "bg-[#f0f7f4]" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`p-6 rounded-2xl border border-[#d4ebe6]/50 shadow-sm flex flex-col justify-between h-[140px] transition-all hover:shadow-md ${stat.cardBg}`}>
              <div className={`p-2.5 rounded-xl w-fit ${stat.iconBg} ${stat.iconColor}`}><Icon size={20} /></div>
              <div className="space-y-1 mt-4">
                <span className="text-xs font-semibold text-[#8aa89e] uppercase tracking-wider">{stat.title}</span>
                <p className="text-2xl font-semibold text-[#1a3c34]">
                  {loading ? <span className="inline-block w-12 h-5 bg-gray-100 animate-pulse rounded" /> : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#2a9d8f]" />
            <p className="text-[#8aa89e] text-sm font-medium">Loading your projects...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      ) : myProjects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 bg-[#eaf5f2] text-[#2a9d8f] rounded-2xl flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1a3c34]">No Projects Yet</h3>
            <p className="text-[#8aa89e] text-sm mt-1.5 px-4">
              When a client accepts your proposal, the project will appear here.
            </p>
          </div>
          <Link href="/tasks" className="inline-flex items-center gap-2 bg-[#2a9d8f] hover:bg-[#238478] text-white px-6 py-3 rounded-full font-medium transition-all shadow-sm">
            <Search size={16} /> Browse Open Gigs
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {myProjects.map((project) => {
            const task = project.task || {};
            const isInProgress = project.taskStatus === "In Progress";
            const statusStyle = isInProgress
              ? "text-[#2a9d8f] bg-[#eaf5f2] border-[#d4ebe6]"
              : "text-emerald-700 bg-emerald-50 border-emerald-100";

            return (
              <div
                key={project._id}
                className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-6 md:p-8 hover:shadow-md hover:border-[#2a9d8f]/30 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusStyle}`}>
                        {project.taskStatus}
                      </span>
                      {task.category && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#eaf5f2] text-[#2a9d8f] px-2.5 py-1 rounded-lg">
                          <Tag className="w-3 h-3" /> {task.category}
                        </span>
                      )}
                    </div>
                    <Link href={`/tasks/${task._id || ""}`} className="font-bold text-xl text-[#1a3c34] hover:text-[#2a9d8f] hover:underline transition-colors block">
                      {task.title || project.taskTitle || "Untitled Task"}
                    </Link>
                    <p className="text-sm text-[#5a7a72] leading-relaxed line-clamp-2">{task.description || "No description available."}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-2xl font-extrabold text-[#2a9d8f]">
                      ${Number(project.amount || task.budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </span>
                    <span className="text-xs text-[#8aa89e] font-medium">Agreed amount</span>
                  </div>
                </div>

                {/* Show deliverable link if completed */}
                {!isInProgress && project.deliverableUrl && (
                  <div className="bg-[#f4f8f6] border border-[#d4ebe6] p-4 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[#5a7a72] shrink-0">Deliverable URL:</span>
                      <a href={project.deliverableUrl} target="_blank" rel="noopener noreferrer" className="text-[#2a9d8f] font-bold hover:underline break-all min-w-0">
                        {project.deliverableUrl}
                      </a>
                    </div>
                    <a href={project.deliverableUrl} target="_blank" rel="noopener noreferrer" className="text-[#2a9d8f] hover:text-[#1a3c34] p-1 shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#8aa89e] font-medium">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#2a9d8f]" />
                      Client: <span className="text-[#1a3c34] font-bold ml-1">{task.buyerEmail || "—"}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#2a9d8f]" />
                      Deadline: <span className="text-[#1a3c34] font-bold ml-1">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Flexible"}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isInProgress && (
                      <button
                        onClick={() => setSubmittingProject(project)}
                        className="px-5 py-2.5 bg-[#2a9d8f] hover:bg-[#238478] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        Submit Deliverable
                      </button>
                    )}
                    {task._id && (
                      <Link
                        href={`/tasks/${task._id}`}
                        className="flex items-center gap-2 bg-[#f4f8f6] hover:bg-[#eaf5f2] border border-[#d4ebe6] text-[#1a3c34] px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deliverable Submission Modal */}
      {submittingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#d4ebe6]/50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-[#d4ebe6]/30 flex items-center justify-between bg-[#f4f8f6]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#eaf5f2] flex items-center justify-center text-[#2a9d8f]">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a3c34]">Submit Deliverable</h3>
                  <p className="text-[10px] text-[#8aa89e] mt-0.5">Complete and deliver task work</p>
                </div>
              </div>
              <button onClick={() => setSubmittingProject(null)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitDeliverable} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#5a7a72] uppercase tracking-wider">
                  Deliverable Link (Docs, GitHub, Figma, etc.)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/username/project"
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/10 rounded-xl text-sm outline-none transition-all"
                />
              </div>

              <div className="bg-[#f0f9f6] border border-[#d4ebe6] p-3 rounded-xl text-[11px] text-[#5a7a72] leading-relaxed">
                Submitting this deliverable will mark the task as **Completed** and notify the client to verify the work.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSubmittingProject(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#5a7a72] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDeliverable}
                  className="px-6 py-2.5 rounded-xl bg-[#1a3c34] hover:bg-[#255248] text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {submittingDeliverable ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
                  ) : (
                    <>Submit Work</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getTasks, updateTask, deleteTask } from "@/lib/actions/tasks";
import { getProposals } from "@/lib/actions/proposals";
import { submitRating } from "@/lib/actions/ratings";
import {
  ClipboardCheck,
  CircleDot,
  Clock,
  Wallet,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Tag,
  Trash2,
  Edit3,
  AlertTriangle,
  X,
  Briefcase,
  CheckCircle2,
  Loader2,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Star
} from "lucide-react";

const CATEGORIES = ["Design", "Writing", "Development", "Marketing", "Other"];
const SUGGESTED_SKILLS = [
  "React", "Next.js", "TypeScript", "Figma", "UI/UX", "Node.js",
  "Python", "SEO", "Content Writing", "Logo Design", "Branding",
  "Social Media", "WordPress", "Shopify", "Illustration", "3D Modeling"
];

export default function MyTasksPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [tasks, setTasks] = useState([]);
  const [acceptedProposals, setAcceptedProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rating Modal state
  const [ratingModal, setRatingModal] = useState({ isOpen: false, task: null, freelancer: null });
  const [ratingScore, setRatingScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Expanded description state
  const [expandedTasks, setExpandedTasks] = useState({});

  // Editing state
  const [editingTask, setEditingTask] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    category: "",
    budget: "",
    deadline: "",
    description: "",
    skills: []
  });
  const [editSkillInput, setEditSkillInput] = useState("");
  const [editErrors, setEditErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Deleting state
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast / Notification status
  const [toast, setToast] = useState(null);

  const skillInputRef = useRef(null);

  // Fetch tasks on mount/session change
  const fetchTasks = async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const response = await getTasks(session.user.email);
      const proposalsRes = await getProposals({ clientEmail: session.user.email });

      if (response?.success) {
        setTasks(response.data || []);
      } else {
        setError(response?.message || "Failed to fetch tasks");
      }

      if (proposalsRes?.success) {
        // Only keep accepted proposals so we know who is hired for which task
        setAcceptedProposals((proposalsRes.data || []).filter(p => p.status === "accepted"));
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus !== "loading") {
      fetchTasks();
    }
  }, [session, sessionStatus]);

  // Show Toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Stats calculation
  const totalTasks = tasks.length;
  const openTasks = tasks.filter((t) => (t.status || "Open").toLowerCase() === "open").length;
  const inProgressTasks = tasks.filter((t) => (t.status || "").toLowerCase() === "in progress").length;
  const totalBudget = tasks.reduce((sum, t) => sum + Number(t.budget || 0), 0);

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: ClipboardCheck,
      iconBg: "bg-[#eaf5f2]",
      iconColor: "text-[#2a9d8f]",
      cardBg: "bg-white",
    },
    {
      title: "Open Tasks",
      value: openTasks,
      icon: CircleDot,
      iconBg: "bg-[#fffbeb]",
      iconColor: "text-[#d97706]",
      cardBg: "bg-white",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      iconBg: "bg-[#eaf5f2]",
      iconColor: "text-[#2a9d8f]",
      cardBg: "bg-white",
    },
    {
      title: "Total Budget",
      value: `$${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      icon: Wallet,
      iconBg: "bg-[#e2f1ed]",
      iconColor: "text-[#1a3c34]",
      cardBg: "bg-[#f0f7f4]",
    },
  ];

  // Search, Filter, Sort Logic
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const currentStatus = task.status || "Open";
      const matchesStatus = statusFilter === "All" || currentStatus.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
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

  // Description Toggle
  const toggleDescription = (id) => {
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Edit Modal
  const handleEditClick = (task) => {
    setEditingTask(task);
    setEditFormData({
      title: task.title || "",
      category: task.category || "",
      budget: task.budget || "",
      deadline: task.deadline || "",
      description: task.description || "",
      skills: task.skills || []
    });
    setEditErrors({});
  };

  // Skills input in modal
  const handleAddEditSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed || editFormData.skills.includes(trimmed)) return;
    if (editFormData.skills.length >= 10) {
      setEditErrors((prev) => ({ ...prev, skills: "Max 10 skills allowed" }));
      return;
    }
    setEditFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed]
    }));
    setEditSkillInput("");
    setEditErrors((prev) => ({ ...prev, skills: "" }));
  };

  const handleRemoveEditSkill = (skillToRemove) => {
    setEditFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  // Edit validation
  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.title.trim()) errors.title = "Title is required";
    if (editFormData.title.length < 5) errors.title = "Title must be at least 5 chars";
    if (!editFormData.category) errors.category = "Category is required";
    if (!editFormData.budget || Number(editFormData.budget) < 5) errors.budget = "Min budget is $5";
    if (!editFormData.deadline) errors.deadline = "Deadline is required";
    if (!editFormData.description.trim() || editFormData.description.length < 30) {
      errors.description = "Description must be at least 30 characters";
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setIsUpdating(true);
    try {
      const response = await updateTask(editingTask._id, {
        ...editFormData,
        status: editingTask.status || "Open"
      });
      if (response?.success) {
        showToast("Task updated successfully!");
        setEditingTask(null);
        fetchTasks();
      } else {
        showToast(response?.message || "Failed to update task", "error");
      }
    } catch (err) {
      showToast("Error updating task", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteClick = (id) => {
    setDeletingTaskId(id);
  };

  const confirmDelete = async () => {
    if (!deletingTaskId) return;
    setIsDeleting(true);
    try {
      const response = await deleteTask(deletingTaskId);
      if (response?.success) {
        showToast("Task deleted successfully!");
        setDeletingTaskId(null);
        fetchTasks();
      } else {
        showToast(response?.message || "Failed to delete task", "error");
      }
    } catch (err) {
      showToast("Error deleting task", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCompleteTask = async (task) => {
    if (!confirm(`Are you sure you want to mark "${task.title}" as Completed and release the committed budget/payment?`)) {
      return;
    }
    
    try {
      const response = await updateTask(task._id, {
        ...task,
        status: "Completed"
      });
      if (response?.success) {
        showToast("Task completed and payment released successfully!");
        fetchTasks();
      } else {
        showToast(response?.message || "Failed to complete task", "error");
      }
    } catch (err) {
      showToast("Error completing task", "error");
    }
  };

  // Submit Rating
  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (ratingScore === 0) {
      showToast("Please select a star rating", "error");
      return;
    }

    setIsSubmittingRating(true);
    try {
      const res = await submitRating({
        taskId: ratingModal.task._id,
        clientEmail: session.user.email,
        freelancerEmail: ratingModal.freelancer.freelancerEmail,
        rating: ratingScore,
        review: reviewText
      });

      if (res.success) {
        // Optimistically record that we rated it in localStorage so button updates
        localStorage.setItem(`rated_${ratingModal.task._id}`, "true");
        showToast("Rating submitted successfully!");
        setRatingModal({ isOpen: false, task: null, freelancer: null });
        setRatingScore(0);
        setReviewText("");
      } else {
        showToast(res.message || "Failed to submit rating", "error");
      }
    } catch (err) {
      showToast("Error submitting rating", "error");
    } finally {
      setIsSubmittingRating(false);
    }
  };

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
            Please sign in to view and manage your posted micro-tasks.
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
    <div className="space-y-10 max-w-7xl mx-auto pb-16 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl shadow-xl border animate-in fade-in slide-in-from-bottom-5 duration-300
            ${toast.type === "error" 
              ? "bg-red-50 text-red-800 border-red-200" 
              : "bg-[#eaf5f2] text-[#1a3c34] border-[#d4ebe6]"}`}
        >
          <CheckCircle2 className={`w-5 h-5 ${toast.type === "error" ? "text-red-500" : "text-[#2a9d8f]"}`} />
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] tracking-tight">
            My Tasks
          </h1>
          <p className="text-[#5a7a72] mt-1.5 text-[15px]">
            Review, edit, and keep track of all tasks you have posted on the platform.
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
                <p className="text-3xl font-semibold text-[#1a3c34]">
                  {loading ? (
                    <span className="inline-block w-12 h-6 bg-gray-100 animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-[#d4ebe6]/40 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#8aa89e]" />
          <input
            type="text"
            placeholder="Search tasks by title or content..."
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

        {/* Filter & Sort controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Pills */}
          <div className="flex bg-[#f4f8f6] p-1.5 rounded-2xl border border-[#d4ebe6]/60">
            {["All", "Open", "In Progress", "Completed"].map((tab) => {
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

          {/* Sort Selector */}
          <div className="relative flex items-center gap-1.5 bg-[#f4f8f6] px-3.5 py-2.5 rounded-2xl border border-[#d4ebe6]/60 text-xs text-[#5a7a72] font-semibold">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#2a9d8f]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-[#1a3c34] font-bold"
            >
              <option value="newest">Newest First</option>
              <option value="budget-desc">Budget: High to Low</option>
              <option value="budget-asc">Budget: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#2a9d8f]" />
            <p className="text-[#8aa89e] text-sm font-medium">Fetching your tasks...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold text-red-800">Unable to load tasks</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={fetchTasks}
            className="px-5 py-2 bg-red-600 text-white text-xs font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 bg-[#eaf5f2] text-[#2a9d8f] rounded-2xl flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1a3c34]">No Tasks Found</h3>
            <p className="text-[#8aa89e] text-sm mt-1.5 px-4">
              {searchTerm || statusFilter !== "All"
                ? "No tasks match your current search queries or filter selections."
                : "You haven't posted any micro-tasks yet. Get started and hire professional freelancers."}
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
              <span>Post Your First Task</span>
            </Link>
          )}
        </div>
      ) : (
        /* Tasks List Grid */
        <div className="grid grid-cols-1 gap-6">
          {filteredTasks.map((task) => {
            const isExpanded = expandedTasks[task._id];
            const taskStatus = task.status || "Open";
            
            // Status style map
            const statusStyle = 
              taskStatus.toLowerCase() === "open" 
                ? "text-[#d97706] bg-[#fffbeb] border-[#fef3c7]" 
                : taskStatus.toLowerCase() === "in progress"
                  ? "text-[#2a9d8f] bg-[#eaf5f2] border-[#d4ebe6]"
                  : "text-emerald-700 bg-emerald-50 border-emerald-100";

            return (
              <div
                key={task._id}
                className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-6 md:p-8 hover:shadow-md transition-all relative overflow-hidden group hover:border-[#2a9d8f]/30"
              >
                {/* Upper row */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eaf5f2] text-[#2a9d8f] border border-[#d4ebe6]/50">
                        <Tag className="w-3 h-3" />
                        {task.category || "General"}
                      </span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle}`}>
                        {taskStatus}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#1a3c34] tracking-tight group-hover:text-[#2a9d8f] transition-colors">
                      {task.title}
                    </h3>
                  </div>

                  {/* Pricing / Budget */}
                  <div className="bg-[#f0f7f4] border border-[#d4ebe6]/50 px-4 py-2.5 rounded-2xl flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-[#2a9d8f]" />
                    <span className="font-extrabold text-[#1a3c34] text-lg">
                      {Number(task.budget || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-[#8aa89e] font-semibold uppercase tracking-wider ml-1">USD</span>
                  </div>
                </div>

                {/* Task Description */}
                <div className="mt-4 space-y-2">
                  <p className={`text-[#5a7a72] text-[14px] leading-relaxed transition-all ${!isExpanded ? "line-clamp-2" : ""}`}>
                    {task.description}
                  </p>
                  {task.description && task.description.length > 180 && (
                    <button
                      onClick={() => toggleDescription(task._id)}
                      className="text-xs text-[#2a9d8f] hover:text-[#1a3c34] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          Show Less <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          Read Full Details <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Skills tags */}
                {task.skills && task.skills.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs text-[#8aa89e] mr-1 font-medium">Skills:</span>
                    {task.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-[#f4f8f6] hover:bg-[#eaf5f2] transition-colors px-2.5 py-1 rounded-lg text-[#5a7a72] border border-gray-100 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Lower row: deadline & actions */}
                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-[#8aa89e] font-medium">
                    <Calendar className="w-4 h-4 text-[#2a9d8f]" />
                    <span>Deadline:</span>
                    <span className="text-[#1a3c34] font-bold">
                      {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }) : "N/A"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {taskStatus.toLowerCase() === "in progress" && (
                      <button
                        onClick={() => handleCompleteTask(task)}
                        className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 hover:text-white hover:bg-emerald-600 hover:border-emerald-600 transition-all cursor-pointer tooltip"
                        title="Release Payment / Complete Task"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {taskStatus.toLowerCase() === "open" && (
                      <>
                        <button
                          onClick={() => handleEditClick(task)}
                          className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-[#5a7a72] hover:text-[#2a9d8f] hover:bg-[#eaf5f2] hover:border-[#2a9d8f]/30 transition-all cursor-pointer tooltip"
                          title="Edit task"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(task._id)}
                          className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-[#5a7a72] hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {taskStatus.toLowerCase() === "completed" && (
                      (() => {
                        const hiredProposal = acceptedProposals.find(p => p.taskId === task._id);
                        if (!hiredProposal) return null; // No one was hired (shouldn't happen for completed task ideally)

                        const hasRated = localStorage.getItem(`rated_${task._id}`) === "true";
                        
                        return hasRated ? (
                          <span className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-400 bg-gray-50 flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-gray-300 text-gray-300" /> Rated
                          </span>
                        ) : (
                          <button
                            onClick={() => setRatingModal({ isOpen: true, task, freelancer: hiredProposal })}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" /> Rate Freelancer
                          </button>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal (Glassmorphic) */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#d4ebe6]/50 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#d4ebe6]/30 flex items-center justify-between bg-[#f4f8f6]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#eaf5f2] flex items-center justify-center text-[#2a9d8f]">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a3c34]">Edit Task Details</h3>
                  <p className="text-[10px] text-[#8aa89e] mt-0.5">Modify task information and update live listings.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Task Title */}
              <div>
                <label className="block text-xs font-semibold text-[#8aa89e] uppercase tracking-wider mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
                    ${editErrors.title ? "border-red-400 focus:border-red-500 bg-red-50/20" : "border-gray-200 focus:border-[#2c7c74]"}`}
                  placeholder="e.g. Design a logo"
                />
                {editErrors.title && <p className="text-xs text-red-500 mt-1">{editErrors.title}</p>}
              </div>

              {/* Category & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8aa89e] uppercase tracking-wider mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c7c74] text-sm outline-none bg-white cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8aa89e] uppercase tracking-wider mb-2">
                    Budget (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-sm font-semibold text-[#8aa89e]">$</span>
                    <input
                      type="number"
                      required
                      min="5"
                      step="0.01"
                      value={editFormData.budget}
                      onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c7c74] text-sm outline-none"
                      placeholder="50"
                    />
                  </div>
                  {editErrors.budget && <p className="text-xs text-red-500 mt-1">{editErrors.budget}</p>}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-semibold text-[#8aa89e] uppercase tracking-wider mb-2">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={editFormData.deadline}
                  onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c7c74] text-sm outline-none"
                />
              </div>

              {/* Skills Editor */}
              <div>
                <label className="block text-xs font-semibold text-[#8aa89e] uppercase tracking-wider mb-2 flex justify-between">
                  <span>Required Skills (Max 10)</span>
                  <span>{editFormData.skills.length}/10</span>
                </label>
                <div className="border border-gray-200 rounded-xl p-2.5 focus-within:border-[#2c7c74] bg-white transition-all">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {editFormData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#eaf5f2] text-[#2a9d8f]"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveEditSkill(skill)}
                          className="hover:bg-white/50 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      ref={skillInputRef}
                      type="text"
                      placeholder={editFormData.skills.length === 0 ? "Press enter to add skills..." : "Add..."}
                      value={editSkillInput}
                      onChange={(e) => setEditSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          handleAddEditSkill(editSkillInput);
                        }
                      }}
                      className="flex-1 min-w-[80px] px-1 py-0.5 outline-none text-xs"
                      disabled={editFormData.skills.length >= 10}
                    />
                  </div>
                </div>
                {editErrors.skills && <p className="text-xs text-red-500 mt-1">{editErrors.skills}</p>}

                {/* Popular Skill suggestions */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {SUGGESTED_SKILLS.filter((s) => !editFormData.skills.includes(s)).slice(0, 5).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddEditSkill(skill)}
                      className="text-[10px] bg-gray-50 hover:bg-[#eaf5f2] text-[#5a7a72] px-2 py-0.5 rounded transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#8aa89e] uppercase tracking-wider mb-2">
                  Task Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c7c74] text-sm outline-none resize-y"
                  placeholder="Explain the work requirements details..."
                />
                {editErrors.description && <p className="text-xs text-red-500 mt-1">{editErrors.description}</p>}
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#5a7a72] hover:bg-gray-50 hover:text-[#1a3c34] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 rounded-xl bg-[#1a3c34] hover:bg-[#255248] text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Glassmorphic) */}
      {deletingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-red-100 p-6 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-red-950">Delete Task</h3>
                <p className="text-xs text-[#8aa89e] mt-0.5">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-[#5a7a72] leading-relaxed">
              Are you absolutely sure you want to delete this micro-task? It will be removed from all browse listings and active dashboards.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTaskId(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#5a7a72] hover:bg-gray-50 hover:text-[#1a3c34] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#d4ebe6]/50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-[#d4ebe6]/30 flex items-center justify-between bg-[#f4f8f6]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a3c34]">Rate Freelancer</h3>
                  <p className="text-[10px] text-[#8aa89e] mt-0.5">Share your experience working with {ratingModal.freelancer?.freelancerName || 'this freelancer'}</p>
                </div>
              </div>
              <button onClick={() => setRatingModal({ isOpen: false, task: null, freelancer: null })} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRatingSubmit} className="p-6 space-y-5">
              <div className="flex flex-col items-center justify-center py-2">
                <p className="text-sm font-bold text-[#5a7a72] mb-3">How would you rate the quality of work?</p>
                <div className="flex items-center gap-2" onMouseLeave={() => setHoverScore(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingScore(star)}
                      onMouseEnter={() => setHoverScore(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        className={`w-10 h-10 transition-colors ${
                          (hoverScore || ratingScore) >= star 
                            ? "fill-amber-400 text-amber-400" 
                            : "fill-gray-100 text-gray-200"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                {ratingScore > 0 && (
                  <span className="text-xs font-bold text-amber-600 mt-2 bg-amber-50 px-3 py-1 rounded-full">
                    {["Needs Work", "Fair", "Good", "Great", "Excellent!"][ratingScore - 1]}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8aa89e] uppercase tracking-wider mb-2">
                  Written Review (Optional)
                </label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 text-sm outline-none resize-none leading-relaxed text-[#5a7a72] transition-all"
                  placeholder="Leave a comment about the freelancer's communication, quality of work, speed..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setRatingModal({ isOpen: false, task: null, freelancer: null })} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#5a7a72] hover:bg-gray-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingRating || ratingScore === 0} className="px-6 py-2.5 rounded-xl bg-[#1a3c34] hover:bg-[#255248] text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 cursor-pointer">
                  {isSubmittingRating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
                  ) : (
                    <>Submit Rating</>
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
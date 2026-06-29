"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getAllUsers, toggleBlockUser } from "@/lib/actions/users";
import {
  Users as UsersIcon,
  Search,
  Loader2,
  AlertTriangle,
  Ban,
  ShieldCheck,
  X,
  UserCircle,
} from "lucide-react";

export default function AdminUsersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllUsers();
      if (res.success) {
        setUsers(res.data || []);
      } else {
        setError(res.message || "Failed to fetch users");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus !== "loading") fetchUsers();
  }, [sessionStatus]);

  const handleToggleBlock = async (user) => {
    // Prevent admins from blocking themselves
    if (user.email === session?.user?.email) {
      showToast("You cannot block your own admin account.", "error");
      return;
    }
    if (user.role === "admin") {
      showToast("Admin accounts cannot be blocked.", "error");
      return;
    }

    const nextBlocked = !user.isBlocked;
    const verb = nextBlocked ? "block" : "unblock";
    if (!confirm(`Are you sure you want to ${verb} ${user.name || user.email}?`)) return;

    setActionLoadingId(user._id || user.email);
    try {
      const res = await toggleBlockUser(user.email, nextBlocked);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.email === user.email ? { ...u, isBlocked: nextBlocked } : u))
        );
        showToast(`User ${nextBlocked ? "blocked" : "unblocked"} successfully.`);
      } else {
        showToast(res.message || `Failed to ${verb} user`, "error");
      }
    } catch (err) {
      showToast("Error updating user status", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users
    .filter((u) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q);
      const matchesRole = roleFilter === "All" || (u.role || "").toLowerCase() === roleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      // Blocked users float to top, then by name
      if (!!b.isBlocked - !!a.isBlocked !== 0) return !!b.isBlocked - !!a.isBlocked;
      return (a.name || "").localeCompare(b.name || "");
    });

  const totalUsers = users.length;
  const blockedCount = users.filter((u) => u.isBlocked).length;
  const freelancerCount = users.filter((u) => (u.role || "").toLowerCase() === "freelancer").length;
  const clientCount = users.filter((u) => (u.role || "").toLowerCase() === "client").length;

  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
      </div>
    );
  }

  const stats = [
    { title: "Total Users", value: totalUsers, icon: UsersIcon, iconBg: "bg-[#eaf5f2]", iconColor: "text-[#2a9d8f]" },
    { title: "Freelancers", value: freelancerCount, icon: UserCircle, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { title: "Clients", value: clientCount, icon: UserCircle, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
    { title: "Blocked", value: blockedCount, icon: Ban, iconBg: "bg-red-50", iconColor: "text-red-500" },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl shadow-xl border animate-in fade-in slide-in-from-bottom-5 duration-300
          ${toast.type === "error" ? "bg-red-50 text-red-800 border-red-200" : "bg-[#eaf5f2] text-[#1a3c34] border-[#d4ebe6]"}`}>
          {toast.type === "error" ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <ShieldCheck className="w-5 h-5 text-[#2a9d8f]" />}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] tracking-tight">Manage Users</h1>
        <p className="text-[#5a7a72] mt-1.5 text-[15px]">
          View all platform accounts and control block status. Blocked accounts lose login access.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-6 rounded-2xl border border-[#d4ebe6]/50 shadow-sm flex flex-col justify-between h-[140px] bg-white">
              <div className={`p-2.5 rounded-xl w-fit ${stat.iconBg} ${stat.iconColor}`}>
                <Icon size={20} />
              </div>
              <div className="space-y-1 mt-4">
                <span className="text-xs font-semibold text-[#8aa89e] uppercase tracking-wider">{stat.title}</span>
                <p className="text-2xl font-semibold text-[#1a3c34]">
                  {loading ? <span className="inline-block w-12 h-6 bg-gray-100 animate-pulse rounded" /> : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-3xl border border-[#d4ebe6]/40 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#8aa89e]" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
          <div className="flex items-center gap-1.5 bg-[#f4f8f6] px-3.5 py-2.5 rounded-2xl border border-[#d4ebe6]/60 text-xs text-[#5a7a72] font-semibold w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-[#1a3c34] font-bold w-full sm:w-auto"
            >
              <option value="All">All Roles</option>
              <option value="client">Clients</option>
              <option value="freelancer">Freelancers</option>
              <option value="admin">Admins</option>
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
          <button onClick={fetchUsers} className="px-5 py-2 bg-red-600 text-white text-xs font-medium rounded-xl">Try Again</button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#d4ebe6]/40 p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 bg-[#eaf5f2] text-[#2a9d8f] rounded-2xl flex items-center justify-center mx-auto">
            <UsersIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1a3c34]">No Users Found</h3>
            <p className="text-[#8aa89e] text-sm mt-1.5">No users match your current filters.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#d4ebe6]/40 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f4f8f6] border-b border-[#d4ebe6]/60">
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8aa89e] px-6 py-4">User</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8aa89e] px-6 py-4">Email</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[#8aa89e] px-6 py-4">Role</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wier tracking-wider text-[#8aa89e] px-6 py-4">Status</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-wider text-[#8aa89e] px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const isBlocked = !!user.isBlocked;
                  const isSelf = user.email === session?.user?.email;
                  const roleLower = (user.role || "").toLowerCase();
                  const roleStyle =
                    roleLower === "admin"
                      ? "text-purple-700 bg-purple-50 border-purple-200"
                      : roleLower === "freelancer"
                      ? "text-blue-700 bg-blue-50 border-blue-200"
                      : "text-[#2a9d8f] bg-[#eaf5f2] border-[#d4ebe6]";

                  return (
                    <tr key={user._id || user.email} className="hover:bg-[#f4f8f6]/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-[#d4ebe6]" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#eaf5f2] text-[#2a9d8f] flex items-center justify-center font-bold text-sm border border-[#d4ebe6]">
                              {(user.name || "?")[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-sm text-[#1a3c34]">{user.name || "Unknown"}</p>
                            {isSelf && <span className="text-[10px] text-[#8aa89e]">(You)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#5a7a72]">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${roleStyle}`}>
                          {user.role || "client"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border text-red-700 bg-red-50 border-red-200">
                            <Ban className="w-3 h-3" /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border text-emerald-700 bg-emerald-50 border-emerald-200">
                            <ShieldCheck className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleBlock(user)}
                          disabled={actionLoadingId === (user._id || user.email) || isSelf || roleLower === "admin"}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed
                            ${isBlocked
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                              : "bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white"
                            }`}
                        >
                          {actionLoadingId === (user._id || user.email) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                          ) : isBlocked ? (
                            "Unblock"
                          ) : (
                            "Block"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-[#f4f8f6] border-t border-[#d4ebe6]/60 px-6 py-3">
            <span className="text-sm font-bold text-[#5a7a72]">
              Showing {filteredUsers.length} of {users.length} users
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  PlusCircle,
  ListTodo,
  FileText,
  Wallet,
  Search,
  Briefcase,
  Star,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { FaRegUser } from "react-icons/fa6";


const CLIENT_NAV = [
  { name: "Dashboard", href: "/dashboard/client", icon: LayoutDashboard },
  { name: "Post a Task", href: "/dashboard/client/post-task", icon: PlusCircle },
  { name: "My Tasks", href: "/dashboard/client/my-tasks", icon: ListTodo },
  { name: "Manage Proposals", href: "/dashboard/client/proposals", icon: FileText },
  { name: "Payment History", href: "/dashboard/client/earnings", icon: Wallet },
];

const FREELANCER_NAV = [
  { name: "Dashboard", href: "/dashboard/freelancer", icon: LayoutDashboard },
  { name: "Find Work", href: "/tasks", icon: Search },
  { name: "My Proposals", href: "/dashboard/freelancer/my-proposals", icon: FileText },
  { name: "Active Projects", href: "/dashboard/freelancer/projects", icon: Briefcase },
  { name: "Earnings", href: "/dashboard/freelancer/earnings", icon: Wallet },
  { name: "My Profile", href: "/dashboard/freelancer/profile", icon: FaRegUser },
];

const ADMIN_NAV = [
  { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { name: "Manage Users", href: "/dashboard/admin/users", icon: FileText },
  { name: "Manage Tasks", href: "/dashboard/admin/tasks", icon: ListTodo },
  { name: "Transactions", href: "/dashboard/admin/transactions", icon: Wallet },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  // Mobile slide-in state (Section 11: mobile sidebar toggle)
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user;
  const role = user?.role || "client";

  const navItems = role === "admin"
    ? ADMIN_NAV
    : role === "freelancer"
      ? FREELANCER_NAV
      : CLIENT_NAV;

  const roleBadgeStyle =
    role === "admin"
      ? "text-purple-700 bg-purple-50 border border-purple-100"
      : role === "freelancer"
        ? "text-[#d97706] bg-amber-50 border border-amber-100"
        : "text-[#2a9d8f] bg-[#eaf5f2] dark:bg-[#1a2435] border border-[#d4ebe6] dark:border-[#1e293b]";

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  if (!session || !user) {
    return null;
  }

  return (
    <>
      {/* Mobile top bar with hamburger toggle */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-white dark:bg-[#131c2b] border-b border-[#d4ebe6] dark:border-slate-800 px-4 h-14 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-serif font-black text-[#1a3c34] dark:text-slate-100">SkillSwap</span>
          <span className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full ${roleBadgeStyle}`}>
            {role}
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-lg text-[#1a3c34] dark:text-slate-200 hover:bg-[#f0f9f6] dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          w-[280px] bg-white dark:bg-[#131c2b] text-[#1a3c34] dark:text-slate-100 flex flex-col shrink-0 border-r border-[#d4ebe6] dark:border-slate-800 shadow-sm
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6 flex flex-col h-full">

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg text-[#8aa89e] dark:text-[#6b7e94] hover:bg-[#f4f8f6] dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* User Profile Card */}
          <div className="bg-[#f0f9f6] dark:bg-[#1a2435] p-4 rounded-2xl flex items-center gap-4 mb-8 border border-[#d4ebe6] dark:border-[#1e293b]/60 dark:border-slate-800/80">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="rounded-full h-12 w-12 cursor-pointer hover:ring-2 hover:ring-[#2a9d8f]/30 transition-all object-cover shrink-0"
              />
            ) : (
              <div className="rounded-full h-12 w-12 bg-[#eaf5f2] dark:bg-slate-800/60 flex items-center justify-center shrink-0 border border-[#d4ebe6] dark:border-slate-700">
                <User className="w-6 h-6 text-[#2a9d8f]" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-[#1a3c34] dark:text-slate-200 font-bold text-[15px] leading-tight truncate">
                {user.name}
              </span>
              <span className={`text-xs font-semibold capitalize mt-1 px-2 py-0.5 rounded-full w-fit ${roleBadgeStyle}`}>
                {user?.role || "Client"}
              </span>
            </div>
          </div>

          {/* Section Label */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8aa89e] dark:text-slate-500 mb-3 px-1">
            {role === "admin" ? "Admin Menu" : role === "freelancer" ? "Freelancer Menu" : "Client Menu"}
          </p>

          {/* Navigation Links */}
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-[14px] group ${
                    isActive
                      ? "bg-[#eaf5f2] dark:bg-teal-950/20 text-[#1a3c34] dark:text-teal-400 shadow-sm"
                      : "text-[#5a7a72] dark:text-slate-300 hover:text-[#1a3c34] dark:hover:text-white hover:bg-[#f0f9f6] dark:hover:bg-slate-800/40"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-[#2a9d8f] rounded-r-full" />
                  )}
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${isActive ? "text-[#2a9d8f]" : "text-[#8aa89e] dark:text-[#6b7e94] group-hover:text-[#2a9d8f]"}`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="my-4 border-t border-[#d4ebe6] dark:border-[#1e293b]/60 dark:border-slate-800" />

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium text-[#5a7a72] dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 group w-full cursor-pointer"
          >
            <LogOut
              size={18}
              className="shrink-0 text-[#8aa89e] dark:text-[#6b7e94] group-hover:text-red-500 transition-colors"
            />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

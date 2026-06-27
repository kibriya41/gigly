"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  PlusCircle,
  ListTodo,
  FileText,
  Wallet,
  Settings,
  Search,
  Briefcase,
  Star,
  LogOut,
  User,
} from "lucide-react";
import { FaRegUser } from "react-icons/fa6";


const CLIENT_NAV = [
  { name: "Dashboard", href: "/dashboard/client", icon: LayoutDashboard },
  { name: "Post a Task", href: "/dashboard/client/post-task", icon: PlusCircle },
  { name: "My Tasks", href: "/dashboard/client/my-tasks", icon: ListTodo },
  { name: "Manage Proposals", href: "/dashboard/client/proposals", icon: FileText },
  { name: "Payment History", href: "/dashboard/client/earnings", icon: Wallet },
  { name: "Settings", href: "/dashboard/client/settings", icon: Settings },
];

const FREELANCER_NAV = [
  { name: "Dashboard", href: "/dashboard/freelancer", icon: LayoutDashboard },
  { name: "Find Work", href: "/tasks", icon: Search },
  { name: "My Proposals", href: "/dashboard/freelancer/my-proposals", icon: FileText },
  { name: "Active Projects", href: "/dashboard/freelancer/projects", icon: Briefcase },
  { name: "Earnings", href: "/dashboard/freelancer/earnings", icon: Wallet },
  { name: "My Profile", href: "/dashboard/freelancer/profile", icon: FaRegUser },
  { name: "Settings", href: "/dashboard/freelancer/settings", icon: Settings },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const user = session?.user;
  const isFreelancer = user?.role === "freelancer";

  const navItems = isFreelancer ? FREELANCER_NAV : CLIENT_NAV;

  const roleBadgeStyle = isFreelancer
    ? "text-[#d97706] bg-amber-50 border border-amber-100"
    : "text-[#2a9d8f] bg-[#eaf5f2] border border-[#d4ebe6]";

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  if (!session || !user) {
    return null;
  }

  return (
    <aside className="w-[280px] bg-white text-[#1a3c34] flex flex-col shrink-0 border-r border-[#d4ebe6] shadow-sm">
      <div className="p-6 flex flex-col h-full">

        {/* User Profile Card */}
        <div className="bg-[#f0f9f6] p-4 rounded-2xl flex items-center gap-4 mb-8 border border-[#d4ebe6]/60">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="rounded-full h-12 w-12 cursor-pointer hover:ring-2 hover:ring-[#2a9d8f]/30 transition-all object-cover shrink-0"
            />
          ) : (
            <div className="rounded-full h-12 w-12 bg-[#eaf5f2] flex items-center justify-center shrink-0 border border-[#d4ebe6]">
              <User className="w-6 h-6 text-[#2a9d8f]" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-[#1a3c34] font-bold text-[15px] leading-tight truncate">
              {user.name}
            </span>
            <span className={`text-xs font-semibold capitalize mt-1 px-2 py-0.5 rounded-full w-fit ${roleBadgeStyle}`}>
              {user?.role || "Client"}
            </span>
          </div>
        </div>

        {/* Section Label */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8aa89e] mb-3 px-1">
          {isFreelancer ? "Freelancer Menu" : "Client Menu"}
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
                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-[14px] group ${
                  isActive
                    ? "bg-[#eaf5f2] text-[#1a3c34] shadow-sm"
                    : "text-[#5a7a72] hover:text-[#1a3c34] hover:bg-[#f0f9f6]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-[#2a9d8f] rounded-r-full" />
                )}
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${isActive ? "text-[#2a9d8f]" : "text-[#8aa89e] group-hover:text-[#2a9d8f]"}`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-4 border-t border-[#d4ebe6]/60" />

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium text-[#5a7a72] hover:text-red-600 hover:bg-red-50 transition-all duration-200 group w-full"
        >
          <LogOut
            size={18}
            className="shrink-0 text-[#8aa89e] group-hover:text-red-500 transition-colors"
          />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
"use client";

import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@heroui/react";
import {
  LayoutDashboard,
  PlusCircle,
  ListTodo,
  FileText,
  Wallet,
  Settings
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();

  const user = session?.user;

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Post a Task", href: "/dashboard/post-task", icon: PlusCircle },
    { name: "My Tasks", href: "/dashboard/tasks", icon: ListTodo },
    { name: "Manage Proposals", href: "/dashboard/proposals", icon: FileText },
    { name: "Earnings", href: "/dashboard/earnings", icon: Wallet },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  // If loading or not authenticated, just render children so the page can handle loading/redirecting
  if (isPending || !session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f0f9f6]">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white text-[#1a3c34] flex flex-col shrink-0 border-r border-[#d4ebe6] shadow-sm">
        <div className="p-6 flex flex-col h-full">
          {/* User Profile Card */}
          <div className="bg-[#f0f9f6] p-4 rounded-2xl flex items-center gap-4 mb-8 border border-[#d4ebe6]/60">
            <img src={user.image} alt={user.name} className='rounded-full h-12 w-12 cursor-pointer hover:ring-2 hover:ring-[#2a9d8f]/30 transition-all object-cover' />
            <div className="flex flex-col">
              <span className="text-[#1a3c34] font-bold text-[15px] leading-tight">{user?.name}</span>
              <span className="text-[#2a9d8f] text-xs font-semibold capitalize mt-1 bg-[#eaf5f2] px-2 py-0.5 rounded-full w-fit">{user?.role || "Client"}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-[15px] ${isActive
                    ? "bg-[#eaf5f2] text-[#1a3c34] relative shadow-sm"
                    : "text-[#5a7a72] hover:text-[#1a3c34] hover:bg-[#f0f9f6]"
                    }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-[#2a9d8f] rounded-r-full" />
                  )}
                  <Icon size={20} className={isActive ? "text-[#2a9d8f]" : "text-[#8aa89e]"} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

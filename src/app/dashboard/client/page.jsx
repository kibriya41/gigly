"use client";

import React from "react";
import Link from "next/link";
import { ClipboardCheck, CircleDot, Clock, Wallet, Plus } from "lucide-react";

export default function ClientDashboardHomePage() {
  const stats = [
    {
      title: "Total Tasks",
      value: "128",
      icon: ClipboardCheck,
      iconBg: "bg-[#eaf5f2]",
      iconColor: "text-[#2a9d8f]",
      cardBg: "bg-white",
    },
    {
      title: "Open Tasks",
      value: "24",
      icon: CircleDot,
      iconBg: "bg-[#eaf5f2]",
      iconColor: "text-[#2a9d8f]",
      cardBg: "bg-white",
    },
    {
      title: "In Progress",
      value: "18",
      icon: Clock,
      iconBg: "bg-[#eaf5f2]",
      iconColor: "text-[#2a9d8f]",
      cardBg: "bg-white",
    },
    {
      title: "Total Spent",
      value: "$42.8k",
      icon: Wallet,
      iconBg: "bg-[#e2f1ed]",
      iconColor: "text-[#1a3c34]",
      cardBg: "bg-[#f0f7f4]",
    },
  ];

  const activeTasks = [
    {
      title: "Redesign onboarding flow",
      deadline: "Deadline: Fri, 18 Oct",
      proposals: "12 proposals",
      status: "In Progress",
      statusColor: "text-[#2a9d8f] bg-[#eaf5f2] border-[#d4ebe6]",
    },
    {
      title: "Build analytics landing page",
      deadline: "Deadline: Tue, 22 Oct",
      proposals: "8 proposals",
      status: "Open",
      statusColor: "text-[#d97706] bg-[#fffbeb] border-[#fef3c7]",
    },
    {
      title: "Create client onboarding docs",
      deadline: "Deadline: Thu, 31 Oct",
      proposals: "5 proposals",
      status: "In Progress",
      statusColor: "text-[#2a9d8f] bg-[#eaf5f2] border-[#d4ebe6]",
    },
  ];

  const proposals = [
    {
      initials: "JM",
      name: "Jordan Miles",
      description: "Bid for onboarding redesign",
      amount: "$1,200",
      avatarBg: "bg-[#f5ebe6]",
      avatarColor: "text-[#7c5e4d]",
    },
    {
      initials: "SK",
      name: "Sofia Kim",
      description: "Bid for analytics landing page",
      amount: "$980",
      avatarBg: "bg-[#eff2f7]",
      avatarColor: "text-[#4d627c]",
    },
    {
      initials: "AR",
      name: "Ava Reed",
      description: "Bid for client docs",
      amount: "$640",
      avatarBg: "bg-[#eaf5f2]",
      avatarColor: "text-[#2a9d8f]",
    },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[#5a7a72] mt-1.5 text-[15px]">
            Manage tasks, proposals, and spending from one premium workspace.
          </p>
        </div>
        <Link
          href="/dashboard/client/post-task"
          className="flex items-center justify-center gap-2 bg-[#1a3c34] hover:bg-[#255248] text-white px-5 py-3 rounded-full font-medium transition-all shadow-sm hover:shadow-md cursor-pointer w-fit self-start md:self-auto"
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
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: My Active Tasks */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#d4ebe6]/40 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-[#1a3c34]">
              My Active Tasks
            </h2>
            <p className="text-[#8aa89e] text-sm mt-1">
              Track active work without table clutter.
            </p>
          </div>

          <div className="space-y-4">
            {activeTasks.map((task, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-5 rounded-2xl border border-[#d4ebe6]/60 hover:border-[#2a9d8f]/40 hover:bg-[#f0f9f6]/30 transition-all gap-4"
              >
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-[16px] text-[#1a3c34]">
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#8aa89e]">
                    <span>{task.deadline}</span>
                    <span>•</span>
                    <span>{task.proposals}</span>
                  </div>
                </div>
                <span
                  className={`text-[12px] font-semibold px-3 py-1 rounded-full border ${task.statusColor}`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Proposals */}
        <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-[#d4ebe6]/40 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-[#1a3c34]">
              Recent Proposals
            </h2>
            <p className="text-[#8aa89e] text-sm mt-1">
              Review freelancer bids and respond quickly.
            </p>
          </div>

          <div className="space-y-4">
            {proposals.map((proposal, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border border-[#d4ebe6]/60 hover:border-[#2a9d8f]/30 hover:bg-[#f0f9f6]/20 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm ${proposal.avatarBg} ${proposal.avatarColor}`}
                    >
                      {proposal.initials}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[15px] text-[#1a3c34]">
                        {proposal.name}
                      </h4>
                      <p className="text-xs text-[#8aa89e] mt-0.5">
                        {proposal.description}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[16px] text-[#2a9d8f]">
                    {proposal.amount}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button className="px-4 py-2 text-sm font-semibold rounded-xl text-[#5a7a72] hover:text-[#1a3c34] hover:bg-[#f0f9f6] transition-all cursor-pointer">
                    Decline
                  </button>
                  <button className="px-5 py-2 text-sm font-semibold rounded-xl bg-[#2a9d8f]/10 text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white transition-all cursor-pointer">
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@heroui/react";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f9f6]">
        <p className="text-[#2a9d8f] font-medium animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9f6] via-[#f8fcfb] to-[#eaf5f2] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#d4ebe6] shadow-xl shadow-[#2a9d8f]/5">
          <h1 className="text-3xl font-bold text-[#1a3c34] mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-[#5a7a72]">
            Role: <span className="capitalize font-semibold text-[#2a9d8f]">{user.role || "User"}</span>
          </p>
          <p className="text-[#5a7a72]">
            Email: <span className="font-semibold">{user.email}</span>
          </p>

          {user.role === "freelancer" && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border border-[#d4ebe6] shadow-sm">
                <h3 className="text-sm font-semibold text-[#6b8a82] uppercase tracking-wider mb-2">Your Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills?.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-[#eaf5f2] text-[#2a9d8f] rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  )) || <span className="text-gray-400 italic">No skills listed</span>}
                </div>
              </Card>

              <Card className="p-6 border border-[#d4ebe6] shadow-sm">
                <h3 className="text-sm font-semibold text-[#6b8a82] uppercase tracking-wider mb-2">Hourly Rate</h3>
                <p className="text-3xl font-bold text-[#1a3c34]">
                  ${user.hirePrice || 0}<span className="text-lg text-[#8aa89e] font-normal">/hr</span>
                </p>
              </Card>

              <Card className="p-6 border border-[#d4ebe6] shadow-sm md:col-span-2">
                <h3 className="text-sm font-semibold text-[#6b8a82] uppercase tracking-wider mb-2">Bio</h3>
                <p className="text-[#1a3c34] leading-relaxed">
                  {user.bio || "No bio provided."}
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

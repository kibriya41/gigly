"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Search, Compass, Sparkles, CornerDownLeft, RefreshCw } from "lucide-react";

export default function NotFound() {
  const router = useRouter(); // wait router from next/navigation
  const [searchQuery, setSearchQuery] = useState("");
  const [countdown, setCountdown] = useState(15);
  const [autoRedirect, setAutoRedirect] = useState(true);

  // Auto redirection timer
  useEffect(() => {
    if (!autoRedirect) return;
    if (countdown <= 0) {
      router.push("/");
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, autoRedirect, router]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-6 py-12 relative overflow-hidden select-none" style={{ backgroundColor: "#f4f8f6" }}>

      {/* Modern ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-30 blur-[140px]" style={{ background: "radial-gradient(circle, #2c7c74 0%, transparent 70%)" }} aria-hidden />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full pointer-events-none opacity-20 blur-[100px]" style={{ background: "radial-gradient(circle, #a8c8c4 0%, transparent 70%)" }} aria-hidden />

      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" aria-hidden>
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(#1a1f2e 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto w-full">

        {/* Floating badge with interactive countdown toggle */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border backdrop-blur-md shadow-xs transition-all" style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderColor: "#e2e8e0", color: "#2c7c74" }}>
          <Sparkles size={13} className="animate-pulse shrink-0" />
          <span>Error 404 • Page Not Found</span>
          {autoRedirect && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-300 mx-0.5" />
              <button 
                onClick={() => setAutoRedirect(false)}
                className="hover:underline flex items-center gap-1 font-normal text-slate-500 hover:text-slate-800"
                title="Click to cancel auto-redirect"
              >
                Redirecting in <span className="font-bold text-[#2c7c74]">{countdown}s</span> (Cancel)
              </button>
            </>
          )}
        </div>

        {/* Advanced minimal typography container */}
        <div className="relative mb-4 flex flex-col items-center justify-center">
          <div className="text-[8.5rem] sm:text-[11rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#1a1f2e]/10 to-transparent">
            404
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "#1a1f2e" }}>
              Lost in Space?
            </h1>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8 font-normal" style={{ color: "#5a6578" }}>
          We couldn&apos;t find the exact page you&apos;re looking for. Search for tasks directly or try one of the quick actions below.
        </p>

        {/* ADVANCED FEATURE 1: Interactive Quick Search */}
        <form onSubmit={handleSearch} className="mb-8 w-full max-w-md mx-auto relative group">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, skills, or services..."
              className="w-full pl-11 pr-24 py-3.5 rounded-2xl text-sm transition-all outline-none border bg-white/90 focus:bg-white focus:ring-2 focus:ring-[#2c7c74]/20 shadow-xs"
              style={{ borderColor: "#e2e8e0", color: "#1a1f2e" }}
            />
            <Search size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#2c7c74] transition-colors" />
            <button
              type="submit"
              className="absolute right-2.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95 flex items-center gap-1"
              style={{ backgroundColor: "#2c7c74" }}
            >
              <span>Search</span>
              <CornerDownLeft size={12} />
            </button>
          </div>
        </form>

        {/* ADVANCED FEATURE 2: Smart Navigation & Back Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-xs active:scale-[0.98]"
            style={{
              backgroundColor: "#ffffff",
              color: "#5a6578",
              border: "1px solid #e2e8e0",
            }}
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            style={{
              backgroundColor: "#2c7c74",
              boxShadow: "0 4px 18px rgba(44, 124, 116, 0.22)",
            }}
          >
            <Home size={16} />
            Homepage
          </Link>

          <Link
            href="/tasks"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-xs active:scale-[0.98]"
            style={{
              backgroundColor: "#ffffff",
              color: "#1a1f2e",
              border: "1px solid #e2e8e0",
            }}
          >
            <Compass size={16} style={{ color: "#2c7c74" }} />
            Browse Tasks
          </Link>
        </div>

      </div>
    </div>
  );
}

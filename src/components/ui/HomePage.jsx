'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Briefcase, Search, Star, Users, Clock, Shield,
  Zap, TrendingUp, DollarSign, ChevronRight, CheckCircle,
  Code, PenTool, Megaphone, LayoutGrid, FileText, Award,
  MapPin, Calendar, Tag, Loader2, Send, CreditCard, Lock,
  Sparkles, Play, Pause, Quote, MousePointer2, Activity,
  BarChart3, Layers, Globe, Heart, Eye, ArrowUpRight,
  ChevronLeft, X, Menu, Bell, User
} from 'lucide-react';

/* ============================================================
   THEME TOKENS — Sage & Teal palette matching your screenshots
   ============================================================ */
const T = {
  primary:        '#2c7c74',
  primaryHover:   '#236b64',
  primaryLight:   '#e8f4f2',
  primaryMuted:   '#7cb4ac',
  primaryGlow:    'rgba(44,124,116,0.15)',
  sage:           '#f4f8f6',
  white:          '#ffffff',
  dark:           '#1a1f2e',
  text:           '#5a6578',
  muted:          '#94a3b8',
  border:         '#e2e8e0',
  chartGreen:     '#a8c8c4',
  cardShadow:     '0 1px 3px rgba(0,0,0,0.04)',
  elevatedShadow: '0 20px 60px rgba(44,124,116,0.08), 0 8px 20px rgba(0,0,0,0.04)',
  darkShadow:     '0 25px 50px rgba(0,0,0,0.15)',
};

/* ============================================================
   ADVANCED ANIMATION UTILITIES
   ============================================================ */

function useInView(threshold = 0.15, once = true) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        if (once) obs.disconnect();
      }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once]);
  return { ref, inView };
}

function useCountUp(end, duration = 1800) {
  const [val, setVal] = useState(0);
  const { ref, inView } = useInView(0.5);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.floor(eased * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);
  return { val, ref };
}

function useMouseParallax(intensity = 20) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * intensity;
      const y = (e.clientY / window.innerHeight - 0.5) * intensity;
      setPos({ x, y });
    };
    window.addEventListener('mousemove', handle, { passive: true });
    return () => window.removeEventListener('mousemove', handle);
  }, [intensity]);
  return pos;
}

function useTypingEffect(texts, speed = 80, pause = 2000) {
  const [display, setDisplay] = useState('');
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[index];
    let timer;
    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplay(d => d.slice(0, -1));
        if (display.length <= 1) {
          setIsDeleting(false);
          setIndex((i) => (i + 1) % texts.length);
        }
      }, speed / 2);
    } else {
      if (display.length < current.length) {
        timer = setTimeout(() => {
          setDisplay(current.slice(0, display.length + 1));
        }, speed);
      } else {
        timer = setTimeout(() => setIsDeleting(true), pause);
      }
    }
    return () => clearTimeout(timer);
  }, [display, isDeleting, index, texts, speed, pause]);

  return display;
}

/* ============================================================
   REUSABLE COMPONENTS
   ============================================================ */

function Section({ children, className = '', id, style }) {
  const { ref, inView } = useInView(0.1);
  return (
    <section
      ref={ref} id={id} style={style}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
    >
      {children}
    </section>
  );
}

function Stars({ rating }) {
  const n = parseFloat(rating) || 0;
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(n) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Badge({ children, color = 'primary', className = '' }) {
  const colors = {
    primary: { bg: T.primaryLight, text: T.primary },
    purple: { bg: '#f3e8ff', text: '#7c3aed' },
    blue: { bg: '#dbeafe', text: '#2563eb' },
    amber: { bg: '#fef3c7', text: '#d97706' },
    rose: { bg: '#ffe4e6', text: '#e11d48' },
    teal: { bg: '#ccfbf1', text: '#0d9488' },
  };
  const c = colors[color] || colors.primary;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md ${className}`} style={{ backgroundColor: c.bg, color: c.text }}>
      {children}
    </span>
  );
}

/* ============================================================
   FLOATING PARTICLES — Organic ambient background
   ============================================================ */
function FloatingParticles() {
  const particles = useMemo(() => [
    { size: 320, x: 85, y: 10, dur: 22, del: 0, opacity: 0.25 },
    { size: 260, x: 5, y: 70, dur: 28, del: 3, opacity: 0.2 },
    { size: 200, x: 45, y: 30, dur: 18, del: 1, opacity: 0.3 },
    { size: 160, x: 70, y: 80, dur: 24, del: 5, opacity: 0.2 },
    { size: 120, x: 25, y: 50, dur: 20, del: 2, opacity: 0.25 },
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size, height: p.size,
            left: `${p.x}%`, top: `${p.y}%`,
            backgroundColor: T.primaryLight,
            filter: 'blur(80px)',
            opacity: p.opacity,
            animation: `floatParticle ${p.dur}s ease-in-out ${p.del}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatParticle {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.05); }
          66% { transform: translate(-15px, 20px) scale(0.95); }
          100% { transform: translate(30px, -20px) scale(1.08); }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   MARQUEE TEXT — Scrolling brand trust bar
   ============================================================ */
function MarqueeBar() {
  const items = [
    'Trusted by 10,000+ freelancers',
    'Secure Stripe Payments',
    'Verified Professionals',
    '24/7 Support',
    'No Hidden Fees',
    'Fast Hiring Process',
    'Money Back Guarantee',
  ];

  return (
    <div className="w-full overflow-hidden py-3 border-y" style={{ borderColor: T.border, backgroundColor: T.white }}>
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-2 mx-8 text-xs font-medium" style={{ color: T.muted }}>
            <CheckCircle className="w-3.5 h-3.5" style={{ color: T.primary }} />
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee { animation: marquee 25s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}

/* ============================================================
   LIVE ACTIVITY TICKER — Simulated real-time updates
   ============================================================ */
function LiveActivityTicker({ tasks }) {
  const [current, setCurrent] = useState(0);
  const activities = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    return tasks.slice(0, 5).map(t => ({
      text: `New task posted: "${t.title?.slice(0, 30)}${t.title?.length > 30 ? '...' : ''}" — $${t.budget}`,
      time: 'Just now',
    }));
  }, [tasks]);

  useEffect(() => {
    if (activities.length === 0) return;
    const interval = setInterval(() => {
      setCurrent(c => (c + 1) % activities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activities.length]);

  if (activities.length === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border" style={{ borderColor: T.border, boxShadow: T.cardShadow }}>
      <div className="relative">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-40" />
      </div>
      <div className="overflow-hidden h-5 flex-1">
        <div
          className="transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(-${current * 20}px)` }}
        >
          {activities.map((a, i) => (
            <div key={i} className="h-5 flex items-center text-xs font-medium truncate" style={{ color: T.text }}>
              {a.text}
            </div>
          ))}
        </div>
      </div>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: T.primaryLight, color: T.primary }}>
        LIVE
      </span>
    </div>
  );
}

/* ============================================================
   ACTIVITY BAR — Animated chart bars
   ============================================================ */
function ActivityBar({ height, delay, day }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
        <div
          className="w-full max-w-[32px] rounded-t-lg transition-all duration-1000 ease-out relative overflow-hidden group"
          style={{
            height: visible ? `${height}%` : '0%',
            backgroundColor: height > 60 ? T.primary : T.chartGreen,
            transitionDelay: `${delay}ms`,
          }}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
      <span className="text-[10px] font-medium" style={{ color: T.muted }}>{day}</span>
    </div>
  );
}

/* ============================================================
   HERO SECTION — Enhanced with parallax, typing, live ticker
   ============================================================ */
function HeroSection({ stats, tasks }) {
  const [mounted, setMounted] = useState(false);
  const mousePos = useMouseParallax(15);
  const typedText = useTypingEffect([
    'Logo Designers',
    'React Developers',
    'Content Writers',
    'SEO Experts',
    'UI/UX Designers',
  ], 80, 2500);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const activityData = [
    { day: 'Mon', height: 45 }, { day: 'Tue', height: 65 }, { day: 'Wed', height: 40 },
    { day: 'Thu', height: 85 }, { day: 'Fri', height: 55 }, { day: 'Sat', height: 70 },
    { day: 'Sun', height: 50 },
  ];

  const heroStats = [
    { label: 'Open Tasks', value: stats.openTasks || 0, icon: Briefcase, format: (v) => v.toLocaleString() },
    { label: 'Earnings', value: stats.totalPaidOut || 0, icon: DollarSign, format: (v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}` },
    { label: 'Proposals', value: stats.totalProposals || 0, icon: FileText, subtext: stats.totalProposals > 0 ? `${Math.min(stats.totalProposals, 43)} awaiting review` : null },
    { label: 'Ratings', value: stats.avgRating || 4.9, icon: Star, format: (v) => v.toFixed ? v.toFixed(1) : v, subtext: 'Trusted by clients worldwide' },
  ];

  const features = [
    { icon: Shield, label: 'Secure Payments', desc: 'Stripe-protected transactions' },
    { icon: Users, label: 'Verified Freelancers', desc: 'Vetted professionals only' },
    { icon: Zap, label: 'Fast Hiring', desc: 'Hire within minutes' },
    { icon: Lock, label: 'Stripe Protected', desc: 'Your money is safe' },
  ];

  return (
    <div className="relative min-h-[95vh] flex items-center overflow-hidden" style={{ backgroundColor: T.sage }}>
      <FloatingParticles />

      {/* Parallax decorative orbs */}
      <div
        className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{
          backgroundColor: T.primary,
          filter: 'blur(80px)',
          transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      />
      <div
        className="absolute bottom-20 left-10 w-48 h-48 rounded-full opacity-15 pointer-events-none"
        style={{
          backgroundColor: T.chartGreen,
          filter: 'blur(60px)',
          transform: `translate(${mousePos.x * -1.5}px, ${mousePos.y * -1.5}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Content */}
          <div className={`space-y-8 max-w-xl transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Trust Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium backdrop-blur-sm"
              style={{ backgroundColor: `${T.primaryLight}cc`, color: T.primary, border: `1px solid ${T.primary}20` }}
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Trusted by {stats.totalUsers > 0 ? `${stats.totalUsers.toLocaleString()}+` : '10,000+'} professionals</span>
            </div>

            {/* Heading with typing effect */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.15] tracking-tight" style={{ color: T.dark }}>
              Get Your Tasks Done by{' '}
              <span className="relative inline-block" style={{ color: T.primary }}>
                Skilled Freelancers
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 2 100 2 150 6C200 10 250 10 298 2" stroke={T.primary} strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
                </svg>
              </span>
            </h1>

            {/* Dynamic subtitle with typing */}
            <p className="text-lg leading-relaxed" style={{ color: T.text }}>
              Hire expert{' '}
              <span className="font-semibold inline-block min-w-[140px]" style={{ color: T.primary }}>
                {typedText}
                <span className="animate-pulse">|</span>
              </span>{' '}
              for any project. Fast, secure, and hassle-free.
            </p>

            {/* Live Activity Ticker */}
            <div className="max-w-md">
              <LiveActivityTicker tasks={tasks} />
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <Link
                href="/dashboard/client/post-task"
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-white font-semibold text-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: T.primary, boxShadow: `0 8px 30px ${T.primary}40` }}
              >
                <Briefcase className="w-4 h-4" />
                Post a Task
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/tasks"
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-sm transition-all duration-300 hover:shadow-md hover:border-[#2c7c74]"
                style={{ backgroundColor: T.white, color: T.dark, border: `1.5px solid ${T.border}` }}
              >
                <Search className="w-4 h-4" />
                Browse Tasks
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            {/* Feature pills — 2x2 grid with hover effects */}
            <div className={`grid grid-cols-2 gap-3 pt-2 transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              {features.map(({ icon: Icon, label, desc }, i) => (
                <div
                  key={label}
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white transition-all duration-500 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 cursor-default border border-transparent hover:border-[#2c7c74]20"
                  style={{ boxShadow: T.cardShadow, animationDelay: `${400 + i * 100}ms` }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-[#2c7c74]" style={{ backgroundColor: T.primaryLight }}>
                    <Icon className="w-4 h-4 transition-colors duration-300 group-hover:text-white" style={{ color: T.primary }} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold block truncate" style={{ color: T.dark }}>{label}</span>
                    <span className="text-[10px] block truncate" style={{ color: T.muted }}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard Preview Card with 3D tilt */}
          <div className={`relative lg:pl-8 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div
              className="relative rounded-3xl p-6 lg:p-8 bg-white transition-transform duration-300"
              style={{
                boxShadow: T.elevatedShadow,
                transform: `perspective(1000px) rotateY(${mousePos.x * 0.3}deg) rotateX(${mousePos.y * -0.3}deg)`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: T.dark }}>Workspace Overview</h3>
                  <p className="text-xs mt-0.5" style={{ color: T.muted }}>Live tasks, projects and earnings snapshot</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: T.primaryLight, color: T.primary }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  Premium
                </span>
              </div>

              {/* 2x2 Stat Grid with hover lift */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {heroStats.map((s, i) => {
                  const Icon = s.icon;
                  const displayVal = s.format ? s.format(s.value) : s.value.toLocaleString();
                  return (
                    <div
                      key={i}
                      className="rounded-2xl p-4 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border group cursor-default"
                      style={{ boxShadow: T.cardShadow, borderColor: T.border }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium" style={{ color: T.muted }}>{s.label}</span>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 group-hover:bg-[#2c7c74]" style={{ backgroundColor: T.primaryLight }}>
                          <Icon className="w-4 h-4 transition-colors duration-300 group-hover:text-white" style={{ color: T.primary }} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold" style={{ color: T.dark }}>{displayVal}</div>
                      {s.subtext ? (
                        <div className="text-[10px] mt-1 font-medium" style={{ color: T.muted }}>{s.subtext}</div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-medium mt-1" style={{ color: T.primary }}>
                          <TrendingUp className="w-3 h-3" /> +18.4% this month
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Weekly Activity Chart */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: T.sage }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold" style={{ color: T.dark }}>Weekly Activity</h4>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: T.primary }} />
                    <span className="text-xs font-semibold" style={{ color: T.primary }}>+24%</span>
                  </div>
                </div>
                <div className="flex items-end gap-3 h-[100px]">
                  {activityData.map((item, i) => (
                    <ActivityBar key={item.day} height={item.height} day={item.day} delay={800 + i * 100} />
                  ))}
                </div>
              </div>

              {/* Decorative floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl opacity-60" style={{ backgroundColor: T.primaryLight, animation: 'floatParticle 8s ease-in-out infinite' }} />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full opacity-40" style={{ backgroundColor: T.chartGreen, animation: 'floatParticle 10s ease-in-out 2s infinite' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LATEST FEATURED TASKS — Horizontal card row with hover effects
   ============================================================ */
function LatestTasksSection({ tasks }) {
  const categoryColor = {
    Design:      'bg-purple-50 text-purple-600',
    Development: 'bg-blue-50 text-blue-600',
    Writing:     'bg-amber-50 text-amber-600',
    Marketing:   'bg-rose-50 text-rose-600',
    Other:       'bg-teal-50 text-teal-600',
    Branding:    'bg-orange-50 text-orange-600',
  };

  const categoryIcon = {
    Design: PenTool, Development: Code, Writing: FileText,
    Marketing: Megaphone, Other: LayoutGrid, Branding: Sparkles,
  };

  return (
    <Section className="py-24 px-6" style={{ backgroundColor: T.sage }} id="featured-tasks">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge color="teal"><Zap className="w-3 h-3" /> Fresh</Badge>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: T.dark }}>Latest Featured Tasks</h2>
            <p className="text-sm mt-1.5" style={{ color: T.muted }}>Premium opportunities curated for speed, clarity, and trust.</p>
          </div>
          <Link
            href="/tasks"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5 shrink-0"
            style={{ color: T.primary }}
          >
            View all tasks <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Task Cards */}
        {tasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: T.primaryLight }}>
              <Briefcase className="w-8 h-8" style={{ color: T.primaryMuted }} />
            </div>
            <p className="text-sm font-medium" style={{ color: T.muted }}>No open tasks yet. Be the first to post one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tasks.slice(0, 4).map((task, i) => {
              const cat = task.category || 'Other';
              const badge = categoryColor[cat] || categoryColor['Other'];
              const CatIcon = categoryIcon[cat] || Briefcase;
              const days = task.deadline ? Math.max(0, Math.ceil((new Date(task.deadline) - new Date()) / 86400000)) : null;
              const poster = task.client_email ? task.client_email.split('@')[0] : (task.buyerEmail ? task.buyerEmail.split('@')[0] : 'Client');
              const initials = poster.slice(0, 1).toUpperCase();

              return (
                <Link
                  key={task._id || i}
                  href={`/tasks/${task._id}`}
                  className="group bg-white rounded-2xl p-5 border flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                  style={{ borderColor: T.border }}
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2c7c74]/0 to-[#2c7c74]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Top row — category icon + budget */}
                  <div className="flex items-start justify-between gap-2 mb-3 relative">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${badge}`}>
                      <CatIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0" style={{ backgroundColor: T.primaryLight, color: T.primary }}>
                      ${Number(task.budget || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold group-hover:text-[#2c7c74] transition-colors line-clamp-2 mb-2 relative" style={{ color: T.dark }}>
                    {task.title}
                  </h3>

                  {/* Category + deadline */}
                  <div className="flex items-center gap-2 mb-4 relative">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge}`}>{cat}</span>
                    {days !== null && (
                      <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: T.muted }}>
                        <Clock className="w-3 h-3" /> Due in {days} days
                      </span>
                    )}
                  </div>

                  {/* Description preview */}
                  <p className="text-xs line-clamp-2 mb-4 relative" style={{ color: T.muted }}>
                    {task.description?.slice(0, 80) || 'No description provided...'}
                  </p>

                  {/* Poster + CTA */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t relative" style={{ borderColor: T.border }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: T.primaryLight, color: T.primary }}>
                        {initials}
                      </div>
                      <div>
                        <div className="text-xs font-semibold" style={{ color: T.dark }}>{poster.charAt(0).toUpperCase() + poster.slice(1)}</div>
                        <div className="text-[10px]" style={{ color: T.muted }}>Posted recently</div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0" style={{ backgroundColor: T.primaryLight }}>
                      <ArrowUpRight className="w-4 h-4" style={{ color: T.primary }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Section>
  );
}

/* ============================================================
   POPULAR CATEGORIES — Interactive category grid (Extra Section)
   ============================================================ */
function PopularCategoriesSection() {
  const categories = [
    { name: 'Design', icon: PenTool, count: 128, color: 'purple', gradient: 'from-purple-500/10 to-purple-500/5' },
    { name: 'Development', icon: Code, count: 245, color: 'blue', gradient: 'from-blue-500/10 to-blue-500/5' },
    { name: 'Writing', icon: FileText, count: 89, color: 'amber', gradient: 'from-amber-500/10 to-amber-500/5' },
    { name: 'Marketing', icon: Megaphone, count: 156, color: 'rose', gradient: 'from-rose-500/10 to-rose-500/5' },
    { name: 'Other', icon: LayoutGrid, count: 67, color: 'teal', gradient: 'from-teal-500/10 to-teal-500/5' },
  ];

  const colorMap = {
    purple: { bg: '#f3e8ff', text: '#7c3aed', hover: '#7c3aed' },
    blue: { bg: '#dbeafe', text: '#2563eb', hover: '#2563eb' },
    amber: { bg: '#fef3c7', text: '#d97706', hover: '#d97706' },
    rose: { bg: '#ffe4e6', text: '#e11d48', hover: '#e11d48' },
    teal: { bg: '#ccfbf1', text: '#0d9488', hover: '#0d9488' },
  };

  return (
    <Section className="py-24 px-6 bg-white" id="categories">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <Badge color="blue"><Layers className="w-3 h-3" /> Explore</Badge>
          <h2 className="text-3xl font-bold mt-3" style={{ color: T.dark }}>Popular Categories</h2>
          <p className="text-sm mt-2" style={{ color: T.muted }}>Browse tasks by category and find the perfect match for your skills.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            const colors = colorMap[cat.color];
            return (
              <Link
                key={cat.name}
                href={`/tasks?category=${cat.name}`}
                className="group relative rounded-2xl p-6 border text-center transition-all duration-500 hover:shadow-xl hover:-translate-y-2 overflow-hidden"
                style={{ borderColor: T.border, backgroundColor: T.white }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <Icon className="w-6 h-6 transition-colors duration-300" style={{ color: colors.text }} />
                  </div>
                  <h3 className="font-bold text-sm mb-1 group-hover:text-[#2c7c74] transition-colors" style={{ color: T.dark }}>{cat.name}</h3>
                  <p className="text-xs" style={{ color: T.muted }}>{cat.count} open tasks</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ============================================================
   TOP FREELANCERS — Enhanced cards with skill tags
   ============================================================ */
function TopFreelancersSection({ freelancers }) {
  const colors = [
    'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700', 'bg-cyan-100 text-cyan-700',
  ];

  return (
    <Section className="py-24 px-6" style={{ backgroundColor: T.sage }} id="top-freelancers">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge color="amber"><Award className="w-3 h-3" /> Top Rated</Badge>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: T.dark }}>Top Freelancers</h2>
            <p className="text-sm mt-1.5" style={{ color: T.muted }}>Handpicked professionals with proven track records.</p>
          </div>
          <Link
            href="/freelancers"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5 shrink-0"
            style={{ color: T.primary }}
          >
            All Freelancers <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {freelancers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: T.primaryLight }}>
              <Users className="w-8 h-8" style={{ color: T.primaryMuted }} />
            </div>
            <p className="text-sm font-medium" style={{ color: T.muted }}>No freelancers yet. Register to become one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {freelancers.slice(0, 4).map((fl, i) => {
              const avg = Number(fl.avgRating) || 0;
              const cnt = Number(fl.ratingCount) || 0;
              const initials = (fl.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const skills = fl.skills || [];
              const colorCls = colors[i % colors.length];
              const hourlyRate = fl.hourlyRate || Math.floor(50 + Math.random() * 100);

              return (
                <Link
                  key={fl._id || fl.email || i}
                  href={`/freelancers/${encodeURIComponent(fl.email)}`}
                  className="group bg-white rounded-2xl p-5 border hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden relative"
                  style={{ borderColor: T.border }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2c7c74]/0 to-[#2c7c74]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Top row: avatar + name + rating */}
                  <div className="flex items-center gap-3 mb-4 relative">
                    {fl.image ? (
                      <img src={fl.image} alt={fl.name} className="w-12 h-12 rounded-full object-cover border-2 group-hover:border-[#2c7c74] transition-all duration-300 group-hover:scale-110" style={{ borderColor: T.border }} />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${colorCls} transition-transform duration-300 group-hover:scale-110`}>
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm group-hover:text-[#2c7c74] transition-colors truncate" style={{ color: T.dark }}>
                        {fl.name || 'Anonymous'}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold" style={{ color: T.dark }}>{avg > 0 ? avg.toFixed(1) : 'New'}</span>
                        <span className="text-[10px]" style={{ color: T.muted }}>({cnt} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills with animated tags */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4 relative">
                      {skills.slice(0, 3).map(s => (
                        <span key={s} className="text-[10px] px-2 py-1 rounded-md font-medium transition-all duration-300 hover:scale-105" style={{ backgroundColor: T.sage, color: T.text }}>{s}</span>
                      ))}
                      {skills.length > 3 && (
                        <span className="text-[10px] px-2 py-1 rounded-md font-medium" style={{ backgroundColor: T.sage, color: T.muted }}>+{skills.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Bio preview */}
                  {fl.bio && (
                    <p className="text-xs line-clamp-2 mb-4 relative" style={{ color: T.muted }}>
                      {fl.bio.slice(0, 80)}...
                    </p>
                  )}

                  {/* Bottom stats */}
                  <div className="flex items-center justify-between pt-3 border-t relative" style={{ borderColor: T.border }}>
                    <span className="text-[10px] font-medium" style={{ color: T.muted }}>{cnt} completed project{cnt !== 1 ? 's' : ''}</span>
                    <span className="text-xs font-bold" style={{ color: T.primary }}>${hourlyRate}/hr</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Section>
  );
}

/* ============================================================
   HOW IT WORKS — 3 Step Cards with animated connectors
   ============================================================ */
function HowItWorksSection() {
  const steps = [
    { icon: Briefcase, title: 'Post a Task', desc: 'Create a clear brief with budget, timeline, and expectations in minutes.', color: 'bg-teal-50 text-teal-600', step: '01' },
    { icon: FileText, title: 'Receive Proposals', desc: 'Compare skilled freelancers, review fit, and shortlist with confidence.', color: 'bg-blue-50 text-blue-600', step: '02' },
    { icon: CreditCard, title: 'Hire and Pay', desc: 'Secure checkout, milestone tracking, and transparent delivery all in one place.', color: 'bg-amber-50 text-amber-600', step: '03' },
  ];

  return (
    <Section id="how-it-works" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge color="purple"><MousePointer2 className="w-3 h-3" /> Simple</Badge>
          <h2 className="text-3xl font-bold mt-3" style={{ color: T.dark }}>How It Works</h2>
          <p className="text-sm mt-2" style={{ color: T.muted }}>Get your tasks done in three simple steps. No complex processes, just results.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector lines for desktop */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5" style={{ backgroundColor: T.border }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2c7c74]/30 to-transparent animate-pulse" />
          </div>

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="group bg-white rounded-2xl p-8 border hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                style={{ borderColor: T.border }}
              >
                {/* Step number watermark */}
                <div className="absolute -right-4 -top-4 text-8xl font-black opacity-[0.03] select-none" style={{ color: T.primary }}>
                  {s.step}
                </div>

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${s.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: T.primaryLight, color: T.primary }}>Step {s.step}</span>
                </div>

                <h3 className="text-xl font-bold mb-3" style={{ color: T.dark }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: T.text }}>{s.desc}</p>

                {/* Arrow for mobile */}
                {i < steps.length - 1 && (
                  <div className="md:hidden flex justify-center mt-6">
                    <ArrowDown className="w-5 h-5 animate-bounce" style={{ color: T.muted }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

// ArrowDown component for How It Works
function ArrowDown(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

/* ============================================================
   TESTIMONIALS — Carousel with auto-play (Extra Section)
   ============================================================ */
function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Startup Founder',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      text: 'SkillSwap transformed how we hire talent. We found an amazing React developer within 2 hours and the project was delivered flawlessly. The Stripe payment integration gave us complete peace of mind.',
      rating: 5,
    },
    {
      name: 'James Chen',
      role: 'Marketing Director',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      text: 'The quality of freelancers on this platform is outstanding. Our landing page redesign was completed ahead of schedule and the communication throughout was seamless. Highly recommend!',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Manager',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      text: 'As a freelancer, SkillSwap has been a game-changer. The proposal system is intuitive, payments are always on time, and I have built long-term relationships with amazing clients.',
      rating: 5,
    },
    {
      name: 'David Park',
      role: 'E-commerce Owner',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      text: 'We needed urgent SEO content for our product launch. Posted the task, received 12 proposals in an hour, and hired the perfect writer. The entire process took less than 3 hours.',
      rating: 5,
    },
  ];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActive(a => (a + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  const next = () => setActive(a => (a + 1) % testimonials.length);
  const prev = () => setActive(a => (a - 1 + testimonials.length) % testimonials.length);

  return (
    <Section className="py-24 px-6" style={{ backgroundColor: T.sage }} id="testimonials">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge color="rose"><Heart className="w-3 h-3" /> Loved</Badge>
          <h2 className="text-3xl font-bold mt-3" style={{ color: T.dark }}>What Our Users Say</h2>
          <p className="text-sm mt-2" style={{ color: T.muted }}>Real stories from real clients and freelancers who trust SkillSwap.</p>
        </div>

        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main testimonial card */}
          <div className="bg-white rounded-3xl p-8 md:p-12 border relative overflow-hidden" style={{ borderColor: T.border, boxShadow: T.elevatedShadow }}>
            <div className="absolute top-6 right-6 opacity-10">
              <Quote className="w-24 h-24" style={{ color: T.primary }} />
            </div>

            <div className="relative">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonials[active].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <blockquote className="text-lg md:text-xl leading-relaxed mb-8 font-medium" style={{ color: T.dark }}>
                "{testimonials[active].text}"
              </blockquote>

              <div className="flex items-center gap-4">
                <img
                  src={testimonials[active].image}
                  alt={testimonials[active].name}
                  className="w-14 h-14 rounded-full object-cover border-2"
                  style={{ borderColor: T.primaryLight }}
                />
                <div>
                  <div className="font-bold" style={{ color: T.dark }}>{testimonials[active].name}</div>
                  <div className="text-sm" style={{ color: T.muted }}>{testimonials[active].role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 border"
              style={{ backgroundColor: T.white, borderColor: T.border, color: T.dark }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === active ? 24 : 8,
                    height: 8,
                    backgroundColor: i === active ? T.primary : T.border,
                  }}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 border"
              style={{ backgroundColor: T.white, borderColor: T.border, color: T.dark }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 border ml-2"
              style={{ backgroundColor: T.white, borderColor: T.border, color: T.dark }}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================
   PLATFORM STATS — Bottom counter bar with animated icons
   ============================================================ */
function StatsSection({ stats }) {
  const { val: taskVal, ref: taskRef } = useCountUp(stats.totalTasks || 12400);
  const { val: flVal, ref: flRef } = useCountUp(stats.totalFreelancers || 8900);
  const { val: clientVal, ref: clientRef } = useCountUp(stats.totalClients || 3200);
  const { val: paidVal, ref: paidRef } = useCountUp(stats.totalPaidOut || 4800000);

  const items = [
    { ref: taskRef, val: taskVal, label: 'Total Tasks', icon: Briefcase, format: (v) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toString(), color: 'bg-teal-50 text-teal-600' },
    { ref: flRef, val: flVal, label: 'Total Freelancers', icon: Users, format: (v) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toString(), color: 'bg-blue-50 text-blue-600' },
    { ref: clientRef, val: clientVal, label: 'Total Clients', icon: Globe, format: (v) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toString(), color: 'bg-purple-50 text-purple-600' },
    { ref: paidRef, val: paidVal, label: 'Total Payouts', icon: DollarSign, format: (v) => `$${v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <Section className="py-20 px-6 bg-white" id="stats">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                ref={item.ref}
                className="rounded-2xl p-6 border hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group"
                style={{ borderColor: T.border, backgroundColor: T.white }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${item.color} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: T.muted }}>{item.label}</div>
                <div className="text-4xl font-black" style={{ color: T.dark }}>{item.format(item.val)}</div>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-medium" style={{ color: T.primary }}>
                  <TrendingUp className="w-3 h-3" /> +12.5% this month
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ============================================================
   CTA BANNER — Enhanced with gradient and particles
   ============================================================ */
function CTASection() {
  return (
    <Section className="py-24 px-6" style={{ backgroundColor: T.sage }}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="rounded-3xl p-12 md:p-16 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${T.dark} 0%, #255248 100%)` }}>
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          {/* Floating orbs */}
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: T.primary, filter: 'blur(40px)', animation: 'floatParticle 6s ease-in-out infinite' }} />
          <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: T.chartGreen, filter: 'blur(30px)', animation: 'floatParticle 8s ease-in-out 2s infinite' }} />

          <div className="relative space-y-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-white/20 text-white/70 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" /> Get Started Today
            </span>

            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Ready to Get Your<br />Tasks Done?
            </h2>

            <p className="text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
              Join thousands of clients and freelancers on SkillSwap. Post your first task for free — no subscription required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.03] shadow-xl hover:shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryHover})` }}
              >
                <Zap className="w-5 h-5" /> Start for Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/tasks"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white border border-white/30 transition-all hover:bg-white/10 hover:border-white/50"
              >
                <Search className="w-5 h-5" /> Browse Tasks
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 pt-4">
              {['No subscription fee', 'Secure Stripe payments', 'Cancel anytime'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-white/50">
                  <CheckCircle className="w-3.5 h-3.5" style={{ color: T.primary }} /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================
   SKELETON LOADER — Beautiful loading state
   ============================================================ */
function SkeletonLoader() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: T.sage }}>
      {/* Hero Skeleton */}
      <div className="min-h-[90vh] flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6 max-w-xl">
            <div className="h-8 w-48 rounded-full animate-pulse" style={{ backgroundColor: T.border }} />
            <div className="h-16 w-full rounded-xl animate-pulse" style={{ backgroundColor: T.border }} />
            <div className="h-6 w-3/4 rounded-lg animate-pulse" style={{ backgroundColor: T.border }} />
            <div className="flex gap-4 pt-4">
              <div className="h-12 w-40 rounded-xl animate-pulse" style={{ backgroundColor: T.border }} />
              <div className="h-12 w-40 rounded-xl animate-pulse" style={{ backgroundColor: T.border }} />
            </div>
          </div>
          <div className="h-96 rounded-3xl animate-pulse" style={{ backgroundColor: T.border }} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ROOT PAGE — Data fetching orchestrator
   ============================================================ */
export default function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      try {
        const [tasksRes, usersRes, statsRes] = await Promise.all([
          fetch(`${baseUrl}/tasks`, { cache: 'no-store' }),
          fetch(`${baseUrl}/users`, { cache: 'no-store' }),
          fetch(`${baseUrl}/stats`, { cache: 'no-store' }),
        ]);
        const [tasksData, usersData, statsData] = await Promise.all([
          tasksRes.json(),
          usersRes.json(),
          statsRes.json(),
        ]);

        if (!isMounted) return;

        const openTasks = (Array.isArray(tasksData) ? tasksData : [])
          .filter(t => t.status === 'Open' || t.status === 'open')
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setTasks(openTasks);

        const topFreelancers = (Array.isArray(usersData) ? usersData : [])
          .filter(u => u.role === 'freelancer' && !u.isBlocked)
          .sort((a, b) => (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0));
        setFreelancers(topFreelancers);

        setStats(statsData || {});
      } catch (e) {
        console.error('Home page data fetch error:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection stats={stats} tasks={tasks} />
      <MarqueeBar />
      <LatestTasksSection tasks={tasks} />
      <PopularCategoriesSection />
      <TopFreelancersSection freelancers={freelancers} />
      <HowItWorksSection />
      <TestimonialsSection />
      <StatsSection stats={stats} />
      <CTASection />
    </div>
  );
}
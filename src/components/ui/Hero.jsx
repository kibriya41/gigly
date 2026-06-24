'use client';

import { useEffect, useRef, useState } from 'react';
import {
    ArrowRight,
    TrendingUp,
    Users,
    Star,
    Clock,
    Briefcase,
    Search,
    Shield,
    Zap
} from 'lucide-react';

// Theme constants matching your project
const THEME = {
    primary: '#2c7c74',
    primaryHover: '#236b64',
    primaryLight: '#e8f4f2',
    primaryMuted: '#7cb4ac',
    sageBg: '#f4f8f6',
    cardBg: '#ffffff',
    textPrimary: '#1a1f2e',
    textSecondary: '#5a6578',
    textMuted: '#94a3b8',
    border: '#e2e8e0',
    accentLight: '#d0e4e0',
    chartGreen: '#a8c8c4',
};

// Animated counter hook
function useCountUp(end, duration = 2000, startOnView = true) {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!startOnView) {
            setHasStarted(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setHasStarted(true);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [hasStarted, startOnView]);

    useEffect(() => {
        if (!hasStarted) return;

        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));
            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [hasStarted, end, duration]);

    return { count, ref };
}

// Stat Card Component
function StatCard({ icon: Icon, value, label, suffix = '', prefix = '', delay = 0 }) {
    const { count, ref } = useCountUp(parseInt(value.replace(/[^0-9]/g, '')), 2000);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            ref={ref}
            className={`rounded-2xl p-5 bg-white transition-all duration-700 hover:shadow-lg hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: THEME.primaryLight }}>
                    <Icon className="w-5 h-5" style={{ color: THEME.primary }} />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium" style={{ color: '#2c7c74' }}>
                    <TrendingUp className="w-3 h-3" />
                    <span>+12%</span>
                </div>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: THEME.textPrimary }}>
                {prefix}{count.toLocaleString()}{suffix}
            </div>
            <div className="text-sm" style={{ color: THEME.textMuted }}>{label}</div>
        </div>
    );
}

// Feature Card
function FeatureCard({ icon: Icon, title, delay = 0 }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-white transition-all duration-500 hover:shadow-md hover:scale-[1.02] cursor-pointer ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: THEME.primaryLight }}>
                <Icon className="w-4 h-4" style={{ color: THEME.primary }} />
            </div>
            <span className="text-sm font-medium" style={{ color: THEME.textSecondary }}>{title}</span>
        </div>
    );
}

// Weekly Activity Bar
function ActivityBar({ height, delay, day }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                <div
                    className="w-full max-w-[32px] rounded-t-lg transition-all duration-1000 ease-out"
                    style={{
                        height: isVisible ? `${height}%` : '0%',
                        backgroundColor: height > 60 ? THEME.primary : THEME.chartGreen,
                        transitionDelay: `${delay}ms`
                    }}
                />
            </div>
            <span className="text-xs font-medium" style={{ color: THEME.textMuted }}>{day}</span>
        </div>
    );
}

// Floating particles background
function FloatingParticles() {
    const particles = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        size: Math.random() * 200 + 100,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full opacity-30 animate-pulse"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        backgroundColor: THEME.primaryLight,
                        filter: 'blur(60px)',
                        animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
                    }}
                />
            ))}
        </div>
    );
}

export default function HeroSection() {
    const heroRef = useRef(null);


    const activityData = [
        { day: 'Mon', height: 45 },
        { day: 'Tue', height: 65 },
        { day: 'Wed', height: 40 },
        { day: 'Thu', height: 85 },
        { day: 'Fri', height: 55 },
        { day: 'Sat', height: 70 },
        { day: 'Sun', height: 50 },
    ];

    return (
        <div ref={heroRef} className="relative min-h-screen overflow-hidden" style={{ backgroundColor: THEME.sageBg }}>
            <FloatingParticles />

            {/* Custom animation keyframes */}
            <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>

            <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left Content */}
                    <div className="space-y-8 max-w-xl">
                        {/* Badge */}
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                            style={{
                                backgroundColor: THEME.primaryLight,
                                color: THEME.primary,
                                animation: 'slideUp 0.6s ease-out forwards'
                            }}
                        >
                            <Zap className="w-4 h-4" />
                            <span>Trusted by 10,000+ freelancers</span>
                        </div>

                        {/* Heading */}
                        <h1
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
                            style={{
                                color: THEME.textPrimary,
                                animation: 'slideUp 0.8s ease-out 0.1s forwards',
                                opacity: 0
                            }}
                        >
                            Get Your Tasks Done by{' '}
                            <span
                                className="relative inline-block"
                                style={{ color: THEME.primary }}
                            >
                                Skilled Freelancers
                                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                                    <path
                                        d="M2 10C50 2 100 2 150 6C200 10 250 10 298 2"
                                        stroke="#2c7c74"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        className="animate-pulse"
                                    />
                                </svg>
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p
                            className="text-lg leading-relaxed"
                            style={{
                                color: THEME.textSecondary,
                                animation: 'slideUp 0.8s ease-out 0.2s forwards',
                                opacity: 0
                            }}
                        >
                            Find skilled freelancers, hire quickly, collaborate efficiently, and pay securely.
                            Your next project starts here.
                        </p>

                        {/* CTA Buttons */}
                        <div
                            className="flex flex-col sm:flex-row gap-4"
                            style={{
                                animation: 'slideUp 0.8s ease-out 0.3s forwards',
                                opacity: 0
                            }}
                        >
                            <button
                                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
                                style={{
                                    backgroundColor: THEME.primary,
                                    boxShadow: `0 4px 14px ${THEME.primary}40`
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = THEME.primaryHover}
                                onMouseLeave={(e) => e.target.style.backgroundColor = THEME.primary}
                            >
                                <Briefcase className="w-4 h-4" />
                                Post a Task
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>

                            <button
                                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-md"
                                style={{
                                    backgroundColor: THEME.cardBg,
                                    color: THEME.textPrimary,
                                    border: `1px solid ${THEME.border}`
                                }}
                            >
                                <Search className="w-4 h-4" />
                                Browse Tasks
                            </button>
                        </div>

                        {/* Feature Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <FeatureCard icon={Shield} title="Secure Payments" delay={400} />
                            <FeatureCard icon={Users} title="Verified Freelancers" delay={500} />
                            <FeatureCard icon={Star} title="Top Rated Pros" delay={600} />
                            <FeatureCard icon={Clock} title="Quick Turnaround" delay={700} />
                        </div>
                    </div>

                    {/* Right Dashboard Preview */}
                    <div
                        className="relative lg:pl-8"
                        style={{
                            animation: 'slideInRight 1s ease-out 0.2s forwards',
                            opacity: 0
                        }}
                    >
                        {/* Dashboard Card */}
                        <div
                            className="relative rounded-3xl p-6 lg:p-8 bg-white"
                            style={{
                                boxShadow: '0 20px 60px rgba(44,124,116,0.08), 0 8px 20px rgba(0,0,0,0.04)',
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold" style={{ color: THEME.textPrimary }}>Workspace Overview</h3>
                                    <p className="text-xs mt-0.5" style={{ color: THEME.textMuted }}>Track your tasks and earnings overview</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: THEME.primaryLight, color: THEME.primary }}>
                                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                                    Active
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <StatCard
                                    icon={Briefcase}
                                    value="128"
                                    label="Open Tasks"
                                    delay={600}
                                />
                                <StatCard
                                    icon={DollarSign}
                                    value="42.5"
                                    label="Total Earnings"
                                    prefix="$"
                                    suffix="k"
                                    delay={700}
                                />
                                <StatCard
                                    icon={Users}
                                    value="364"
                                    label="Active Freelancers"
                                    delay={800}
                                />
                                <StatCard
                                    icon={Star}
                                    value="4.9"
                                    label="Average Rating"
                                    delay={900}
                                />
                            </div>

                            {/* Weekly Activity Chart */}
                            <div className="rounded-2xl p-5" style={{ backgroundColor: THEME.sageBg }}>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-semibold" style={{ color: THEME.textPrimary }}>Weekly Activity</h4>
                                    <span className="text-xs font-medium" style={{ color: THEME.primary }}>+24%</span>
                                </div>
                                <div className="flex items-end gap-3 h-[100px]">
                                    {activityData.map((item, i) => (
                                        <ActivityBar
                                            key={item.day}
                                            height={item.height}
                                            day={item.day}
                                            delay={1000 + i * 100}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div
                                className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl opacity-60"
                                style={{
                                    backgroundColor: THEME.primaryLight,
                                    animation: 'float 8s ease-in-out infinite'
                                }}
                            />
                            <div
                                className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full opacity-40"
                                style={{
                                    backgroundColor: THEME.chartGreen,
                                    animation: 'float 10s ease-in-out 2s infinite'
                                }}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper for DollarSign icon since it's used in StatCard
function DollarSign(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}
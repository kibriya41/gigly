import Link from 'next/link';
import { BsTwitter, BsGithub, BsLinkedin } from 'react-icons/bs';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#f0f9f6] border-t border-[#d4ebe6] pt-16 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                    {/* Brand / Logo Section */}
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2a9d8f] shadow-lg shadow-[#2a9d8f]/20">
                                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-[#1a3c34] tracking-tight">SkillSwap</h2>
                                <p className="text-sm text-[#5a7a72] font-medium">Freelance Micro-Task Marketplace</p>
                            </div>
                        </div>

                        <p className="text-[#6b8a82] max-w-md leading-relaxed text-sm">
                            Connecting innovative clients with talented freelancers for quick, high-quality micro-tasks. Build your future, one task at a time.
                        </p>
                        
                        <div className="flex items-center gap-3 mt-6">
                            <Link href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#5a7a72] hover:text-[#2a9d8f] hover:shadow-md hover:shadow-[#2a9d8f]/15 transition-all border border-[#d4ebe6]">
                                <BsTwitter size={18} />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#5a7a72] hover:text-[#2a9d8f] hover:shadow-md hover:shadow-[#2a9d8f]/15 transition-all border border-[#d4ebe6]">
                                <BsGithub size={18} />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#5a7a72] hover:text-[#2a9d8f] hover:shadow-md hover:shadow-[#2a9d8f]/15 transition-all border border-[#d4ebe6]">
                                <BsLinkedin size={18} />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-3">
                        <h3 className="font-bold text-[#1a3c34] mb-5 text-lg">Quick Links</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div className="space-y-3">
                                <Link href="/" className="block text-[#5a7a72] hover:text-[#2a9d8f] font-medium transition-colors">Home</Link>
                                <Link href="/browse-tasks" className="block text-[#5a7a72] hover:text-[#2a9d8f] font-medium transition-colors">Browse Tasks</Link>
                                <Link href="/freelancers" className="block text-[#5a7a72] hover:text-[#2a9d8f] font-medium transition-colors">Find Talent</Link>
                            </div>
                            <div className="space-y-3">
                                <Link href="/login" className="block text-[#5a7a72] hover:text-[#2a9d8f] font-medium transition-colors">Login</Link>
                                <Link href="#how-it-works" className="block text-[#5a7a72] hover:text-[#2a9d8f] font-medium transition-colors">How it Works</Link>
                                <Link href="/dashboard" className="block text-[#5a7a72] hover:text-[#2a9d8f] font-medium transition-colors">Dashboard</Link>
                            </div>
                        </div>
                    </div>

                    {/* Stay Connected */}
                    <div className="md:col-span-4">
                        <h3 className="font-bold text-[#1a3c34] mb-5 text-lg">Stay Connected</h3>
                        <p className="text-sm text-[#6b8a82] mb-4">
                            Subscribe for platform updates, new opportunities, and tips.
                        </p>

                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="flex-1 px-4 py-3 bg-white border border-[#d4ebe6] rounded-xl focus:outline-none focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 text-[#1a3c34] placeholder:text-[#8aa89e] transition-all shadow-sm"
                            />
                            <button className="px-6 bg-[#2a9d8f] text-white font-semibold rounded-xl hover:bg-[#238b7e] shadow-lg shadow-[#2a9d8f]/25 transition-all">
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-[#d4ebe6] flex flex-col md:flex-row items-center justify-between gap-6">

                    <div className="text-sm font-medium text-[#8aa89e]">
                        © {currentYear} SkillSwap. All rights reserved.
                    </div>

                    {/* Bottom Navigation */}
                    <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm">
                        <Link href="/" className="text-[#6b8a82] hover:text-[#2a9d8f] font-medium transition-colors">
                            Home
                        </Link>
                        <Link href="/about" className="text-[#6b8a82] hover:text-[#2a9d8f] font-medium transition-colors">
                            About
                        </Link>
                        <Link href="/browse-tasks" className="text-[#6b8a82] hover:text-[#2a9d8f] font-medium transition-colors">
                            Tasks
                        </Link>
                        <Link href="/freelancers" className="text-[#6b8a82] hover:text-[#2a9d8f] font-medium transition-colors">
                            Freelancers
                        </Link>
                        <Link href="#" className="text-[#6b8a82] hover:text-[#2a9d8f] font-medium transition-colors">
                            Privacy Policy
                        </Link>
                    </div>

                    <div className="text-sm font-medium text-[#8aa89e] flex items-center gap-1.5">
                        Built with <span className="text-red-500 animate-pulse">❤️</span> for freelancers
                    </div>
                </div>
            </div>
        </footer>
    );
}
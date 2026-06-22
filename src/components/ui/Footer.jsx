import Link from 'next/link';
import { BsTwitter } from 'react-icons/bs';


export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                    {/* Brand / Logo Section */}
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-white text-xl font-bold">SS</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">SkillSwap</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Micro-task marketplace</p>
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                            Connecting clients with talented freelancers for quick, high-quality micro-tasks.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div className="space-y-3">
                                <Link href="/" className="block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">Home</Link>
                                <Link href="/browse-tasks" className="block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">Browse Tasks</Link>
                                <Link href="/freelancers" className="block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">Find Freelancers</Link>
                            </div>
                            <div className="space-y-3">
                                <Link href="/login" className="block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">Login</Link>
                                <Link href="#how-it-works" className="block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">How it Works</Link>
                                <Link href="/dashboard" className="block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">Dashboard</Link>
                            </div>
                        </div>
                    </div>

                    {/* Stay Connected */}
                    <div className="md:col-span-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Stay Connected</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Subscribe for platform updates, new opportunities, and tips.
                        </p>

                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-blue-500 text-sm"
                            />
                            <button className="px-6 bg-black dark:bg-white dark:text-black text-white font-medium rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition">
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        © {currentYear} SkillSwap. All rights reserved.
                    </div>

                    {/* Bottom Navigation */}
                    <div className="flex items-center gap-8 text-sm">
                        <Link href="/" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                            <span>🏠</span> Home
                        </Link>
                        <Link href="/about" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                            About
                        </Link>
                        <Link href="/browse-tasks" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                            Tasks
                        </Link>
                        <Link href="/freelancers" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                            Freelancers
                        </Link>
                        <Link href="#" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                            <BsTwitter size={18} /> X
                        </Link>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Built with ❤️ for freelancers
                    </div>
                </div>
            </div>
        </footer>
    );
}
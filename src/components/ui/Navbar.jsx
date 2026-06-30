"use client"

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button, Avatar } from "@heroui/react";
import {
  BsHouse,
  BsPersonLinesFill,
  BsList,
  BsX
} from 'react-icons/bs';
import { BiBriefcase } from 'react-icons/bi';
import { LuLayoutDashboard } from 'react-icons/lu';
import { HiArrowRightStartOnRectangle } from 'react-icons/hi2';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import ThemeToggle from './ThemeToggle';


const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: BsHouse, href: '/' },
  { id: 'tasks', label: 'Browse Tasks', icon: BiBriefcase, href: '/tasks' },
  { id: 'freelancers', label: 'Browse Freelancers', icon: BsPersonLinesFill, href: '/freelancers' },
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session;
  const user = session?.user || {};

  // Keep a lightweight, non-sensitive role cookie in sync with the session so
  // the Edge middleware can route dashboard traffic by role without a DB call.
  // The BetterAuth session cookie remains the source of truth; this only
  // decides which dashboard a user lands on.
  useEffect(() => {
    if (isLoggedIn && user.role) {
      document.cookie = `ss.role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
    } else if (!isLoggedIn) {
      document.cookie = 'ss.role=; path=/; max-age=0';
    }
  }, [isLoggedIn, user.role]);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
          router.refresh();
        },
      },
    });
  };

  // Helper functions to evaluate active route conditions
  const isRouteActive = (href) => pathname === href;

  const navClass = (isActive) => isActive
    ? "flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold text-sm py-2 px-3 rounded-lg bg-teal-50 dark:bg-teal-500/10 transition-all"
    : "flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium text-sm py-2 px-3 rounded-lg transition-all";

  const mobileNavClass = (isActive) => isActive
    ? "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 transition-all"
    : "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-[#0b1220]/80 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-teal-600 to-teal-400 rounded-xl flex items-center justify-center shadow-sm shadow-teal-100">
              <span className="text-white text-lg font-bold">✨</span>
            </div>
            <p className="font-serif font-black text-slate-800 dark:text-slate-100 text-xl tracking-tight">
              SkillSwap
            </p>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = isRouteActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={navClass(isActive)}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            {/* Theme toggle — always available (logged in or out) */}
            <ThemeToggle />

            {isLoggedIn ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    href={user.role === 'admin' ? '/dashboard/admin' : user.role === 'freelancer' ? '/dashboard/freelancer' : '/dashboard/client'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={navClass(isRouteActive('/dashboard'))}
                  >
                    <LuLayoutDashboard size={16} />
                    Dashboard
                  </Link>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.image} alt={user.name} className='rounded-full h-10 w-10 cursor-pointer hover:ring-2 hover:ring-teal-500/30 transition-all object-cover' />

                  <Button
                    isIconOnly
                    variant="light"
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 min-w-9 w-9 h-9 rounded-full border border-gray-200 dark:border-slate-700 transition-all"
                  >
                    <HiArrowRightStartOnRectangle size={20} />
                  </Button>
                </div>
                {/* On mobile, show only the avatar in the header to indicate logged in status, but hide other controls */}
                <div className="md:hidden flex items-center">
                  <img src={user.image} alt={user.name} className='rounded-full h-8 w-8 object-cover border border-slate-200 dark:border-slate-700' />
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href={"/login"} variant="light"
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-sm">
                  Sign In
                </Link>
                <Link
                  href={'/register'} className="bg-teal-600 text-white p-2 hover:bg-teal-700 font-medium text-sm px-5 rounded-full shadow-sm shadow-teal-200 transition-all">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <Button
              isIconOnly
              variant="light"
              className="md:hidden text-slate-600 dark:text-slate-300 min-w-9 w-9 h-9 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <BsX size={22} /> : <BsList size={22} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-[#0b1220] px-4 py-4 space-y-1 shadow-lg">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isRouteActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={mobileNavClass(isActive)}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}

          {isLoggedIn ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3 px-3 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.image} alt={user.name} className='rounded-full h-9 w-9 object-cover border border-gray-200 dark:border-slate-700' />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">{user.role}</span>
                </div>
              </div>
              <Link
                href={user.role === 'admin' ? '/dashboard/admin' : user.role === 'freelancer' ? '/dashboard/freelancer' : '/dashboard/client'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={mobileNavClass(isRouteActive('/dashboard'))}
              >
                <LuLayoutDashboard size={18} />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all text-left w-full cursor-pointer"
              >
                <HiArrowRightStartOnRectangle size={18} />
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center w-full bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 shadow-sm transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
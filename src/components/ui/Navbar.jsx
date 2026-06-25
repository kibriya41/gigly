"use client"

import React, { useState } from 'react';
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
    ? "flex items-center gap-2 text-teal-600 font-semibold text-sm py-2 px-3 rounded-lg bg-teal-50 transition-all"
    : "flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm py-2 px-3 rounded-lg transition-all";

  const mobileNavClass = (isActive) => isActive
    ? "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-teal-50 text-teal-600 transition-all"
    : "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-teal-600 to-teal-400 rounded-xl flex items-center justify-center shadow-sm shadow-teal-100">
              <span className="text-white text-lg font-bold">✨</span>
            </div>
            <p className="font-serif font-black text-slate-800 text-xl tracking-tight">
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
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard/client"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={navClass(isRouteActive('/dashboard'))}
                >
                  <LuLayoutDashboard size={16} />
                  Dashboard
                </Link>

                <img src={user.image} alt={user.name} className='rounded-full h-10 w-10 cursor-pointer hover:ring-2 hover:ring-teal-500/30 transition-all object-cover' />

                <Button
                  isIconOnly
                  variant="light"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 min-w-9 w-9 h-9 rounded-full border border-gray-200 transition-all"
                >
                  <HiArrowRightStartOnRectangle size={20} />
                </Button>
              </>
            ) : (
              <>

                <Link href={"/login"} variant="light"
                  className="text-slate-600 hover:text-slate-900 font-medium text-sm">
                  Sign In
                </Link>
                <Link
                  href={'/register'} className="bg-teal-600 text-white p-2 hover:bg-teal-700 font-medium text-sm px-5 rounded-full shadow-sm shadow-teal-200 transition-all">
                  Sign Up

                </Link>
              </>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <Button
              isIconOnly
              variant="light"
              className="md:hidden text-slate-600 min-w-9 w-9 h-9 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <BsX size={22} /> : <BsList size={22} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1 shadow-lg">
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

          {isLoggedIn && (
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={mobileNavClass(isRouteActive('/dashboard'))}
            >
              <LuLayoutDashboard size={18} />
              Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
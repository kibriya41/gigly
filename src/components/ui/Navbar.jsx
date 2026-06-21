
"use client";

import { useState } from "react";
import { Link, Button, Avatar, Dropdown, Tooltip } from "@heroui/react";
import {
    ChevronDown,
  Gear,
  House,
  ListCheck,
  LogoUbuntu,
  PersonMagnifier,
  Plus,
  Users,
} from "@gravity-ui/icons";
import { LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/", icon: House, isActive: true },
    { label: "Browse Tasks", href: "/tasks", icon: ListCheck },
    { label: "Browse Freelancers", href: "/freelancers", icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-separator bg-background/70 backdrop-blur-lg">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand + Nav Links */}
        <div className="flex items-center gap-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold text-foreground">SkillSwap</span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline ${
                      item.isActive
                        ? "text-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface"
                    }`}
                    aria-current={item.isActive ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Dashboard Link */}
          <Link
            href="/dashboard"
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-surface no-underline md:flex"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          {/* Create Button */}
          <Tooltip content="Create new">
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              className="hidden md:flex"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </Tooltip>

          {/* User Avatar Dropdown */}
          <Dropdown>
            <Dropdown.Trigger>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 px-2"
              >
                <Avatar size="sm" className="h-8 w-8">
                  <Avatar.Fallback className="bg-accent text-white text-xs font-bold">
                    A
                  </Avatar.Fallback>
                </Avatar>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Popover className="min-w-[200px]">
              <Dropdown.Menu>
                <Dropdown.Item id="profile" textValue="Profile">
                  <div className="flex items-center gap-2">
                    <PersonMagnifier className="h-4 w-4 text-muted-foreground" />
                    <span>Profile</span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item id="settings" textValue="Settings">
                  <div className="flex items-center gap-2">
                    <Gear className="h-4 w-4 text-muted-foreground" />
                    <span>Settings</span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Separator />
                <Dropdown.Item id="logout" textValue="Log out">
                  <div className="flex items-center gap-2 text-danger">
                    <LogoUbuntu className="h-4 w-4" />
                    <span>Log out</span>
                  </div>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          {/* Mobile Menu Toggle */}
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            className="md:hidden"
            onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-separator md:hidden">
          <ul className="flex flex-col gap-1 p-4">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium no-underline ${
                      item.isActive
                        ? "text-accent bg-accent/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface no-underline"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
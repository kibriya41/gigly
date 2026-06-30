"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

/**
 * ThemeToggle — light/dark switch button for the navbar.
 *
 * Reads the resolved theme from ThemeProvider (backed by useSyncExternalStore,
 * which returns "light" for both SSR and the initial client render, then
 * re-snapshots to the real value after hydration). The button shows the icon
 * for the CURRENT theme; clicking switches to the other one. No hydration
 * mismatch is possible because the server/initial-client render always agree.
 *
 * Props:
 *   className — extra classes to blend with the surrounding navbar controls.
 */
export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`inline-flex items-center justify-center min-w-9 w-9 h-9 rounded-lg
        text-slate-600 dark:text-slate-300
        hover:bg-slate-50 dark:hover:bg-slate-800/60
        hover:text-slate-900 dark:hover:text-white
        border border-gray-200 dark:border-slate-700
        transition-all ${className}`}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

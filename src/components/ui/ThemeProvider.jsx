"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";

/**
 * ThemeProvider — light/dark theme context.
 *
 * Strategy:
 *   - Source of truth: the `.dark` class on <html>, which an inline <head>
 *     script applies before first paint (no FOUC). We never read the theme in
 *     an effect to seed React state — instead `useSyncExternalStore` mirrors
 *     the DOM class into React idiomatically and SSR-safely.
 *   - Persistence: an explicit choice is stored in localStorage under
 *     THEME_STORAGE_KEY; its absence means "follow system preference".
 *   - System changes: when no explicit choice is stored, we react live to
 *     `prefers-color-scheme` via the same subscription.
 *
 * No manual useCallback/useMemo — the React Compiler memoizes these, and the
 * project's lint rules forbid manual memoization it can't preserve.
 */
const THEME_STORAGE_KEY = "gigly-theme";
const THEME_CHANGE_EVENT = "gigly-theme-change";

const ThemeContext = createContext({
  theme: "light", // resolved theme actually applied ("light" | "dark")
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

function applyThemeClass(next) {
  const root = document.documentElement;
  if (next === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

// --- useSyncExternalStore wiring ---

function subscribe(callback) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    // Only react to OS changes when the user hasn't chosen explicitly.
    let stored = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (!stored) callback();
  };
  // Fires when WE toggle the class ourselves (so the store re-snapshots).
  const onSelfChange = () => callback();

  mq.addEventListener("change", onSystemChange);
  window.addEventListener(THEME_CHANGE_EVENT, onSelfChange);
  return () => {
    mq.removeEventListener("change", onSystemChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onSelfChange);
  };
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot() {
  return "light";
}

export function ThemeProvider({ children }) {
  const [mounted, setMounted] = React.useState(false);
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Use the server snapshot value (light mode) until mounted to avoid hydration errors
  const isDark = mounted ? theme === "dark" : false;

  function setTheme(next) {
    applyThemeClass(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore write failures (e.g. private mode) */
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  const value = { theme: mounted ? theme : "light", isDark, toggleTheme, setTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { THEME_STORAGE_KEY };

import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/ui/Footer";
import { ThemeProvider, THEME_STORAGE_KEY } from "@/components/ui/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "SkillSwap — Freelance Micro-Task Marketplace",
    template: "%s | SkillSwap",
  },
  description:
    "SkillSwap connects clients with skilled freelancers for quick, one-time micro-tasks. Post tasks, receive proposals, and pay securely with Stripe.",
  keywords: ["freelance", "marketplace", "micro-tasks", "hire freelancers", "skillswap"],
};

/**
 * No-FOUC theme init — runs synchronously before first paint.
 *
 * Applies the saved theme (or the OS preference when no explicit choice was
 * made) to <html> so the very first frame is already correct and React never
 * hydrates into the "wrong" class. Mirrors the logic in ThemeProvider, which
 * then keeps state in sync after mount.
 */
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored ? stored === 'dark' : prefersDark;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white dark:bg-[#0b1220] text-slate-900 dark:text-[#9fb3c8] transition-colors duration-300">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </ThemeProvider>

        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: "#111827",
              color: "#fff",
              borderRadius: "12px",
              padding: "12px 16px",
            },
          }}
        />
      </body>
    </html>
  );
}

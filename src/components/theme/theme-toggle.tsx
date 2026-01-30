/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Theme toggle button with hydration-safe rendering
 * 
 * Uses the official next-themes pattern to avoid hydration mismatch:
 * - Renders a placeholder during SSR/first render
 * - Only renders the actual toggle after client-side mount
 * - Uses resolvedTheme (not theme) for UI state
 * 
 * Note: We cannot use useTranslations in the placeholder because it runs
 * during SSR. The placeholder is purely visual and aria-hidden.
 * 
 * @see https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch - only render theme UI after mount
  // This pattern is required by next-themes to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Render placeholder during SSR to prevent layout shift
  // Fixed dimensions to prevent CLS (Cumulative Layout Shift)
  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        disabled 
        aria-hidden="true"
        className="w-9 h-9"
      >
        <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-9 h-9"
    >
      <Sun
        className={`h-5 w-5 transition-all duration-300 ${
          isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        }`}
        aria-hidden="true"
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ${
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
        }`}
        aria-hidden="true"
      />
      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </Button>
  );
}

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme provider for Next.js with next-themes
 * Configured for Tailwind CSS v4 with class-based dark mode
 * 
 * Features:
 * - System preference detection
 * - localStorage persistence
 * - SSR-safe (no flash)
 * - Smooth transitions between themes
 * - Native form elements theming via color-scheme
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      enableColorScheme={true}
      disableTransitionOnChange={false}
      storageKey="theme"
    >
      {children}
    </NextThemesProvider>
  );
}

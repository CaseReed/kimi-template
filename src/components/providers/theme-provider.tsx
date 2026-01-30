"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme provider for Next.js with next-themes
 * Configured for Tech Noir design system with Tailwind CSS v4
 * 
 * Features:
 * - Default dark theme (Tech Noir aesthetic)
 * - System preference detection (enableSystem)
 * - localStorage persistence
 * - SSR-safe (no flash)
 * - Smooth transitions between themes
 * - Native form elements theming via color-scheme
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      enableColorScheme={true}
      disableTransitionOnChange={false}
      storageKey="kimi-template-theme"
    >
      {children}
    </NextThemesProvider>
  );
}

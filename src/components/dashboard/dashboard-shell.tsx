"use client";

import { ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
}

/**
 * Simplified dashboard shell - just a content container.
 * The global Header component handles navigation.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}

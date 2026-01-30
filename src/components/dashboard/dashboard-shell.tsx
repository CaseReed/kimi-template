"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * Dashboard Shell - Clean container with subtle background
 */
export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}

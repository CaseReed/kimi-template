"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================
// Tech Skeleton Props
// ============================================
export interface TechSkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "avatar" | "chart" | "table";
  count?: number;
  animate?: boolean;
  glow?: boolean;
}

// ============================================
// Tech Skeleton Component
// ============================================
export function TechSkeleton({
  className,
  variant = "default",
  animate = true,
  glow = false,
}: TechSkeletonProps) {
  const baseClasses = cn(
    "bg-muted/50",
    animate && "animate-pulse",
    glow && "shadow-[0_0_10px_rgba(0,217,255,0.1)]"
  );

  switch (variant) {
    case "text":
      return (
        <div className={cn("space-y-2", className)}>
          <Skeleton className={cn("h-4 w-3/4", baseClasses)} />
          <Skeleton className={cn("h-4 w-1/2", baseClasses)} />
        </div>
      );

    case "avatar":
      return (
        <div className={cn("flex items-center gap-3", className)}>
          <Skeleton className={cn("h-10 w-10 rounded-full", baseClasses)} />
          <div className="space-y-1.5">
            <Skeleton className={cn("h-4 w-24", baseClasses)} />
            <Skeleton className={cn("h-3 w-16", baseClasses)} />
          </div>
        </div>
      );

    case "card":
      return (
        <div
          className={cn(
            "rounded-lg border border-border p-6 space-y-4",
            className
          )}
        >
          <div className="flex items-center justify-between">
            <Skeleton className={cn("h-5 w-32", baseClasses)} />
            <Skeleton className={cn("h-4 w-4", baseClasses)} />
          </div>
          <Skeleton className={cn("h-8 w-24", baseClasses)} />
          <Skeleton className={cn("h-4 w-full", baseClasses)} />
          <Skeleton className={cn("h-4 w-2/3", baseClasses)} />
        </div>
      );

    case "chart":
      return (
        <div className={cn("rounded-lg border border-border p-6", className)}>
          <Skeleton className={cn("h-5 w-32 mb-4", baseClasses)} />
          <Skeleton className={cn("h-48 w-full rounded-md", baseClasses)} />
        </div>
      );

    case "table":
      return (
        <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
          {/* Header */}
          <div className="bg-muted/50 p-4 border-b border-border">
            <div className="flex gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn("h-4 flex-1", baseClasses)}
                />
              ))}
            </div>
          </div>
          {/* Rows */}
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="p-4 border-b border-border last:border-0"
            >
              <div className="flex gap-4">
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    className={cn(
                      "h-4 flex-1",
                      baseClasses,
                      colIndex === 0 && "w-1/3"
                    )}
                    style={{ animationDelay: `${rowIndex * 100 + colIndex * 50}ms` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return <Skeleton className={cn(baseClasses, className)} />;
  }
}

// ============================================
// Tech Skeleton Grid - Multiple skeletons
// ============================================
interface TechSkeletonGridProps {
  variant?: "card" | "text" | "avatar";
  count?: number;
  columns?: number;
  className?: string;
}

export function TechSkeletonGrid({
  variant = "card",
  count = 4,
  columns = 2,
  className,
}: TechSkeletonGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns as keyof typeof gridCols], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <TechSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}

// ============================================
// Tech Code Skeleton - For code blocks
// ============================================
interface TechCodeSkeletonProps {
  lines?: number;
  className?: string;
}

export function TechCodeSkeleton({ lines = 6, className }: TechCodeSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-muted/30 border border-border p-4 font-mono text-sm",
        className
      )}
    >
      <div className="flex items-center gap-1.5 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-amber-500/50" />
        <div className="w-3 h-3 rounded-full bg-green-500/50" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-muted-foreground/50 w-6 text-right select-none">
              {i + 1}
            </span>
            <Skeleton
              className={cn(
                "h-4 bg-muted",
                i % 3 === 0 && "w-3/4",
                i % 3 === 1 && "w-1/2",
                i % 3 === 2 && "w-5/6"
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Tech Dashboard Skeleton - Full dashboard layout
// ============================================
export function TechDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Grid */}
      <TechSkeletonGrid variant="card" count={4} columns={4} />

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TechSkeleton variant="chart" />
        <TechSkeleton variant="chart" />
      </div>

      {/* Table */}
      <TechSkeleton variant="table" />
    </div>
  );
}

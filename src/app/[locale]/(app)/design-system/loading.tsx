"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Design System Skeleton Loading State
export default function DesignSystemLoading() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-secondary/50 via-background to-background p-8 md:p-16">
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-16 w-96 max-w-full" />
          <Skeleton className="h-6 w-2xl max-w-full" />
          <div className="flex items-center gap-4 pt-4">
            <span className="text-sm text-muted-foreground">Toggle theme:</span>
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>

      {/* Navigation Skeleton */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Colors Section */}
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-5 w-xl max-w-md" />
          <Skeleton className="h-1 w-full" />
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-7 w-32" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Typography Section */}
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-xl max-w-md" />
          <Skeleton className="h-1 w-full" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className={`h-${12 - i * 2} w-${64 - i * 8}`} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Buttons Section */}
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-5 w-xl max-w-md" />
          <Skeleton className="h-1 w-full" />
        </div>

        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28" />
          ))}
        </div>
      </div>

      {/* Inputs Section */}
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-xl max-w-md" />
          <Skeleton className="h-1 w-full" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cards Section */}
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-5 w-xl max-w-md" />
          <Skeleton className="h-1 w-full" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="border-t border-border pt-8 text-center">
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>
    </div>
  );
}

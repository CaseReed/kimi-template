"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Tech Components Skeleton Loading State
export default function TechComponentsLoading() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-secondary/50 via-background to-background p-8 md:p-16">
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <Skeleton className="h-8 w-52 rounded-full" />
          <Skeleton className="h-16 w-96 max-w-full" />
          <Skeleton className="h-6 w-2xl max-w-full" />
        </div>
      </div>

      {/* Navigation Skeleton */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Tech Table Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-5 w-xl max-w-lg" />
          <Skeleton className="h-1 w-full" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-9 w-28" />
          </div>

          {/* Table Skeleton */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-4 pb-4 border-b">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-24 flex-1" />
                  ))}
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <Skeleton className="h-4 w-32 flex-1" />
                    <Skeleton className="h-6 w-20 flex-1" />
                    <Skeleton className="h-4 w-16 flex-1" />
                    <Skeleton className="h-6 w-24 flex-1" />
                    <Skeleton className="h-4 w-20 flex-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pagination Skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-9" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Badges Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-xl max-w-lg" />
          <Skeleton className="h-1 w-full" />
        </div>

        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24" />
          ))}
        </div>
      </div>

      {/* Tech Inputs Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-5 w-xl max-w-lg" />
          <Skeleton className="h-1 w-full" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tech Borders Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-xl max-w-lg" />
          <Skeleton className="h-1 w-full" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tech Tooltips Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-5 w-xl max-w-lg" />
          <Skeleton className="h-1 w-full" />
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28" />
          ))}
        </div>
      </div>

      {/* Tech Skeletons Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-xl max-w-lg" />
          <Skeleton className="h-1 w-full" />
        </div>

        <Skeleton className="h-10 w-40" />
        
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-24 w-full max-w-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Glow Cards Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-xl max-w-lg" />
          <Skeleton className="h-1 w-full" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
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

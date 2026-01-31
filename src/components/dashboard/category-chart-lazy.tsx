"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/animations/fade-in";

// Lazy load the heavy chart component
const CategoryChartContent = dynamic(
  () => import("./category-chart").then((mod) => mod.CategoryChart),
  {
    ssr: false,
    loading: () => (
      <FadeIn delay={0.1}>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </FadeIn>
    ),
  }
);

export function CategoryChart() {
  return <CategoryChartContent />;
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/animations/fade-in";
import { fetchCategories } from "@/lib/api/dashboard";
import { queryKeys } from "@/lib/query-keys";

const categoryColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function CategoryChart() {
  const t = useTranslations("dashboard.charts.category");
  const { data: categories, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.dashboard.categories(),
    queryFn: fetchCategories,
    staleTime: 60 * 1000,
  });

  const chartConfig = {
    value: {
      label: t("sales"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  if (isLoading) {
    return (
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
    );
  }

  if (isError) {
    return (
      <FadeIn delay={0.1}>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
              {error instanceof Error ? error.message : t("loadingError")}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <FadeIn delay={0.1}>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px] flex items-center justify-center text-sm text-muted-foreground">
            {t("noData")}
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  return (
    <FadeIn delay={0.1}>
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart
              accessibilityLayer
              data={categories}
              layout="vertical"
              margin={{
                left: -20,
                right: 20,
              }}
            >
              <CartesianGrid 
                horizontal={false} 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
              />
              <XAxis
                type="number"
                tickFormatter={(value) => `${value}%`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs text-muted-foreground"
              />
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={80}
                className="text-xs text-muted-foreground"
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                content={
                  <ChartTooltipContent
                    className="bg-popover border-border"
                    formatter={(value) => [`${value}%`, t("share")]}
                    hideLabel
                  />
                }
              />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
                barSize={28}
              >
                {categories.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={categoryColors[index % categoryColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {categories.slice(0, 3).map((cat, index) => (
              <div 
                key={cat.category}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                />
                <span>{cat.category}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

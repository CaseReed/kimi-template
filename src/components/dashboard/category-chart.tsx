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
import { AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="min-h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <FadeIn delay={0.1}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : t("loadingError")}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <FadeIn delay={0.1}>
        <Card>
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
      <Card>
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
              }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
              <XAxis
                type="number"
                tickFormatter={(value) => `${value}%`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`${value}%`, t("share")]}
                    hideLabel
                  />
                }
              />
              <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]}>
                {categories.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={categoryColors[index % categoryColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

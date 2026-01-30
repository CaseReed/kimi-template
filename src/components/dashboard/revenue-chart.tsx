"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
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
import { fetchRevenue } from "@/lib/api/dashboard";
import { queryKeys } from "@/lib/query-keys";

export function RevenueChart() {
  const t = useTranslations("dashboard.charts.revenue");
  const locale = useLocale();
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.revenue(),
    queryFn: fetchRevenue,
  });

  const chartConfig = {
    revenue: {
      label: t("title"),
      color: "var(--chart-1)",
    },
    target: {
      label: t("target"),
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (isLoading) {
    return (
      <FadeIn delay={0.1}>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="min-h-[200px] w-full" />
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  if (error) {
    return (
      <FadeIn delay={0.1}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>
              {t("description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
              {t("loadingError")}
            </div>
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
          <CardDescription>
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                    style: "currency",
                    currency: "EUR",
                  }).format(value as number)
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex flex-1 justify-between leading-none items-center">
                        <span className="text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]?.label || name}
                        </span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {formatCurrency(value as number)}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                fill="var(--color-revenue)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="var(--color-target)"
                fill="var(--color-target)"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

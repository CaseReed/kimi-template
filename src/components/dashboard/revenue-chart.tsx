"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
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

  // Calculate trend - useMemo ensures consistent calculation
  const { trend, isPositiveTrend, hasData } = useMemo(() => {
    if (!data || data.length < 2) {
      return { trend: 0, isPositiveTrend: true, hasData: false };
    }
    const current = data[data.length - 1].revenue;
    const previous = data[data.length - 2].revenue;
    // Avoid division by zero
    if (previous === 0) {
      return { trend: 0, isPositiveTrend: true, hasData: true };
    }
    const trendValue = ((current - previous) / previous) * 100;
    return {
      trend: Math.abs(Number(trendValue.toFixed(1))),
      isPositiveTrend: trendValue >= 0,
      hasData: true,
    };
  }, [data]);

  if (isLoading) {
    return (
      <FadeIn delay={0.1}>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  if (error) {
    return (
      <FadeIn delay={0.1}>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
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
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </div>
            
            {/* Trend indicator - only render after client hydration to avoid mismatch */}
            {mounted && hasData && (
              <div className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                ${isPositiveTrend 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-destructive/10 text-destructive'
                }
              `}>
                {isPositiveTrend ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {isPositiveTrend ? "+" : "-"}{trend}%
              </div>
            )}
          </div>
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
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-target)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--color-target)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="hsl(var(--border))" 
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
                className="text-xs text-muted-foreground"
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
                className="text-xs text-muted-foreground"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="bg-popover border-border"
                    formatter={(value, name) => (
                      <div className="flex flex-1 justify-between leading-none items-center gap-4">
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
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="var(--color-target)"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#targetGradient)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

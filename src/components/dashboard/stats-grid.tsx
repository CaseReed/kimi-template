"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";
import { queryKeys } from "@/lib/query-keys";
import { fetchStats } from "@/lib/api/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  Percent,
  Activity,
  TrendingDown,
  RefreshCw,
  DollarSign,
  MousePointerClick,
} from "lucide-react";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/stagger-container";
import { CountUp } from "@/components/animations/count-up";
import type { DashboardStats } from "@/lib/types/dashboard";
import type { LucideIcon } from "lucide-react";

interface StatCardConfig {
  key: keyof DashboardStats;
  changeKey: keyof DashboardStats;
  translationKey: string;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  decimals?: boolean;
}

function formatValue(value: number | unknown, decimals?: boolean): number {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  if (decimals) {
    return Math.round(value * 100) / 100;
  }
  return Math.round(value);
}

function StatCardSkeleton() {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[120px] mb-2" />
        <Skeleton className="h-4 w-[80px]" />
      </CardContent>
    </Card>
  );
}

function StatCardError({ 
  title, 
  icon: Icon, 
  onRetry,
  retryLabel,
}: { 
  title: string; 
  icon: LucideIcon;
  onRetry?: () => void;
  retryLabel: string;
}) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-md bg-destructive/10 p-2">
          <Icon className="h-4 w-4 text-destructive" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-destructive mb-2">Erreur de chargement</p>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            {retryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  config: StatCardConfig;
  data: DashboardStats;
  vsLastMonth: string;
}

function StatCard({ config, data, vsLastMonth }: StatCardProps) {
  const t = useTranslations("dashboard.stats");
  const value = data[config.key];
  const change = data[config.changeKey];
  const isPositive = typeof change === 'number' && change >= 0;
  const formattedValue = formatValue(value, config.decimals);
  const formattedChange = formatValue(change, true);
  const shouldReduceMotion = useReducedMotion();
  const Icon = config.icon;

  return (
    <Card className="group border-border bg-card hover:border-primary/30 transition-colors duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {config.translationKey}
        </CardTitle>
        <div className={`
          rounded-md p-2 transition-all duration-300
          ${isPositive 
            ? 'bg-primary/10 text-primary group-hover:bg-primary/20' 
            : 'bg-destructive/10 text-destructive group-hover:bg-destructive/20'
          }
        `}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold tracking-tight">
          {shouldReduceMotion ? (
            <span>
              {config.prefix}{formattedValue}{config.suffix}
            </span>
          ) : (
            <CountUp
              end={formattedValue}
              duration={1.5}
              prefix={config.prefix}
              suffix={config.suffix}
            />
          )}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Badge
            variant="outline"
            className={`
              text-xs font-medium gap-1 border-0 px-2 py-0.5
              ${isPositive 
                ? 'bg-primary/10 text-primary' 
                : 'bg-destructive/10 text-destructive'
              }
            `}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {isPositive ? "+" : ""}{formattedChange}%
          </Badge>
          <span className="text-xs text-muted-foreground">{vsLastMonth}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsGrid() {
  const t = useTranslations("dashboard");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: fetchStats,
    staleTime: 60 * 1000,
  });

  const statCardsConfig: StatCardConfig[] = [
    {
      key: "revenue",
      changeKey: "revenueChange",
      translationKey: t("stats.revenue"),
      icon: DollarSign,
      prefix: "€",
      decimals: true,
    },
    {
      key: "users",
      changeKey: "usersChange",
      translationKey: t("stats.users"),
      icon: Users,
    },
    {
      key: "conversion",
      changeKey: "conversionChange",
      translationKey: t("stats.conversion"),
      icon: MousePointerClick,
      suffix: "%",
      decimals: true,
    },
    {
      key: "activeSessions",
      changeKey: "sessionsChange",
      translationKey: t("stats.sessions"),
      icon: Activity,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCardsConfig.map((config) => (
          <StatCardSkeleton key={String(config.key)} />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCardsConfig.map((config) => (
          <StatCardError
            key={String(config.key)}
            title={config.translationKey}
            icon={config.icon}
            onRetry={() => refetch()}
            retryLabel={t("stats.retry")}
          />
        ))}
      </div>
    );
  }

  return (
    <StaggerContainer
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      staggerDelay={0.1}
    >
      {statCardsConfig.map((config) => (
        <StaggerItem key={String(config.key)}>
          <StatCard 
            config={config} 
            data={data} 
            vsLastMonth={t("stats.vsLastMonth")}
          />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/stagger-container";
import { CountUp } from "@/components/animations/count-up";
import { CardHover } from "@/components/animations/card-hover";
import type { DashboardStats } from "@/lib/types/dashboard";
import type { LucideIcon } from "lucide-react";

interface StatCardConfig {
  key: keyof DashboardStats;
  changeKey: keyof DashboardStats;
  title: string;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  decimals?: boolean;
}

const statCardsConfig: StatCardConfig[] = [
  {
    key: "revenue",
    changeKey: "revenueChange",
    title: "Revenus",
    icon: TrendingUp,
    prefix: "€",
    decimals: true,
  },
  {
    key: "users",
    changeKey: "usersChange",
    title: "Utilisateurs",
    icon: Users,
  },
  {
    key: "conversion",
    changeKey: "conversionChange",
    title: "Conversion",
    icon: Percent,
    suffix: "%",
    decimals: true,
  },
  {
    key: "activeSessions",
    changeKey: "sessionsChange",
    title: "Sessions",
    icon: Activity,
  },
];

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
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
  onRetry 
}: { 
  title: string; 
  icon: LucideIcon;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-destructive/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-destructive mb-2">Erreur de chargement</p>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Réessayer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  config: StatCardConfig;
  data: DashboardStats;
}

function StatCard({ config, data }: StatCardProps) {
  const value = data[config.key];
  const change = data[config.changeKey];
  const isPositive = typeof change === 'number' && change >= 0;
  const formattedValue = formatValue(value, config.decimals);
  const formattedChange = formatValue(change, true);
  const shouldReduceMotion = useReducedMotion();
  const Icon = config.icon;

  return (
    <CardHover>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
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
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant={isPositive ? "default" : "destructive"}
              className="text-xs"
              aria-label={`Tendance ${isPositive ? 'positive' : 'négative'} de ${formattedChange}%`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" aria-hidden="true" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" aria-hidden="true" />
              )}
              {isPositive ? "+" : ""}
              {formattedChange}%
            </Badge>
            <span className="text-xs text-muted-foreground">vs mois dernier</span>
          </div>
        </CardContent>
      </Card>
    </CardHover>
  );
}

export function StatsGrid() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: fetchStats,
    staleTime: 60 * 1000, // 1 minute
  });

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
            title={config.title}
            icon={config.icon}
            onRetry={() => refetch()}
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
          <StatCard config={config} data={data} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

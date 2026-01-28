import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { fetchStats, fetchRevenue, fetchCategories } from "@/lib/api/dashboard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RefreshButton } from "@/components/dashboard/refresh-button";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { TransactionsTable } from "@/components/dashboard/transactions-table";

export const metadata = {
  title: "Dashboard",
  description: "Vue d'ensemble de vos métriques",
};

export default async function DashboardPage() {
  // Prefetch toutes les données du dashboard en parallèle
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.stats(),
      queryFn: fetchStats,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.revenue(),
      queryFn: fetchRevenue,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.categories(),
      queryFn: fetchCategories,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardShell header={<RefreshButton />}>
        <div className="space-y-6">
          <StatsGrid />
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <div className="min-w-0 overflow-hidden">
              <RevenueChart />
            </div>
            <div className="min-w-0 overflow-hidden">
              <CategoryChart />
            </div>
          </div>
          <TransactionsTable />
        </div>
      </DashboardShell>
    </HydrationBoundary>
  );
}

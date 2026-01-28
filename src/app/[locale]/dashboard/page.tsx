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
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo";
import { generateWebPageJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.dashboard" });

  const getBaseUrl = () =>
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
  const baseUrl = getBaseUrl();

  const path = locale === "en" ? "/dashboard" : `/${locale}/dashboard`;

  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "dashboard",
      "analytics",
      "metrics",
      "statistics",
      "data visualization",
    ],
    alternates: {
      canonical: `${baseUrl}${path}`,
      languages: {
        "en-US": `${baseUrl}/dashboard`,
        "fr-FR": `${baseUrl}/fr/dashboard`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      url: `${baseUrl}${path}`,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

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

  // Generate JSON-LD for this page
  const path = locale === "en" ? "/dashboard" : `/${locale}/dashboard`;
  const pageJsonLd = generateWebPageJsonLd(
    "Dashboard",
    path,
    {
      description: "Analytics dashboard with real-time metrics and data visualization.",
    }
  );

  return (
    <>
      {/* Structured Data for this page */}
      <JsonLd data={pageJsonLd} />

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
    </>
  );
}

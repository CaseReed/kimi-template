import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { fetchStats, fetchRevenue, fetchCategories } from "@/lib/api/dashboard";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RefreshButton } from "@/components/dashboard/refresh-button";
import { StatsGrid } from "@/components/dashboard/stats-grid";
// Lazy-loaded chart components for better performance
import { RevenueChart } from "@/components/dashboard/revenue-chart-lazy";
import { CategoryChart } from "@/components/dashboard/category-chart-lazy";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { JsonLd, BreadcrumbJsonLd } from "@/components/seo";
import { generateWebPageJsonLd } from "@/lib/seo";
import { FadeIn } from "@/components/animations/fade-in";
import { Activity } from "lucide-react";

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
  
  // Localized OG alt text
  const ogAlt = locale === "fr"
    ? "Tableau de bord analytics avec métriques en temps réel"
    : "Analytics dashboard with real-time metrics";

  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "dashboard",
      "analytics",
      "metrics",
      "statistics",
      "data visualization",
      "real-time data",
      "business intelligence",
      "kimi-template",
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
      alternateLocale: locale === "fr" ? ["en_US"] : ["fr_FR"],
      url: `${baseUrl}${path}`,
      siteName: "kimi-template",
      images: [
        {
          url: `${baseUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: ogAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      creator: "@kimitemplate",
      images: [`${baseUrl}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });

  // Check authentication - protect the dashboard
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Prefetch all dashboard data in parallel
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
  const homePath = locale === "en" ? "/" : `/${locale}/`;
  
  const pageJsonLd = generateWebPageJsonLd(
    t("title"),
    path,
    t("subtitle")
  );

  // Breadcrumb for structured data
  const breadcrumbItems = [
    { name: t("backToHome"), path: homePath },
    { name: t("title"), path },
  ];

  return (
    <>
      {/* Structured Data for this page */}
      <JsonLd data={pageJsonLd} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <DashboardShell>
          <div className="space-y-8">
            {/* Page Header */}
            <FadeIn direction="up" duration={0.5}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      <Activity className="h-3 w-3" />
                      <span>Live</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {t("title")}
                  </h1>
                  <p className="mt-1 text-base text-muted-foreground">
                    {t("subtitle")}
                  </p>
                </div>
                <RefreshButton />
              </div>
            </FadeIn>

            {/* Dashboard Content */}
            <div className="space-y-6">
              <StatsGrid />
              
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                <div className="min-w-0">
                  <RevenueChart />
                </div>
                <div className="min-w-0">
                  <CategoryChart />
                </div>
              </div>
              
              <TransactionsTable />
            </div>
          </div>
        </DashboardShell>
      </HydrationBoundary>
    </>
  );
}

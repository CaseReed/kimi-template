import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo";
import { generateWebPageJsonLd } from "@/lib/seo";

// Base URL helper
const getBaseUrl = () =>
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });

  const baseUrl = getBaseUrl();
  const path = locale === "en" ? "" : `/${locale}`;

  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "Next.js",
      "React",
      "Tailwind CSS",
      "Dashboard",
      "Analytics",
      "TypeScript",
      "Modern Web App",
      "Dashboard Template",
    ],
    alternates: {
      canonical: `${baseUrl}${path || "/"}`,
      languages: {
        "en-US": baseUrl,
        "fr-FR": `${baseUrl}/fr`,
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

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  // Generate JSON-LD for this page
  const path = locale === "en" ? "" : `/${locale}`;
  const pageJsonLd = generateWebPageJsonLd(
    "Home",
    path || "/",
    {
      description: "Modern web application built with Next.js 16, Tailwind CSS v4, and React 19.",
    }
  );

  return (
    <>
      {/* Structured Data for this page */}
      <JsonLd data={pageJsonLd} />

      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-2xl w-full text-center space-y-6">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xl text-slate-300">
            {t("subtitle")}
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <div className="px-6 py-3 bg-primary text-white rounded-lg font-medium shadow-lg shadow-blue-500/25">
              {t("primaryButton")}
            </div>
            <div className="px-6 py-3 bg-secondary text-white rounded-lg font-medium shadow-lg shadow-purple-500/25">
              {t("secondaryButton")}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
              <p className="text-emerald-400 font-semibold">{t("gridItem1")}</p>
            </div>
            <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg">
              <p className="text-amber-400 font-semibold">{t("gridItem2")}</p>
            </div>
            <div className="p-4 bg-rose-500/20 border border-rose-500/30 rounded-lg">
              <p className="text-rose-400 font-semibold">{t("gridItem3")}</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

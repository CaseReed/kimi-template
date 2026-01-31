import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd, BreadcrumbJsonLd } from "@/components/seo";
import { generateWebPageJsonLd } from "@/lib/seo";

// Generate metadata for Design System pages
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const path = locale === "en" ? "/design-system" : `/${locale}/design-system`;

  const title = t("designSystem.title");
  const description = t("designSystem.description");

  return {
    title,
    description,
    keywords: [
      "design system",
      "UI components",
      "component library",
      "Tech Noir",
      "cyberpunk UI",
      "shadcn/ui",
      "Tailwind CSS",
      "design tokens",
      "color palette",
      "typography",
      "kimi-template",
    ],
    alternates: {
      canonical: `${baseUrl}${path}`,
      languages: {
        "en-US": `${baseUrl}/design-system`,
        "fr-FR": `${baseUrl}/fr/design-system`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? ["en_US"] : ["fr_FR"],
      url: `${baseUrl}${path}`,
      siteName: "kimi-template",
      title,
      description,
      images: [
        {
          url: `${baseUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: locale === "fr" 
            ? "Système de design Tech Noir - Composants UI cyberpunk"
            : "Tech Noir Design System - Cyberpunk UI Components",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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

// Server Component wrapper that provides SEO
export default async function DesignSystemLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "designSystem" });

  const path = locale === "en" ? "/design-system" : `/${locale}/design-system`;
  const homePath = locale === "en" ? "/" : `/${locale}/`;

  // Generate JSON-LD for this page
  const pageJsonLd = generateWebPageJsonLd(
    t("metadata.title"),
    path,
    t("metadata.description")
  );

  // Breadcrumb structured data
  const breadcrumbItems = [
    { name: t("breadcrumb.home"), path: homePath },
    { name: t("breadcrumb.designSystem"), path },
  ];

  return (
    <>
      {/* Structured Data */}
      <JsonLd data={pageJsonLd} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      
      {children}
    </>
  );
}

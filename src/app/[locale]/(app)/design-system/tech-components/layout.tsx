import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd, BreadcrumbJsonLd } from "@/components/seo";
import { generateWebPageJsonLd } from "@/lib/seo";

// Generate metadata for Tech Components page
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

  const path = locale === "en" 
    ? "/design-system/tech-components" 
    : `/${locale}/design-system/tech-components`;

  const title = t("techComponents.title");
  const description = t("techComponents.description");

  return {
    title,
    description,
    keywords: [
      "tech components",
      "advanced UI components",
      "data table",
      "form inputs",
      "loading skeletons",
      "tooltips",
      "Tech Noir",
      "cyberpunk UI",
      "design system",
      "kimi-template",
    ],
    alternates: {
      canonical: `${baseUrl}${path}`,
      languages: {
        "en-US": `${baseUrl}/design-system/tech-components`,
        "fr-FR": `${baseUrl}/fr/design-system/tech-components`,
      },
    },
    openGraph: {
      type: "article",
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
            ? "Composants Tech Avancés - Tables, Inputs, Skeletons"
            : "Advanced Tech Components - Tables, Inputs, Skeletons",
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
      },
    },
  };
}

// Server Component wrapper that provides SEO
export default async function TechComponentsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "designSystem" });

  const path = locale === "en" 
    ? "/design-system/tech-components" 
    : `/${locale}/design-system/tech-components`;
  const parentPath = locale === "en" ? "/design-system" : `/${locale}/design-system`;
  const homePath = locale === "en" ? "/" : `/${locale}/`;

  // Generate JSON-LD for this page
  const pageJsonLd = generateWebPageJsonLd(
    t("techComponents.metadata.title"),
    path,
    t("techComponents.metadata.description")
  );

  // Breadcrumb structured data: Home > Design System > Tech Components
  const breadcrumbItems = [
    { name: t("breadcrumb.home"), path: homePath },
    { name: t("breadcrumb.designSystem"), path: parentPath },
    { name: t("breadcrumb.techComponents"), path },
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

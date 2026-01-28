import { MetadataRoute } from "next";

// Base URL helper (DRY)
const getBaseUrl = () =>
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

// Define all static routes for the application
// When adding new pages, add them here
const routes = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "dashboard", priority: 0.8, changeFrequency: "daily" as const },
];

const locales = ["en", "fr"] as const;

/**
 * Generate URL for a specific locale and route
 */
function generateUrl(baseUrl: string, locale: string, path: string): string {
  // For English (default locale), no locale prefix
  // For other locales, prefix with locale
  if (locale === "en") {
    return path ? `${baseUrl}/${path}` : baseUrl;
  }
  return path ? `${baseUrl}/${locale}/${path}` : `${baseUrl}/${locale}`;
}

/**
 * Generate dynamic sitemap for all locales
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    // Build alternates for all locales
    const alternates: Record<string, string> = {};
    
    for (const locale of locales) {
      const langCode = locale === "en" ? "en-US" : "fr-FR";
      alternates[langCode] = generateUrl(baseUrl, locale, route.path);
    }

    // Primary URL (use English as canonical)
    const primaryUrl = generateUrl(baseUrl, "en", route.path);

    sitemapEntries.push({
      url: primaryUrl,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: alternates,
      },
    });
  }

  return sitemapEntries;
}

/**
 * JSON-LD Structured Data Helpers
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */

// Base URL helper (DRY)
const getBaseUrl = () =>
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

// JSON-LD types
export interface OrganizationJsonLd {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

export interface WebSiteJsonLd {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
}

export interface WebPageJsonLd {
  "@context": "https://schema.org";
  "@type": "WebPage";
  name: string;
  url: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    "@type": string;
    name: string;
  };
  isPartOf?: {
    "@type": "WebSite";
    url: string;
  };
}

export interface BreadcrumbListJsonLd {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
}

export type JsonLdType =
  | OrganizationJsonLd
  | WebSiteJsonLd
  | WebPageJsonLd
  | BreadcrumbListJsonLd;

/**
 * Generate Organization structured data
 */
export function generateOrganizationJsonLd(
  overrides?: Partial<OrganizationJsonLd>
): OrganizationJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "My App",
    url: getBaseUrl(),
    description:
      "A modern web application built with Next.js 16, Tailwind CSS v4, and React 19.",
    ...overrides,
  };
}

/**
 * Generate WebSite structured data
 */
export function generateWebSiteJsonLd(
  overrides?: Partial<WebSiteJsonLd>
): WebSiteJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "My App",
    url: getBaseUrl(),
    description:
      "Modern dashboard application with real-time analytics and data visualization.",
    ...overrides,
  };
}

/**
 * Generate WebPage structured data
 */
export function generateWebPageJsonLd(
  pageName: string,
  pagePath: string,
  overrides?: Partial<WebPageJsonLd>
): WebPageJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageName,
    url: `${getBaseUrl()}${pagePath}`,
    isPartOf: {
      "@type": "WebSite",
      url: getBaseUrl(),
    },
    ...overrides,
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbListJsonLd(
  items: Array<{ name: string; item?: string }>
): BreadcrumbListJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.item && { item: item.item }),
    })),
  };
}

/**
 * Generate SoftwareApplication structured data
 * Useful for SaaS/dashboard applications
 */
export function generateSoftwareApplicationJsonLd(
  overrides?: Record<string, unknown>
) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "My App Dashboard",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    url: getBaseUrl(),
    description:
      "Modern dashboard application for analytics and data visualization.",
    ...overrides,
  };
}

/**
 * Serialize JSON-LD data for injection
 * Sanitizes to prevent XSS attacks
 */
export function serializeJsonLd(data: JsonLdType | Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

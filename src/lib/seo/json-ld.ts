/**
 * JSON-LD Structured Data Utilities
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */

import { siteConfig, getBaseUrl } from "./config";

// ============================================
// Types
// ============================================

export interface OrganizationJsonLd {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  description: string;
  logo?: string;
  sameAs?: string[];
}

export interface WebSiteJsonLd {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
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
  description: string;
  isPartOf?: {
    "@type": "WebSite";
    url: string;
  };
  breadcrumb?: {
    "@type": "BreadcrumbList";
    itemListElement: BreadcrumbItem[];
  };
}

export interface SoftwareApplicationJsonLd {
  "@context": "https://schema.org";
  "@type": "SoftwareApplication";
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  programmingLanguage: string[];
  license: string;
  author: {
    "@type": string;
    name: string;
  };
  downloadUrl?: string;
  softwareVersion?: string;
}

export interface BreadcrumbListJsonLd {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
}

export type JsonLdType =
  | OrganizationJsonLd
  | WebSiteJsonLd
  | WebPageJsonLd
  | SoftwareApplicationJsonLd
  | BreadcrumbListJsonLd;

// ============================================
// Serializers
// ============================================

/**
 * Serialize JSON-LD data to a safe string
 * Prevents XSS by escaping HTML tags
 */
export function serializeJsonLd(data: JsonLdType | Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

// ============================================
// Generators
// ============================================

/**
 * Generate Organization structured data
 */
export function generateOrganizationJsonLd(
  overrides?: Partial<OrganizationJsonLd>
): OrganizationJsonLd {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: baseUrl,
    description: siteConfig.description.en,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      siteConfig.githubUrl,
      // Add social media URLs when available
      // "https://twitter.com/kimitemplate",
    ],
    ...overrides,
  };
}

/**
 * Generate WebSite structured data
 */
export function generateWebSiteJsonLd(
  locale: string = "en",
  overrides?: Partial<WebSiteJsonLd>
): WebSiteJsonLd {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: baseUrl,
    description: getLocalizedDescription(locale),
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    ...overrides,
  };
}

/**
 * Generate WebPage structured data
 */
export function generateWebPageJsonLd(
  pageName: string,
  pagePath: string,
  description: string,
  overrides?: Partial<WebPageJsonLd>
): WebPageJsonLd {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageName,
    url: `${baseUrl}${pagePath}`,
    description,
    isPartOf: {
      "@type": "WebSite",
      url: baseUrl,
    },
    ...overrides,
  };
}

/**
 * Generate SoftwareApplication structured data
 * Perfect for open-source templates/tools
 */
export function generateSoftwareApplicationJsonLd(
  overrides?: Partial<SoftwareApplicationJsonLd>
): SoftwareApplicationJsonLd {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    description: siteConfig.description.en,
    url: baseUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    programmingLanguage: ["TypeScript", "JavaScript"],
    license: "MIT",
    author: {
      "@type": "Organization",
      name: siteConfig.author,
    },
    downloadUrl: siteConfig.githubUrl,
    softwareVersion: "1.0.0",
    ...overrides,
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
  overrides?: Partial<BreadcrumbListJsonLd>
): BreadcrumbListJsonLd {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
    ...overrides,
  };
}

// ============================================
// Utilities
// ============================================

/**
 * Get localized description for JSON-LD
 */
function getLocalizedDescription(locale: string): string {
  return siteConfig.description[locale as keyof typeof siteConfig.description] ?? siteConfig.description.en;
}

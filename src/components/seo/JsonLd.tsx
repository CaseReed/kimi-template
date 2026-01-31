import {
  serializeJsonLd,
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
  generateSoftwareApplicationJsonLd,
  generateBreadcrumbJsonLd,
  type JsonLdType,
} from "@/lib/seo/json-ld";

interface JsonLdProps {
  data: JsonLdType | Record<string, unknown>;
}

/**
 * JSON-LD Structured Data Component
 * Injects structured data into the page for SEO
 *
 * Usage (Server Components only):
 * ```tsx
 * import { JsonLd } from "@/components/seo/JsonLd";
 * import { generateOrganizationJsonLd } from "@/lib/seo/json-ld";
 *
 * <JsonLd data={generateOrganizationJsonLd()} />
 * ```
 *
 * Note: This is a Server Component. For Client Components,
 * use serializeJsonLd directly with a script tag.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

/**
 * Organization JSON-LD for the site
 * Use in Server Components
 */
export function OrganizationJsonLd() {
  const data = generateOrganizationJsonLd();
  return <JsonLd data={data} />;
}

/**
 * WebSite JSON-LD for the site
 * Use in Server Components
 */
export function WebSiteJsonLd({ locale = "en" }: { locale?: string } = {}) {
  const data = generateWebSiteJsonLd(locale);
  return <JsonLd data={data} />;
}

/**
 * SoftwareApplication JSON-LD for the template
 * Helps with rich results for developer tools
 */
export function SoftwareApplicationJsonLd() {
  const data = generateSoftwareApplicationJsonLd();
  return <JsonLd data={data} />;
}

/**
 * BreadcrumbList JSON-LD for navigation
 * Helps Google show breadcrumbs in SERP
 */
interface BreadcrumbJsonLdProps {
  items: Array<{ name: string; path: string }>;
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = generateBreadcrumbJsonLd(items);
  return <JsonLd data={data} />;
}

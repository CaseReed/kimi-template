import { serializeJsonLd, type JsonLdType } from "@/lib/seo/json-ld";

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
  const data = {
    "@context": "https://schema.org" as const,
    "@type": "Organization" as const,
    name: "My App",
    url:
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000",
    description:
      "A modern web application built with Next.js 16, Tailwind CSS v4, and React 19.",
  };

  return <JsonLd data={data} />;
}

/**
 * WebSite JSON-LD for the site
 * Use in Server Components
 */
export function WebSiteJsonLd() {
  const baseUrl =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const data = {
    "@context": "https://schema.org" as const,
    "@type": "WebSite" as const,
    name: "My App",
    url: baseUrl,
    description:
      "Modern dashboard application with real-time analytics and data visualization.",
  };

  return <JsonLd data={data} />;
}

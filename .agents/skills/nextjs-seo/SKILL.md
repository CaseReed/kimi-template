---
name: nextjs-seo
description: SEO optimization for Next.js 16 App Router - metadata, OpenGraph, sitemap, robots, JSON-LD structured data
license: MIT
compatibility: Next.js 16+, React 19+, App Router
---

# Next.js SEO Optimization

Complete SEO implementation guide for Next.js 16 App Router with metadata API, dynamic OpenGraph images, sitemap generation, robots.txt, and JSON-LD structured data.

---

## Quick Reference

### File-Based Metadata Routes

| File | Purpose | URL |
|------|---------|-----|
| `app/sitemap.ts` | Dynamic sitemap generation | `/sitemap.xml` |
| `app/robots.ts` | Robots.txt configuration | `/robots.txt` |
| `app/opengraph-image.tsx` | OG image (1200x630) | `/opengraph-image` |
| `app/twitter-image.tsx` | Twitter card image | `/twitter-image` |
| `app/icon.tsx` | Dynamic favicon | `/icon` |

### Metadata Export Locations

| Location | Scope |
|----------|-------|
| `app/layout.tsx` | Global (all pages) |
| `app/[locale]/layout.tsx` | Locale-specific |
| `app/page.tsx` | Single page |
| `generateMetadata()` | Dynamic per-page |

---

## Core Patterns

### 1. Global Metadata (Root Layout)

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from "next";

// Separate viewport export (Next.js 15+ recommendation)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  // Title with template
  title: {
    template: "%s | My App",        // Page titles become: "Dashboard | My App"
    default: "My App",               // Fallback when no title provided
  },
  description: "Application description",
  
  // Canonical URL base (required for OG images and alternates)
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  
  // Language alternates (i18n)
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "fr-FR": "/fr",
    },
  },
  
  // Open Graph defaults
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["fr_FR"],
    siteName: "My App",
  },
  
  // Twitter Card defaults
  twitter: {
    card: "summary_large_image",
    creator: "@myapp",
  },
  
  // Robots directives
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
```

### 2. Dynamic Page Metadata

```typescript
// app/[locale]/dashboard/page.tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

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
  const t = await getTranslations({ locale, namespace: "metadata.dashboard" });
  
  const baseUrl = getBaseUrl();
  const path = locale === "en" ? "/dashboard" : `/${locale}/dashboard`;

  return {
    title: t("title"),
    description: t("description"),
    keywords: ["dashboard", "analytics", "metrics"],
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
      locale: locale === "fr" ? "fr_FR" : "en_US",
      url: `${baseUrl}${path}`,
    },
  };
}
```

### 3. Sitemap Generation (i18n)

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";

const getBaseUrl = () =>
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

const routes = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "dashboard", priority: 0.8, changeFrequency: "daily" as const },
];

const locales = ["en", "fr"] as const;

function generateUrl(baseUrl: string, locale: string, path: string): string {
  if (locale === "en") {
    return path ? `${baseUrl}/${path}` : baseUrl;
  }
  return path ? `${baseUrl}/${locale}/${path}` : `${baseUrl}/${locale}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    const alternates: Record<string, string> = {};
    
    for (const locale of locales) {
      const langCode = locale === "en" ? "en-US" : "fr-FR";
      alternates[langCode] = generateUrl(baseUrl, locale, route.path);
    }

    sitemapEntries.push({
      url: generateUrl(baseUrl, "en", route.path),
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: alternates },
    });
  }

  return sitemapEntries;
}
```

### 4. Robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

const getBaseUrl = () =>
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // disallow: ["/admin", "/api"],
    },
    sitemap: `${getBaseUrl()}/sitemap.xml`,
    host: getBaseUrl(),
  };
}
```

### 5. Dynamic OpenGraph Image

```typescript
// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "My App";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <h1 style={{ fontSize: 64, fontWeight: "bold" }}>My App</h1>
        <p style={{ fontSize: 28, color: "#94a3b8" }}>
          Built with Next.js 16 & Tailwind CSS
        </p>
      </div>
    ),
    { ...size }
  );
}
```

Reuse for Twitter:

```typescript
// app/twitter-image.tsx
export { default, alt, size, contentType } from "./opengraph-image";
```

### 6. JSON-LD Structured Data

```typescript
// lib/seo/json-ld.ts
const getBaseUrl = () =>
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export interface OrganizationJsonLd {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  description?: string;
}

export function generateOrganizationJsonLd(
  overrides?: Partial<OrganizationJsonLd>
): OrganizationJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "My App",
    url: getBaseUrl(),
    description: "Application description",
    ...overrides,
  };
}

export function generateWebSiteJsonLd(
  overrides?: Partial<WebSiteJsonLd>
): WebSiteJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "My App",
    url: getBaseUrl(),
    ...overrides,
  };
}

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
    isPartOf: { "@type": "WebSite", url: getBaseUrl() },
    ...overrides,
  };
}

// XSS-safe serialization
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}
```

Component usage:

```typescript
// components/seo/JsonLd.tsx
import { serializeJsonLd } from "@/lib/seo/json-ld";

interface JsonLdProps {
  data: unknown;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

// Predefined components
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org" as const,
    "@type": "Organization" as const,
    name: "My App",
    url: getBaseUrl(),
  };
  return <JsonLd data={data} />;
}
```

Usage in layout:

```tsx
// app/[locale]/layout.tsx
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo";

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        {children}
      </body>
    </html>
  );
}
```

---

## Project Structure Template

```
app/
├── layout.tsx                    # Global metadata
├── sitemap.ts                    # Dynamic sitemap
├── robots.ts                     # Robots.txt
├── opengraph-image.tsx           # OG image (1200x630)
├── twitter-image.tsx             # Reuses OG image
├── [locale]/
│   ├── layout.tsx                # JSON-LD injection
│   ├── page.tsx                  # Page metadata
│   └── dashboard/
│       └── page.tsx              # Page-specific metadata
lib/
└── seo/
    ├── json-ld.ts                # Structured data helpers
    └── index.ts                  # Barrel export
components/
└── seo/
    ├── JsonLd.tsx                # JSON-LD component
    └── index.ts                  # Barrel export
```

---

## Common Pitfalls

### ❌ Don't: Use "use client" in JSON-LD Components

```tsx
// BAD - Causes hydration issues
"use client";
export function JsonLd({ data }) {
  return <script dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
```

```tsx
// GOOD - Server Component
export function JsonLd({ data }) {
  return <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
```

### ❌ Don't: Forget metadataBase

```tsx
// BAD - OG images won't have absolute URLs
export const metadata = {
  openGraph: { images: "/og.png" },  // Relative URL
};
```

```tsx
// GOOD - Absolute URLs
export const metadata = {
  metadataBase: new URL("https://example.com"),
  openGraph: { images: "/og.png" },  // Resolves to absolute URL
};
```

### ❌ Don't: Duplicate URL Logic

```tsx
// BAD - Repeated everywhere
const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";
```

```tsx
// GOOD - DRY helper
// lib/seo/config.ts
export const getBaseUrl = () =>
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
```

### ❌ Don't: Use Double Braces in i18n

```json
// BAD - next-intl uses ICU MessageFormat
{
  "title": "Hello {{name}}"  // Won't work
}
```

```json
// GOOD - Single braces
{
  "title": "Hello {name}"    // Correct ICU syntax
}
```

---

## Validation Checklist

### Before Deployment

- [ ] `metadataBase` set in root layout
- [ ] `/sitemap.xml` returns valid XML
- [ ] `/robots.txt` is accessible
- [ ] OG image loads at `/opengraph-image`
- [ ] All pages have unique `<title>`
- [ ] All pages have `<meta name="description">`
- [ ] Canonical URLs are absolute (not relative)
- [ ] hreflang alternates are correct
- [ ] JSON-LD validates in [Google Rich Results Test](https://search.google.com/test/rich-results)

### Testing Tools

| Tool | Purpose | URL |
|------|---------|-----|
| Google Rich Results | JSON-LD validation | https://search.google.com/test/rich-results |
| OpenGraph.xyz | OG preview | https://www.opengraph.xyz/ |
| Twitter Card Validator | Twitter preview | https://cards-dev.twitter.com/validator |
| SEO Meta Extension | Chrome extension | Chrome Web Store |

---

## Official Documentation

- **Next.js Metadata API**: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- **Open Graph**: https://ogp.me/
- **Schema.org**: https://schema.org/
- **Google Search Central**: https://developers.google.com/search/docs/appearance/structured-data

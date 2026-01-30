import type { Metadata, Viewport } from "next";

// This is the root layout that wraps all locales
// The actual layout with providers is in [locale]/layout.tsx

export const metadata: Metadata = {
  // Title template - %s will be replaced by page-specific titles
  title: {
    template: "%s | kimi-template",
    default: "kimi-template - Production-Ready Next.js 16 Starter",
  },
  description:
    "A production-ready starter template built with Next.js 16, Tailwind CSS v4, React 19, Better Auth, Drizzle ORM, and PostgreSQL. Features authentication, i18n, dashboard, and beautiful UI components.",
  keywords: [
    "Next.js 16",
    "React 19",
    "Tailwind CSS v4",
    "Better Auth",
    "Drizzle ORM",
    "PostgreSQL",
    "TypeScript",
    "shadcn/ui",
    "TanStack Query",
    "Starter Template",
    "Dashboard",
    "i18n",
  ],
  authors: [{ name: "kimi-template" }],
  creator: "kimi-template",
  publisher: "kimi-template",
  // Canonical URL base - update this when you have a production domain
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  // Alternate language versions
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
    siteName: "kimi-template",
    url: "/",
    title: "kimi-template - Production-Ready Next.js 16 Starter",
    description:
      "A production-ready starter template built with Next.js 16, Tailwind CSS v4, React 19, Better Auth, Drizzle ORM, and PostgreSQL.",
  },
  // Twitter Card defaults
  twitter: {
    card: "summary_large_image",
    title: "kimi-template - Production-Ready Next.js 16 Starter",
    description:
      "A production-ready starter template built with Next.js 16, Tailwind CSS v4, React 19, Better Auth, Drizzle ORM, and PostgreSQL.",
    creator: "@kimitemplate",
  },
  // Robots meta
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Verification (add your verification codes when available)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },
};

// Viewport configuration (separated as recommended by Next.js)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

import type { Metadata, Viewport } from "next";

// This is the root layout that wraps all locales
// The actual layout with providers is in [locale]/layout.tsx

export const metadata: Metadata = {
  // Title template - %s will be replaced by page-specific titles
  title: {
    template: "%s | My App",
    default: "My App - Modern Dashboard Application",
  },
  description:
    "A modern web application built with Next.js 16, Tailwind CSS v4, React 19, and shadcn/ui. Features interactive dashboards, real-time data visualization, and seamless user experience.",
  keywords: [
    "Next.js",
    "React",
    "Tailwind CSS",
    "Dashboard",
    "Analytics",
    "TypeScript",
    "Modern Web App",
  ],
  authors: [{ name: "My App Team" }],
  creator: "My App Team",
  publisher: "My App",
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
    siteName: "My App",
    url: "/",
    title: "My App - Modern Dashboard Application",
    description:
      "A modern web application built with Next.js 16, Tailwind CSS v4, and React 19.",
  },
  // Twitter Card defaults
  twitter: {
    card: "summary_large_image",
    title: "My App - Modern Dashboard Application",
    description:
      "A modern web application built with Next.js 16, Tailwind CSS v4, and React 19.",
    creator: "@myapp",
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

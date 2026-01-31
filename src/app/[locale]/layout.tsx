import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../../i18n/routing";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { HydrationSuppressor } from "@/components/providers/hydration-suppressor";
import { SkipLink } from "@/components/accessibility";
import { OrganizationJsonLd, WebSiteJsonLd, SoftwareApplicationJsonLd } from "@/components/seo";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import enMessages from "../../../i18n/messages/en.json";
import frMessages from "../../../i18n/messages/fr.json";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const messagesByLocale = {
  en: enMessages,
  fr: frMessages,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale" is valid
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "fr")) {
    notFound();
  }

  // Enable static rendering with next-intl
  setRequestLocale(locale);

  // Load messages statically based on locale
  const messages = messagesByLocale[locale as keyof typeof messagesByLocale];

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Accessibility: Skip to main content link */}
        <SkipLink />
        
        {/* Suppress hydration warnings from browser extensions */}
        <HydrationSuppressor />
        
        {/* Structured Data for SEO */}
        <OrganizationJsonLd />
        <WebSiteJsonLd locale={locale} />
        <SoftwareApplicationJsonLd />

        {/* 
          Provider order is critical:
          1. NextIntlClientProvider - i18n context (must be first for translations)
          2. ThemeProvider - theme context (needs to wrap children for theme access)
          3. QueryProvider - TanStack Query (can be innermost)
        */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        {process.env.NODE_ENV === "production" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}

import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../../i18n/routing";
import { QueryProvider } from "@/components/providers/query-provider";
import { Header } from "@/components/layout/header";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo";
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
  // Ensure that the incoming `locale` is valid
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
        {/* Structured Data for SEO */}
        <OrganizationJsonLd />
        <WebSiteJsonLd />

        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <Header />
            {children}
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

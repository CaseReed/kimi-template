/**
 * SEO Configuration - Single Source of Truth
 * Centralizes all SEO-related configuration to avoid duplication
 */

// Site metadata
export const siteConfig = {
  name: "kimi-template",
  shortName: "kimi",
  description: {
    en: "A production-ready starter template built with Next.js 16, Tailwind CSS v4, React 19, Better Auth, Drizzle ORM, and PostgreSQL. Features authentication, i18n, dashboard, and beautiful UI components.",
    fr: "Un template de démarrage production-ready construit avec Next.js 16, Tailwind CSS v4, React 19, Better Auth, Drizzle ORM et PostgreSQL. Inclut l'authentification, l'i18n, un dashboard et de magnifiques composants UI.",
  },
  tagline: {
    en: "Production-Ready Next.js 16 Starter Template",
    fr: "Template de démarrage Next.js 16 production-ready",
  },
  url: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000",
  twitterHandle: "@kimitemplate",
  githubUrl: "https://github.com/CaseReed/kimi-template",
  author: "kimi-template",
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
    "Boilerplate",
    "Web Development",
  ],
} as const;

// Get base URL helper
export const getBaseUrl = () => siteConfig.url;

// Get localized description
export const getLocalizedDescription = (locale: string): string => {
  return siteConfig.description[locale as keyof typeof siteConfig.description] ?? siteConfig.description.en;
};

// Get localized tagline
export const getLocalizedTagline = (locale: string): string => {
  return siteConfig.tagline[locale as keyof typeof siteConfig.tagline] ?? siteConfig.tagline.en;
};

// Open Graph image dimensions
export const openGraphConfig = {
  width: 1200,
  height: 630,
  alt: {
    en: "kimi-template - Production-Ready Next.js 16 Starter",
    fr: "kimi-template - Template Next.js 16 Production-Ready",
  },
} as const;

// Get localized OG alt text
export const getLocalizedOgAlt = (locale: string): string => {
  return openGraphConfig.alt[locale as keyof typeof openGraphConfig.alt] ?? openGraphConfig.alt.en;
};

---
name: next-intl-i18n
description: next-intl internationalization for Next.js 16 App Router - patterns, pitfalls, and best practices
license: MIT
compatibility: Next.js >=16.0.0, next-intl >=4.0.0
---

# next-intl i18n Skill

Complete guide for implementing internationalization (i18n) with `next-intl` in Next.js 16 App Router applications.

---

## Quick Reference

### ICU MessageFormat Syntax

**⚠️ CRITICAL RULE**: Use **single braces** `{variable}`, NOT double braces `{{variable}}`:

```json
// ❌ WRONG
{
  "greeting": "Hello {{name}}",
  "stats": "Page {{current}} of {{total}}"
}

// ✅ CORRECT
{
  "greeting": "Hello {name}",
  "stats": "Page {current} of {total}"
}
```

**Common Error:**
```
INVALID_MESSAGE: MALFORMED_ARGUMENT (Positive trend of {{value}}%)
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
pnpm add next-intl
```

### 2. Configuration Files

**`i18n/routing.ts`** - Define supported locales:
```typescript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr"],        // Supported locales
  defaultLocale: "en",          // Default when no match
  localePrefix: "always",       // Always show /en/, /fr/
});
```

**`i18n/request.ts`** - Load messages dynamically:
```typescript
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "fr")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../i18n/messages/${locale}.json`)).default,
  };
});
```

**`proxy.ts`** - Handle routing & redirects (⚠️ **Next.js 16+ uses `proxy.ts`, not `middleware.ts`**):
```typescript
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(en|fr)/:path*"],
};
```

> **Note:** Up until Next.js 16, this file was called `middleware.ts`. Next.js 16 introduced the `proxy.ts` naming convention.

**`next.config.ts`** - Add plugin:
```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
```

### 3. Navigation Setup

**`src/i18n/routing.ts`** - Client-side navigation:
```typescript
import { createNavigation } from "next-intl/navigation";
import { routing as i18nRouting } from "../../i18n/routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(i18nRouting);
```

---

## Project Structure

```
my-app/
├── i18n/
│   ├── routing.ts          # Routing configuration
│   ├── request.ts          # Request-scoped config
│   └── messages/
│       ├── en.json         # English translations
│       └── fr.json         # French translations
├── proxy.ts                # Next.js 16+ proxy (was middleware.ts before v16)
├── next.config.ts          # Next.js config with plugin
├── src/
│   ├── i18n/
│   │   └── routing.ts      # Client navigation exports
│   ├── app/
│   │   ├── layout.tsx      # Root layout (simplified)
│   │   ├── page.tsx        # Auto-detect & redirect
│   │   └── [locale]/
│   │       ├── layout.tsx  # Locale layout with provider
│   │       ├── page.tsx    # Localized pages
│   │       └── ...
│   └── components/
│       └── i18n/
│           └── LanguageSwitcher.tsx
```

---

## Core Patterns

### Hook Usage

```tsx
import { useTranslations, useLocale } from "next-intl";

export function MyComponent() {
  // ✅ CORRECT: Get translations
  const t = useTranslations("namespace");
  
  // ✅ CORRECT: Get current locale
  const locale = useLocale();
  
  // ❌ WRONG: Don't use translations to detect locale
  // const locale = useTranslations("language.switcher");
  
  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("welcome", { name: "John" })}</p>
    </div>
  );
}
```

### Navigation

```tsx
import { Link, useRouter, usePathname } from "@/i18n/routing";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  
  return (
    <nav>
      {/* Automatic locale prefix */}
      <Link href="/dashboard">Dashboard</Link>
      
      {/* Programmatic navigation */}
      <button onClick={() => router.push("/settings")}>
        Settings
      </button>
      
      {/* Switch locale */}
      <button onClick={() => router.push(pathname, { locale: "fr" })}>
        Français
      </button>
    </nav>
  );
}
```

### Server Components

```tsx
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  
  return <h1>{t("title")}</h1>;
}
```

---

## Locale-Aware Formatting

### Numbers & Currency

```tsx
import { useLocale } from "next-intl";

function formatCurrency(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

// Usage
const locale = useLocale();
formatCurrency(1234.56, locale); // "1 234,56 €" (fr) or "€1,234.56" (en)
```

### Dates

```tsx
function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
```

### Important: Avoid Hydration Mismatches

```tsx
// ❌ WRONG - Hardcoded locale causes hydration issues
new Intl.NumberFormat("fr-FR", { ... })

// ✅ CORRECT - Dynamic locale
const locale = useLocale();
new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", { ... })
```

---

## Language Switcher Component

```tsx
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const locales = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  const currentLocale = locales.find((l) => l.code === locale);

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-[130px]">
        <SelectValue>
          <span>{currentLocale?.flag}</span>
          <span>{currentLocale?.label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <span>{l.flag}</span>
            <span>{l.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

---

## Auto-Detection & Redirect

**`src/app/page.tsx`** - Detect browser language:

```tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "";
  
  const prefersFrench = acceptLanguage.toLowerCase().includes("fr");
  redirect(prefersFrench ? "/fr" : "/en");
}
```

---

## Translation Messages Structure

```json
{
  "metadata": {
    "home": {
      "title": "My App",
      "description": "Welcome to my app"
    }
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "settings": "Settings"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "confirm": "Are you sure?"
  },
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email",
    "loading": "Error loading data"
  }
}
```

---

## Lessons Learned

### Next.js 16: Use `proxy.ts` not `middleware.ts`

Starting with Next.js 16, the file for handling i18n routing must be named `proxy.ts` (previously `middleware.ts`):

```typescript
// proxy.ts (root of project)
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(en|fr)/:path*"],
};
```

### Loading Messages for Client-Side Navigation

When using `router.push(pathname, { locale })` to change language without page refresh, **avoid dynamic imports** in the layout. Use static imports instead:

```tsx
// ✅ CORRECT - Static imports work with client-side navigation
import enMessages from "../../../i18n/messages/en.json";
import frMessages from "../../../i18n/messages/fr.json";

const messagesByLocale = { en: enMessages, fr: frMessages };

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  // Load messages statically
  const messages = messagesByLocale[locale];
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

### Server Components Must Use Explicit Locale

Server Components using `useTranslations()` without async/await may get wrong locale. Use `getTranslations({ locale, namespace })`:

```tsx
// ❌ WRONG - May get wrong locale in Server Components
export default function Page() {
  const t = useTranslations("home");  // Uses context, may be undefined
  return <h1>{t("title")}</h1>;
}

// ✅ CORRECT - Explicit locale ensures correct translations
export default async function Page({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return <h1>{t("title")}</h1>;
}
```

### Common Pitfalls

### 1. Double Braces in JSON

```json
// ❌ WRONG
"greeting": "Hello {{name}}"

// ✅ CORRECT
"greeting": "Hello {name}"
```

### 2. Wrong Hook for Locale

```tsx
// ❌ WRONG
const locale = useTranslations("language.switcher");
const currentLocale = locale("en") === "Anglais" ? "fr" : "en";

// ✅ CORRECT
const currentLocale = useLocale();
```

### 3. Hardcoded Formatting Locale

```tsx
// ❌ WRONG
new Intl.NumberFormat("fr-FR", { ... })

// ✅ CORRECT
const locale = useLocale();
new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", { ... })
```

### 4. Missing Namespace

```tsx
// ❌ WRONG - Assumes root namespace
const t = useTranslations();
t("dashboard.title");

// ✅ CORRECT
const t = useTranslations("dashboard");
t("title");
```

---

## Validation Checklist

Before marking i18n as complete:

- [ ] All translation files use `{variable}` syntax (not `{{variable}}`)
- [ ] `useLocale()` used instead of hacks to detect locale
- [ ] `Intl` formatters use dynamic locale
- [ ] All user-facing strings are translated
- [ ] Metadata is localized via `generateMetadata`
- [ ] Language switcher updates URL and persists choice
- [ ] Auto-detection works from browser headers
- [ ] Build passes without errors
- [ ] No hydration mismatches in console

---

## Debugging

### Check Translation Syntax

```bash
grep -r "\{\{" i18n/messages/  # Should return nothing
```

### Verify Locale Detection

```bash
curl -H "Accept-Language: fr-FR" http://localhost:3000/
# Should redirect to /fr
```

### Test Language Switching

```bash
curl http://localhost:3000/en/dashboard | grep -i "dashboard"
curl http://localhost:3000/fr/dashboard | grep -i "tableau"
```

---

## Resources

- [next-intl Documentation](https://next-intl.dev/)
- [ICU MessageFormat Guide](https://formatjs.io/docs/core-concepts/icu-syntax/)
- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { usePathname } from "@/i18n/routing";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserNav } from "./user-nav";
import { LayoutDashboard, Home, Palette, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("navigation");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          locale={locale}
          className="flex items-center gap-2 font-bold text-lg"
        >
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Demo
          </span>
        </Link>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="flex items-center gap-6">
          <Link
            href="/"
            locale={locale}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground",
              pathname === "/" || pathname === `/${locale}`
                ? "text-foreground"
                : "text-muted-foreground"
            )}
            aria-current={pathname === "/" || pathname === `/${locale}` ? "page" : undefined}
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("home")}</span>
          </Link>
          <Link
            href="/dashboard"
            locale={locale}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground",
              pathname.startsWith("/dashboard") || pathname.startsWith(`/${locale}/dashboard`)
                ? "text-foreground"
                : "text-muted-foreground"
            )}
            aria-current={pathname.startsWith("/dashboard") || pathname.startsWith(`/${locale}/dashboard`) ? "page" : undefined}
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("dashboard")}</span>
          </Link>
          <Link
            href="/design-system"
            locale={locale}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground",
              pathname.startsWith("/design-system") || pathname.startsWith(`/${locale}/design-system`)
                ? "text-foreground"
                : "text-muted-foreground"
            )}
            aria-current={pathname.startsWith("/design-system") || pathname.startsWith(`/${locale}/design-system`) ? "page" : undefined}
          >
            <Palette className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Design System</span>
          </Link>
          <Link
            href="/design-system/tech-components"
            locale={locale}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground",
              pathname.includes("/tech-components")
                ? "text-foreground"
                : "text-muted-foreground"
            )}
            aria-current={pathname.includes("/tech-components") ? "page" : undefined}
          >
            <Layers className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Tech Components</span>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="ml-2 border-l pl-2">
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}

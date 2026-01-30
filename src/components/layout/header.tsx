"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserNav } from "./user-nav";
import { LayoutDashboard, Home, Palette } from "lucide-react";

export function Header() {
  const t = useTranslations("navigation");
  const locale = useLocale();

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
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            locale={locale}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">{t("home")}</span>
          </Link>
          <Link
            href="/dashboard"
            locale={locale}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">{t("dashboard")}</span>
          </Link>
          <Link
            href="/design-system"
            locale={locale}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Design System</span>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <div className="ml-2 border-l pl-2">
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}

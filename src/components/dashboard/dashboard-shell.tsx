"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslations } from "next-intl";

interface DashboardShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * Dashboard Shell - Clean container with subtle background
 */
export function DashboardShell({ children, className }: DashboardShellProps) {
  const t = useTranslations("dashboard");

  return (
    <div className={cn("min-h-screen bg-background flex flex-col", className)}>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 flex-1">
        {children}
      </main>
      
      {/* Dashboard Footer */}
      <footer className="border-t border-border bg-muted/30 mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              {t("footer.copyright")}
            </p>
            
            {/* Language Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{t("footer.language")}</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

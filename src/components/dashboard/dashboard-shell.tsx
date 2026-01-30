"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/animations/fade-in";
import { LogoutButton } from "@/components/auth/logout-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// User type compatible with Better Auth session.user
interface DashboardUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

interface DashboardShellProps {
  children: ReactNode;
  header?: ReactNode;
  user: DashboardUser;
  locale: string;
}

export function DashboardShell({
  children,
  header,
  user,
  locale,
}: DashboardShellProps) {
  const t = useTranslations("dashboard");

  // Get initials from user name or email
  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <FadeIn direction="up" duration={0.5}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t("title")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("subtitle")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {header && (
                  <div className="flex items-center gap-2">{header}</div>
                )}
                <Separator orientation="vertical" className="h-8" />
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">
                      {user.name || user.email}
                    </p>
                    {user.name && (
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <LogoutButton locale={locale} variant="outline" size="sm" />
              </div>
            </div>
          </FadeIn>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}

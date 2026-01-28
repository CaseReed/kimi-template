import { ReactNode } from "react";
import { FadeIn } from "@/components/animations/fade-in";

interface DashboardShellProps {
  children: ReactNode;
  header?: ReactNode;
}

export function DashboardShell({ children, header }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <FadeIn direction="up" duration={0.5}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vue d&apos;ensemble de vos métriques
                </p>
              </div>
              {header && (
                <div className="flex items-center gap-2">{header}</div>
              )}
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

import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme";
import { CTASection } from "@/components/cta-section";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  GradientText,
  AnimatedButton,
  FloatingElement,
  ScrollReveal,
  AnimatedLogo,
  CardHover,
} from "@/components/animations";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("home.title"),
    description: t("home.description"),
  };
}

// Feature card component
function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <ScrollReveal delay={delay}>
      <CardHover>
        <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/20">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
          <p className="flex-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </CardHover>
    </ScrollReveal>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-transparent bg-background/80 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <FadeIn direction="left" delay={0}>
            <Link href="/" locale={locale} className="flex items-center gap-3">
              <AnimatedLogo />
              <span className="font-bold text-lg">
                <GradientText>kimi-template</GradientText>
              </span>
            </Link>
          </FadeIn>

          <FadeIn direction="right" delay={0.1}>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
              <Link
                href="/login"
                locale={locale}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors ml-2"
              >
                {t("login")}
              </Link>
            </div>
          </FadeIn>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingElement
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
            duration={6}
            distance={15}
          />
          <FloatingElement
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"
            duration={8}
            delay={1}
            distance={20}
          />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <StaggerContainer className="space-y-8">
            <StaggerItem>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                {t("hero.badge")}
              </div>
            </StaggerItem>

            <StaggerItem>
              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                {t("hero.title")}{" "}
                <GradientText className="block mt-2">
                  {t("hero.highlight")}
                </GradientText>
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="mx-auto max-w-xl text-lg text-muted-foreground sm:text-xl">
                {t("hero.description")}
              </p>
            </StaggerItem>

            <StaggerItem>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <AnimatedButton href={`/${locale}/login`} variant="primary">
                  {t("hero.cta")}
                </AnimatedButton>
                <AnimatedButton
                  href="https://github.com"
                  variant="outline"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("hero.secondaryCta")}
                </AnimatedButton>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Tech stack badges */}
          <FadeIn delay={0.6} className="mt-16">
            <p className="text-sm text-muted-foreground mb-4">
              {t("hero.techStack")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                "Next.js 16",
                "React 19",
                "Tailwind CSS v4",
                "TypeScript",
                "Better Auth",
                "Drizzle ORM",
                "PostgreSQL",
                "shadcn/ui",
                "TanStack Query",
                "Motion",
                "next-intl",
                "Zustand",
              ].map((tech) => (
                <span key={tech} className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground">
                  {tech}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              {t("features.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t("features.description")}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            <FeatureCard
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
              title={t("features.items.performance.title")}
              description={t("features.items.performance.description")}
              delay={0}
            />
            <FeatureCard
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
              title={t("features.items.security.title")}
              description={t("features.items.security.description")}
              delay={0.1}
            />
            <FeatureCard
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title={t("features.items.i18n.title")}
              description={t("features.items.i18n.description")}
              delay={0.2}
            />
            <FeatureCard
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              title={t("features.items.analytics.title")}
              description={t("features.items.analytics.description")}
              delay={0.3}
            />
            <FeatureCard
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              }
              title={t("features.items.ui.title")}
              description={t("features.items.ui.description")}
              delay={0.4}
            />
            <FeatureCard
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              }
              title={t("features.items.code.title")}
              description={t("features.items.code.description")}
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title={t("cta.title")}
        description={t("cta.description")}
        buttonText={t("cta.button")}
        buttonHref={`/${locale}/login`}
      />

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <Link href="/" locale={locale} className="flex items-center gap-2 mb-4">
                  <AnimatedLogo />
                  <span className="font-bold text-lg">
                    <GradientText>kimi-template</GradientText>
                  </span>
                </Link>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  {t("footer.tagline")}
                </p>
                <div className="flex items-center gap-4">
                  <Link
                    href="https://github.com"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="GitHub"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Product Links */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">{t("footer.links.product")}</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t("footer.links.features")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t("footer.links.dashboard")}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources Links */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">{t("footer.links.resources")}</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="https://github.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t("footer.links.github")}
                    </Link>
                  </li>
                  <li>
                    <span className="text-sm text-muted-foreground/60">{t("footer.links.docs")} (soon)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="border-t border-border pt-8 mb-8">
              <p className="text-xs text-muted-foreground mb-3 text-center">{t("footer.builtWith")}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Next.js 16", "React 19", "Tailwind CSS v4", "Better Auth", "Drizzle ORM", "PostgreSQL"].map((tech) => (
                  <span key={tech} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t("footer.copyright")}
              </p>
            </div>
          </FadeIn>
        </div>
      </footer>
    </div>
  );
}

"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  TechTable,
  TechPagination,
  TechStatusBadge,
  TechInput,
  TechSearchInput,
  TechEmailInput,
  TechPasswordInput,
  TechCommandInput,
  TechBorder,
  TechCard,
  TechFrame,
  TechDivider,
  TechTooltip,
  TechInfoBadge,
  TechLabel,
  TechSkeleton,
  TechSkeletonGrid,
  TechCodeSkeleton,
  GlowCard,
  TextGradient,
} from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/animations/fade-in";
import {
  Zap,
  Shield,
  Database,
  Terminal,
  Copy,
  Check,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Layers,
} from "lucide-react";
import { Link } from "@/i18n/routing";

// ============================================
// Demo Data
// ============================================
interface Project {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending" | "error";
  deploys: number;
  region: string;
  lastDeploy: string;
}

const demoData: Project[] = [
  { id: "1", name: "api-gateway", status: "active", deploys: 142, region: "us-east", lastDeploy: "2 min ago" },
  { id: "2", name: "auth-service", status: "active", deploys: 89, region: "eu-west", lastDeploy: "1 hour ago" },
  { id: "3", name: "analytics-db", status: "pending", deploys: 34, region: "ap-south", lastDeploy: "3 hours ago" },
  { id: "4", name: "legacy-monolith", status: "inactive", deploys: 12, region: "us-west", lastDeploy: "2 days ago" },
  { id: "5", name: "ml-pipeline", status: "error", deploys: 0, region: "eu-north", lastDeploy: "Failed" },
];

// ============================================
// Copy Button Component with i18n
// ============================================
function CopyButton({ code }: { code: string }) {
  const t = useTranslations("designSystem");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
      aria-label={copied ? t("copy.copied") : t("copy.copy")}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
          <span className="text-green-500">{t("copy.copied")}</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t("copy.copy")}</span>
        </>
      )}
    </button>
  );
}

// ============================================
// Section Component
// ============================================
function Section({ title, description, children, delay = 0 }: { title: string; description?: string; children: React.ReactNode; delay?: number }) {
  return (
    <FadeIn delay={delay}>
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {description && <p className="text-muted-foreground mt-2">{description}</p>}
          <Separator className="mt-4" />
        </div>
        {children}
      </section>
    </FadeIn>
  );
}

// ============================================
// Main Page
// ============================================
export default function TechComponentsPage() {
  const t = useTranslations("designSystem.techComponents");
  const tDS = useTranslations("designSystem");
  
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = React.useState<string>("name");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  const [showSkeleton, setShowSkeleton] = React.useState(false);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const columns = [
    {
      key: "name",
      header: t("sections.techTable.columns.project"),
      sortable: true,
      cell: (row: Project) => (
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: t("sections.techTable.columns.status"),
      cell: (row: Project) => (
        <TechStatusBadge status={row.status} pulse={row.status === "active"}>
          {t(`sections.statusBadges.statuses.${row.status}`)}
        </TechStatusBadge>
      ),
    },
    {
      key: "deploys",
      header: t("sections.techTable.columns.deploys"),
      sortable: true,
      align: "right" as const,
      cell: (row: Project) => <span className="font-mono">{row.deploys}</span>,
    },
    {
      key: "region",
      header: t("sections.techTable.columns.region"),
      cell: (row: Project) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.region}
        </Badge>
      ),
    },
    {
      key: "lastDeploy",
      header: t("sections.techTable.columns.lastDeploy"),
      cell: (row: Project) => (
        <span className="text-muted-foreground text-sm">{row.lastDeploy}</span>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-secondary/50 via-background to-background p-8 md:p-16">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Terminal className="h-4 w-4" aria-hidden="true" />
              <span>{t("hero.badge")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <TextGradient>{t("hero.title")}</TextGradient>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {t("hero.description")}
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Navigation */}
      <FadeIn delay={0.1}>
        <nav aria-label="Design system navigation" className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/design-system">
              <Layers className="mr-2 h-4 w-4" aria-hidden="true" />
              {tDS("navigation.foundation")}
            </Link>
          </Button>
          <Button variant="default" size="sm" className="pointer-events-none" aria-current="page">
            <Terminal className="mr-2 h-4 w-4" aria-hidden="true" />
            {tDS("navigation.techComponents")}
          </Button>
        </nav>
      </FadeIn>

      {/* Tech Table Section */}
      <Section 
        title={t("sections.techTable.title")} 
        description={t("sections.techTable.description")} 
        delay={0.2}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <TechSearchInput 
              className="w-72" 
              aria-label={t("sections.techTable.searchPlaceholder")}
            />
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                aria-label={t("demo.ariaLabels.export")}
              >
                <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                {t("demo.export")}
              </Button>
            </div>
          </div>

          <TechTable<Project>
            data={demoData}
            columns={columns}
            keyExtractor={(row) => row.id}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            rowActions={[
              { 
                label: t("demo.edit"), 
                icon: <Edit className="h-4 w-4" aria-hidden="true" />, 
                onClick: (row) => console.log("Edit", row.name),
              },
              { 
                label: t("demo.viewLogs"), 
                onClick: (row) => console.log("Logs", row.name),
              },
              { 
                label: t("demo.delete"), 
                icon: <Trash2 className="h-4 w-4" aria-hidden="true" />, 
                onClick: (row) => console.log("Delete", row.name), 
                destructive: true,
              },
            ]}
          />

          <TechPagination
            currentPage={currentPage}
            totalPages={5}
            onPageChange={setCurrentPage}
            totalItems={47}
            pageSize={10}
          />

          {/* Live region for selection announcements */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {selectedIds.size > 0 && t("sections.techTable.selection", { count: selectedIds.size })}
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary" aria-hidden="true" />
              {t("sections.techTable.selection", { count: selectedIds.size })}
            </div>
          )}

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{t("usage")}</span>
              <CopyButton code="import { TechTable } from '@/components/design-system'" />
            </div>
            <code className="text-xs font-mono text-foreground/80 block whitespace-pre">
              {`<TechTable
  data={data}
  columns={columns}
  selectable
  sortColumn={sortColumn}
  onSort={handleSort}
/>`}
            </code>
          </div>
        </div>
      </Section>

      {/* Status Badges */}
      <Section 
        title={t("sections.statusBadges.title")} 
        description={t("sections.statusBadges.description")} 
        delay={0.25}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <TechStatusBadge status="active" pulse>
              {t("sections.statusBadges.statuses.active")}
            </TechStatusBadge>
            <TechStatusBadge status="inactive">
              {t("sections.statusBadges.statuses.inactive")}
            </TechStatusBadge>
            <TechStatusBadge status="pending">
              {t("sections.statusBadges.statuses.pending")}
            </TechStatusBadge>
            <TechStatusBadge status="success">
              {t("sections.statusBadges.statuses.success")}
            </TechStatusBadge>
            <TechStatusBadge status="warning">
              {t("sections.statusBadges.statuses.warning")}
            </TechStatusBadge>
            <TechStatusBadge status="error">
              {t("sections.statusBadges.statuses.error")}
            </TechStatusBadge>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{t("usage")}</span>
              <CopyButton code="<TechStatusBadge status='active' pulse />" />
            </div>
            <code className="text-xs font-mono text-foreground/80 block">
              {`<TechStatusBadge status="active" pulse />`}
            </code>
          </div>
        </div>
      </Section>

      {/* Tech Inputs */}
      <Section 
        title={t("sections.techInputs.title")} 
        description={t("sections.techInputs.description")} 
        delay={0.3}
      >
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <TechSearchInput 
                label={t("sections.techInputs.labels.search")} 
                hint={t("sections.techInputs.hints.search")} 
              />
              <TechEmailInput 
                label={t("sections.techInputs.labels.email")} 
                required 
              />
              <TechPasswordInput 
                label={t("sections.techInputs.labels.password")} 
                hint={t("sections.techInputs.hints.password")} 
              />
              <TechCommandInput 
                label={t("sections.techInputs.labels.command")} 
                hint={t("sections.techInputs.hints.command")} 
              />
            </div>

            <div className="space-y-4">
              <TechInput
                label={t("sections.techInputs.labels.projectName")}
                placeholder={t("sections.techInputs.placeholders.projectName")}
                error={t("sections.techInputs.errors.projectNameTaken")}
              />
              <TechInput
                label={t("sections.techInputs.labels.apiKey")}
                type="password"
                defaultValue="sk_live_123456789"
                hint={t("sections.techInputs.hints.apiKey")}
              />
              <TechInput
                label={t("sections.techInputs.labels.glowVariant")}
                variant="glow"
                placeholder={t("sections.techInputs.hints.glowVariant")}
              />
              <TechInput
                label={t("sections.techInputs.labels.ghostVariant")}
                variant="ghost"
                placeholder={t("sections.techInputs.hints.ghostVariant")}
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{t("usage")}</span>
              <CopyButton code="<TechSearchInput label='Search' hint='Search projects...' />" />
            </div>
            <code className="text-xs font-mono text-foreground/80 block">
              {`<TechSearchInput label="..." hint="..." />`}
            </code>
          </div>
        </div>
      </Section>

      {/* Tech Borders & Cards */}
      <Section 
        title={t("sections.techBorders.title")} 
        description={t("sections.techBorders.description")} 
        delay={0.35}
      >
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <TechBorder variant="default" className="p-6">
              <h3 className="font-semibold mb-2">{t("sections.techBorders.variants.default")}</h3>
              <p className="text-sm text-muted-foreground">{t("sections.techBorders.variants.defaultDescription")}</p>
            </TechBorder>

            <TechBorder variant="glow" className="p-6">
              <h3 className="font-semibold mb-2">{t("sections.techBorders.variants.glow")}</h3>
              <p className="text-sm text-muted-foreground">{t("sections.techBorders.variants.glowDescription")}</p>
            </TechBorder>

            <TechBorder variant="glow" animated intensity="high" className="p-6">
              <h3 className="font-semibold mb-2">{t("sections.techBorders.variants.pulsingGlow")}</h3>
              <p className="text-sm text-muted-foreground">{t("sections.techBorders.variants.pulsingGlowDescription")}</p>
            </TechBorder>

            <TechBorder variant="gradient" className="p-6">
              <h3 className="font-semibold mb-2">{t("sections.techBorders.variants.gradient")}</h3>
              <p className="text-sm text-muted-foreground">{t("sections.techBorders.variants.gradientDescription")}</p>
            </TechBorder>

            <TechBorder variant="neon" className="p-6">
              <h3 className="font-semibold mb-2">{t("sections.techBorders.variants.neon")}</h3>
              <p className="text-sm text-muted-foreground">{t("sections.techBorders.variants.neonDescription")}</p>
            </TechBorder>

            <TechBorder variant="scan" className="p-6">
              <h3 className="font-semibold mb-2">{t("sections.techBorders.variants.scan")}</h3>
              <p className="text-sm text-muted-foreground">{t("sections.techBorders.variants.scanDescription")}</p>
            </TechBorder>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <TechCard
              title={t("sections.techBorders.card.title")}
              description={t("sections.techBorders.card.description")}
              variant="glow"
              cornerAccent
              headerAction={
                <Button variant="ghost" size="icon" aria-label="More options">
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </Button>
              }
              footer={
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("sections.techBorders.card.lastUpdated")}</span>
                  <Button size="sm">{t("sections.techBorders.card.viewDetails")}</Button>
                </div>
              }
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" aria-hidden="true" />
                  <span className="text-sm">{t("sections.techBorders.card.securityScan")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="text-sm">{t("sections.techBorders.card.performanceOptimized")}</span>
                </div>
              </div>
            </TechCard>

            <TechFrame>
              <div className="text-center space-y-2">
                <Terminal className="h-8 w-8 text-primary mx-auto" aria-hidden="true" />
                <h3 className="font-semibold">{t("sections.techBorders.frame.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("sections.techBorders.frame.description")}</p>
              </div>
            </TechFrame>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{t("usage")}</span>
              <CopyButton code="<TechBorder variant='glow' animated />" />
            </div>
            <code className="text-xs font-mono text-foreground/80 block whitespace-pre">
              {`<TechBorder variant="glow" animated intensity="high">
  <h3>Glow Border</h3>
</TechBorder>`}
            </code>
          </div>
        </div>
      </Section>

      {/* Tech Tooltips */}
      <Section 
        title={t("sections.techTooltips.title")} 
        description={t("sections.techTooltips.description")} 
        delay={0.4}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-6">
            <TechTooltip content={t("sections.techTooltips.content.default")}>
              <Button variant="outline">{t("sections.techTooltips.labels.hoverMe")}</Button>
            </TechTooltip>

            <TechTooltip content={t("sections.techTooltips.content.info")} variant="info">
              <Button variant="outline">{t("sections.techTooltips.labels.info")}</Button>
            </TechTooltip>

            <TechTooltip content={t("sections.techTooltips.content.success")} variant="success">
              <Button variant="outline">{t("sections.techTooltips.labels.success")}</Button>
            </TechTooltip>

            <TechTooltip content={t("sections.techTooltips.content.warning")} variant="warning">
              <Button variant="outline">{t("sections.techTooltips.labels.warning")}</Button>
            </TechTooltip>

            <TechTooltip content={t("sections.techTooltips.content.error")} variant="error">
              <Button variant="outline">{t("sections.techTooltips.labels.error")}</Button>
            </TechTooltip>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>{t("sections.techTooltips.labels.status")}</span>
              <TechInfoBadge content={t("sections.techTooltips.content.serviceStatus")} variant="success" />
            </div>
            <div className="flex items-center gap-2">
              <TechLabel tooltip={t("sections.techTooltips.content.apiKeyTooltip")} required>
                {t("sections.techTooltips.labels.apiKey")}
              </TechLabel>
            </div>
          </div>

          <TechDivider className="my-6" />
          <TechDivider animated className="my-6" />

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{t("usage")}</span>
              <CopyButton code="<TechTooltip content='Info' variant='info' />" />
            </div>
            <code className="text-xs font-mono text-foreground/80 block whitespace-pre">
              {`<TechTooltip content="..." variant="info">
  <Button>Hover me</Button>
</TechTooltip>`}
            </code>
          </div>
        </div>
      </Section>

      {/* Tech Skeletons */}
      <Section 
        title={t("sections.techSkeletons.title")} 
        description={t("sections.techSkeletons.description")} 
        delay={0.45}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={() => setShowSkeleton(!showSkeleton)}>
              {showSkeleton ? t("sections.techSkeletons.hide") : t("sections.techSkeletons.show")}
            </Button>
          </div>

          {showSkeleton && (
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-medium mb-4">{t("sections.techSkeletons.types.card")}</h3>
                <TechSkeleton variant="card" className="max-w-sm" />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-4">{t("sections.techSkeletons.types.avatar")}</h3>
                <TechSkeleton variant="avatar" />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-4">{t("sections.techSkeletons.types.text")}</h3>
                <TechSkeleton variant="text" className="max-w-md" />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-4">{t("sections.techSkeletons.types.table")}</h3>
                <TechSkeleton variant="table" />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-4">{t("sections.techSkeletons.types.code")}</h3>
                <TechCodeSkeleton lines={8} />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-4">{t("sections.techSkeletons.types.grid")}</h3>
                <TechSkeletonGrid variant="card" count={4} columns={4} />
              </div>
            </div>
          )}

          {!showSkeleton && (
            <p className="text-muted-foreground">{t("sections.techSkeletons.prompt")}</p>
          )}

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{t("usage")}</span>
              <CopyButton code="<TechSkeleton variant='card' />" />
            </div>
            <code className="text-xs font-mono text-foreground/80 block whitespace-pre">
              {`<TechSkeleton variant="card" className="max-w-sm" />
<TechCodeSkeleton lines={8} />`}
            </code>
          </div>
        </div>
      </Section>

      {/* Glow Card Examples */}
      <Section 
        title={t("sections.glowCards.title")} 
        description={t("sections.glowCards.description")} 
        delay={0.5}
      >
        <div className="grid gap-6 md:grid-cols-3">
          <GlowCard>
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" aria-hidden="true" />
              <div>
                <h3 className="font-semibold">{t("sections.glowCards.variants.medium.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("sections.glowCards.variants.medium.description")}</p>
              </div>
            </div>
          </GlowCard>

          <GlowCard glowIntensity="high" animated>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
              <div>
                <h3 className="font-semibold">{t("sections.glowCards.variants.high.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("sections.glowCards.variants.high.description")}</p>
              </div>
            </div>
          </GlowCard>

          <GlowCard glowColor="rgba(34, 197, 94, 0.3)" glowIntensity="medium">
            <div className="flex items-center gap-3">
              <Check className="h-6 w-6 text-green-500" aria-hidden="true" />
              <div>
                <h3 className="font-semibold">{t("sections.glowCards.variants.custom.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("sections.glowCards.variants.custom.description")}</p>
              </div>
            </div>
          </GlowCard>
        </div>
      </Section>

      {/* Footer */}
      <FadeIn delay={0.55}>
        <footer className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            {tDS("footer")}
          </p>
        </footer>
      </FadeIn>
    </div>
  );
}

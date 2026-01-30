"use client";

import { useState } from "react";
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
  Info,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
} from "lucide-react";

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
// Section Component
// ============================================
function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <FadeIn>
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
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
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showSkeleton, setShowSkeleton] = useState(false);

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
      header: "Project",
      sortable: true,
      cell: (row: Project) => (
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row: Project) => (
        <TechStatusBadge status={row.status} pulse={row.status === "active"}>
          {row.status}
        </TechStatusBadge>
      ),
    },
    {
      key: "deploys",
      header: "Deploys",
      sortable: true,
      align: "right" as const,
      cell: (row: Project) => <span className="font-mono">{row.deploys}</span>,
    },
    {
      key: "region",
      header: "Region",
      cell: (row: Project) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.region}
        </Badge>
      ),
    },
    {
      key: "lastDeploy",
      header: "Last Deploy",
      cell: (row: Project) => (
        <span className="text-muted-foreground text-sm">{row.lastDeploy}</span>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-8 md:p-12">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00d9ff08_1px,transparent_1px),linear-gradient(to_bottom,#00d9ff08_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-4">
              <Terminal className="h-4 w-4" />
              <span>New Components</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              <TextGradient>Tech Design System</TextGradient>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Enhanced components with cyberpunk aesthetics - glow effects, animated borders, 
              and futuristic interactions.
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Tech Table Section */}
      <Section title="Tech Table" description="Advanced table with selection, sorting, and row actions">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <TechSearchInput className="w-72" />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
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
              { label: "Edit", icon: <Edit className="h-4 w-4" />, onClick: (row) => console.log("Edit", row.name) },
              { label: "View Logs", onClick: (row) => console.log("Logs", row.name) },
              { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: (row) => console.log("Delete", row.name), destructive: true },
            ]}
          />

          <TechPagination
            currentPage={currentPage}
            totalPages={5}
            onPageChange={setCurrentPage}
            totalItems={47}
            pageSize={10}
          />

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary" />
              {selectedIds.size} item(s) selected
            </div>
          )}
        </div>
      </Section>

      {/* Status Badges */}
      <Section title="Tech Status Badges" description="Status indicators with dot and pulse animations">
        <div className="flex flex-wrap gap-3">
          <TechStatusBadge status="active" pulse>Active</TechStatusBadge>
          <TechStatusBadge status="inactive">Inactive</TechStatusBadge>
          <TechStatusBadge status="pending">Pending</TechStatusBadge>
          <TechStatusBadge status="success">Success</TechStatusBadge>
          <TechStatusBadge status="warning">Warning</TechStatusBadge>
          <TechStatusBadge status="error">Error</TechStatusBadge>
        </div>
      </Section>

      {/* Tech Inputs */}
      <Section title="Tech Inputs" description="Form inputs with glow effects and icons">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <TechSearchInput label="Search" hint="Search across all projects" />
            <TechEmailInput label="Email" required />
            <TechPasswordInput label="Password" hint="Must be at least 8 characters" />
            <TechCommandInput label="Command" hint="Use arrow keys to navigate history" />
          </div>

          <div className="space-y-4">
            <TechInput
              label="Project Name"
              placeholder="my-awesome-project"
              error="This name is already taken"
            />
            <TechInput
              label="API Key"
              type="password"
              defaultValue="sk_live_123456789"
              hint="Keep this secret!"
            />
            <TechInput
              label="Glow Variant"
              variant="glow"
              placeholder="Focus me for glow effect..."
            />
            <TechInput
              label="Ghost Variant"
              variant="ghost"
              placeholder="Minimal appearance..."
            />
          </div>
        </div>
      </Section>

      {/* Tech Borders & Cards */}
      <Section title="Tech Borders & Cards" description="Border variants with glow and gradient effects">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <TechBorder variant="default" className="p-6">
            <h3 className="font-semibold mb-2">Default Border</h3>
            <p className="text-sm text-muted-foreground">Standard border styling</p>
          </TechBorder>

          <TechBorder variant="glow" className="p-6">
            <h3 className="font-semibold mb-2">Glow Border</h3>
            <p className="text-sm text-muted-foreground">Subtle cyan glow effect</p>
          </TechBorder>

          <TechBorder variant="glow" animated intensity="high" className="p-6">
            <h3 className="font-semibold mb-2">Pulsing Glow</h3>
            <p className="text-sm text-muted-foreground">Animated pulse effect</p>
          </TechBorder>

          <TechBorder variant="gradient" className="p-6">
            <h3 className="font-semibold mb-2">Gradient Border</h3>
            <p className="text-sm text-muted-foreground">Linear gradient edge</p>
          </TechBorder>

          <TechBorder variant="neon" className="p-6">
            <h3 className="font-semibold mb-2">Neon Border</h3>
            <p className="text-sm text-muted-foreground">Flickering neon effect</p>
          </TechBorder>

          <TechBorder variant="scan" className="p-6">
            <h3 className="font-semibold mb-2">Scan Effect</h3>
            <p className="text-sm text-muted-foreground">Animated scanner line</p>
          </TechBorder>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <TechCard
            title="Complete Card"
            description="Card with header, content, and footer"
            variant="glow"
            cornerAccent
            headerAction={
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
            footer={
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last updated 2m ago</span>
                <Button size="sm">View Details</Button>
              </div>
            }
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm">Security scan passed</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm">Performance optimized</span>
              </div>
            </div>
          </TechCard>

          <TechFrame>
            <div className="text-center space-y-2">
              <Terminal className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">Terminal Frame</h3>
              <p className="text-sm text-muted-foreground">Decorative corner accents</p>
            </div>
          </TechFrame>
        </div>
      </Section>

      {/* Tech Tooltips */}
      <Section title="Tech Tooltips" description="Contextual information with tech styling">
        <div className="flex flex-wrap items-center gap-6">
          <TechTooltip content="Default tooltip style">
            <Button variant="outline">Hover me</Button>
          </TechTooltip>

          <TechTooltip content="Info variant tooltip" variant="info">
            <Button variant="outline">Info</Button>
          </TechTooltip>

          <TechTooltip content="Success! Everything is working" variant="success">
            <Button variant="outline">Success</Button>
          </TechTooltip>

          <TechTooltip content="Warning: Check your configuration" variant="warning">
            <Button variant="outline">Warning</Button>
          </TechTooltip>

          <TechTooltip content="Error: Connection failed" variant="error">
            <Button variant="outline">Error</Button>
          </TechTooltip>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <TechInfoBadge content="This service is running normally" variant="success" />
          </div>
          <div className="flex items-center gap-2">
            <TechLabel tooltip="This field is required for API access" required>
              API Key
            </TechLabel>
          </div>
        </div>

        <TechDivider className="my-6" />
        <TechDivider animated className="my-6" />
      </Section>

      {/* Tech Skeletons */}
      <Section title="Tech Skeletons" description="Loading states with shimmer effects">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => setShowSkeleton(!showSkeleton)}>
            {showSkeleton ? "Hide" : "Show"} Skeletons
          </Button>
        </div>

        {showSkeleton && (
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-medium mb-4">Card Skeleton</h3>
              <TechSkeleton variant="card" className="max-w-sm" />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4">Avatar Skeleton</h3>
              <TechSkeleton variant="avatar" />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4">Text Skeleton</h3>
              <TechSkeleton variant="text" className="max-w-md" />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4">Table Skeleton</h3>
              <TechSkeleton variant="table" />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4">Code Skeleton</h3>
              <TechCodeSkeleton lines={8} />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4">Skeleton Grid</h3>
              <TechSkeletonGrid variant="card" count={4} columns={4} />
            </div>
          </div>
        )}

        {!showSkeleton && (
          <p className="text-muted-foreground">Click "Show Skeletons" to see loading states</p>
        )}
      </Section>

      {/* Glow Card Examples */}
      <Section title="Glow Card Variants" description="Cards with customizable glow effects">
        <div className="grid gap-6 md:grid-cols-3">
          <GlowCard>
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Medium Glow</h3>
                <p className="text-sm text-muted-foreground">Default intensity</p>
              </div>
            </div>
          </GlowCard>

          <GlowCard glowIntensity="high" animated>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">High Intensity</h3>
                <p className="text-sm text-muted-foreground">With animation</p>
              </div>
            </div>
          </GlowCard>

          <GlowCard glowColor="rgba(34, 197, 94, 0.3)" glowIntensity="medium">
            <div className="flex items-center gap-3">
              <Check className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-semibold">Custom Color</h3>
                <p className="text-sm text-muted-foreground">Green glow</p>
              </div>
            </div>
          </GlowCard>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
        <p>
          Tech Design System — Components built for the future
        </p>
      </footer>
    </div>
  );
}

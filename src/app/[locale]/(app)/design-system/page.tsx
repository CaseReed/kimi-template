"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { GlowCard, GradientBorder, Spotlight, TextGradient } from "@/components/design-system"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Check, Info, AlertTriangle, X, Moon, Sun, Zap, Shield, 
  Database, Globe, Settings, User, Search, Bell, Menu,
  ChevronRight, Copy, CheckCircle, Terminal,
  Code, Cpu, Layers, Sparkles, Eye, Lock, Wifi
} from "lucide-react"

// Color Swatch Component with copy-to-clipboard
function ColorSwatch({ name, value, cssVar }: { name: string; value: string; cssVar: string }) {
  const [copied, setCopied] = React.useState(false)
  
  // Handle cleanup for setTimeout
  React.useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssVar)
    setCopied(true)
  }
  
  return (
    <button
      onClick={copyToClipboard}
      className="group flex flex-col gap-2 rounded-lg border border-border p-3 transition-colors hover:border-primary/50 hover:bg-secondary"
    >
      <div 
        className="h-16 w-full rounded-md shadow-sm"
        style={{ backgroundColor: value }}
      />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{name}</span>
        {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 opacity-0 group-hover:opacity-50" />}
      </div>
      <code className="text-xs text-muted-foreground">{cssVar}</code>
    </button>
  )
}

// Section Header Component
function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      <Separator className="mt-4" />
    </div>
  )
}

// Subsection Header
function SubsectionHeader({ title }: { title: string }) {
  return <h3 className="text-xl font-semibold mb-4">{title}</h3>
}

export default function DesignSystemPage() {
  // Gray scale colors
  const grayColors = [
    { name: "Gray 100", value: "var(--gray-100)", cssVar: "var(--gray-100)" },
    { name: "Gray 200", value: "var(--gray-200)", cssVar: "var(--gray-200)" },
    { name: "Gray 300", value: "var(--gray-300)", cssVar: "var(--gray-300)" },
    { name: "Gray 400", value: "var(--gray-400)", cssVar: "var(--gray-400)" },
    { name: "Gray 500", value: "var(--gray-500)", cssVar: "var(--gray-500)" },
    { name: "Gray 600", value: "var(--gray-600)", cssVar: "var(--gray-600)" },
    { name: "Gray 700", value: "var(--gray-700)", cssVar: "var(--gray-700)" },
    { name: "Gray 800", value: "var(--gray-800)", cssVar: "var(--gray-800)" },
    { name: "Gray 900", value: "var(--gray-900)", cssVar: "var(--gray-900)" },
    { name: "Gray 1000", value: "var(--gray-1000)", cssVar: "var(--gray-1000)" },
  ]

  // Primary (Cyan) scale
  const primaryColors = [
    { name: "Cyan 100", value: "var(--primary-100)", cssVar: "var(--primary-100)" },
    { name: "Cyan 200", value: "var(--primary-200)", cssVar: "var(--primary-200)" },
    { name: "Cyan 300", value: "var(--primary-300)", cssVar: "var(--primary-300)" },
    { name: "Cyan 400", value: "var(--primary-400)", cssVar: "var(--primary-400)" },
    { name: "Cyan 500", value: "var(--primary-500)", cssVar: "var(--primary-500)" },
    { name: "Cyan 600", value: "var(--primary-600)", cssVar: "var(--primary-600)" },
    { name: "Cyan 700", value: "var(--primary-700)", cssVar: "var(--primary-700)" },
    { name: "Cyan 800", value: "var(--primary-800)", cssVar: "var(--primary-800)" },
    { name: "Cyan 900", value: "var(--primary-900)", cssVar: "var(--primary-900)" },
    { name: "Cyan 1000", value: "var(--primary-1000)", cssVar: "var(--primary-1000)" },
  ]

  // Semantic colors
  const semanticColors = [
    { name: "Success 100", value: "var(--green-100)", cssVar: "var(--green-100)" },
    { name: "Success 500", value: "var(--green-500)", cssVar: "var(--green-500)" },
    { name: "Success 1000", value: "var(--green-1000)", cssVar: "var(--green-1000)" },
    { name: "Warning 100", value: "var(--amber-100)", cssVar: "var(--amber-100)" },
    { name: "Warning 500", value: "var(--amber-500)", cssVar: "var(--amber-500)" },
    { name: "Warning 1000", value: "var(--amber-1000)", cssVar: "var(--amber-1000)" },
    { name: "Error 100", value: "var(--red-100)", cssVar: "var(--red-100)" },
    { name: "Error 500", value: "var(--red-500)", cssVar: "var(--red-500)" },
    { name: "Error 1000", value: "var(--red-1000)", cssVar: "var(--red-1000)" },
  ]

  // Icons to display
  const icons = [
    { icon: Zap, name: "Zap" },
    { icon: Shield, name: "Shield" },
    { icon: Database, name: "Database" },
    { icon: Globe, name: "Globe" },
    { icon: Settings, name: "Settings" },
    { icon: User, name: "User" },
    { icon: Search, name: "Search" },
    { icon: Bell, name: "Bell" },
    { icon: Menu, name: "Menu" },
    { icon: Moon, name: "Moon" },
    { icon: Sun, name: "Sun" },
    { icon: Terminal, name: "Terminal" },
    { icon: Code, name: "Code" },
    { icon: Cpu, name: "Cpu" },
    { icon: Layers, name: "Layers" },
    { icon: Sparkles, name: "Sparkles" },
    { icon: Eye, name: "Eye" },
    { icon: Lock, name: "Lock" },
    { icon: Wifi, name: "Wifi" },
    { icon: CheckCircle, name: "CheckCircle" },
  ]

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-secondary/50 via-background to-background p-8 md:p-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Tech Noir Aesthetic</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <TextGradient gradient="from-cyan-400 via-blue-500 to-cyan-400" animate>
              Design System
            </TextGradient>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A cyberpunk-inspired design system featuring electric cyan accents, 
            dark mode dominance, and futuristic UI patterns.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Toggle theme:</span>
            <ThemeToggle />
          </div>
        </div>
      </section>

      {/* Colors Section */}
      <section>
        <SectionHeader 
          title="Colors" 
          description="The Tech Noir color palette features a sophisticated gray scale with electric cyan accents."
        />
        
        <div className="space-y-8">
          <div>
            <SubsectionHeader title="Gray Scale" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {grayColors.map((color) => (
                <ColorSwatch key={color.name} {...color} />
              ))}
            </div>
          </div>

          <div>
            <SubsectionHeader title="Primary Scale (Cyan)" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {primaryColors.map((color) => (
                <ColorSwatch key={color.name} {...color} />
              ))}
            </div>
          </div>

          <div>
            <SubsectionHeader title="Semantic Colors" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {semanticColors.map((color) => (
                <ColorSwatch key={color.name} {...color} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section>
        <SectionHeader 
          title="Typography" 
          description="Type scale and font weights for the Tech Noir design system."
        />
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Headings</CardTitle>
              <CardDescription>Display and heading hierarchy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Display</span>
                <p className="text-5xl font-bold tracking-tight">Display Title</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">H1</span>
                <h1 className="text-4xl font-bold tracking-tight">Heading 1</h1>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">H2</span>
                <h2 className="text-3xl font-bold tracking-tight">Heading 2</h2>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">H3</span>
                <h3 className="text-2xl font-bold tracking-tight">Heading 3</h3>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">H4</span>
                <h4 className="text-xl font-semibold tracking-tight">Heading 4</h4>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">H5</span>
                <h5 className="text-lg font-semibold">Heading 5</h5>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">H6</span>
                <h6 className="text-base font-semibold">Heading 6</h6>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Body Text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg leading-relaxed">
                  Large text (text-lg) — Used for introductory paragraphs and important descriptions.
                </p>
                <p className="text-base leading-relaxed">
                  Base text (text-base) — The standard body text size for most content.
                </p>
                <p className="text-sm leading-relaxed">
                  Small text (text-sm) — Used for secondary information and metadata.
                </p>
                <p className="text-xs leading-relaxed">
                  Extra small (text-xs) — For fine print, labels, and timestamps.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Font Weights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-2xl font-thin">Thin (100)</p>
                <p className="text-2xl font-light">Light (300)</p>
                <p className="text-2xl font-normal">Regular (400)</p>
                <p className="text-2xl font-medium">Medium (500)</p>
                <p className="text-2xl font-semibold">Semibold (600)</p>
                <p className="text-2xl font-bold">Bold (700)</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monospace</CardTitle>
              <CardDescription>Code and technical text using Geist Mono</CardDescription>
            </CardHeader>
            <CardContent>
              <code className="block rounded-lg bg-muted p-4 font-mono text-sm">
                <span className="text-primary">const</span>{" "}
                <span className="text-foreground">techNoir</span> = {"{"}
                <br />
                {"  "}theme: <span className="text-green-500">&quot;cyberpunk&quot;</span>,
                <br />
                {"  "}accent: <span className="text-green-500">&quot;cyan&quot;</span>,
                <br />
                {"  "}darkMode: <span className="text-primary">true</span>
                <br />
                {"}"}
              </code>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Buttons Section */}
      <section>
        <SectionHeader 
          title="Buttons" 
          description="Interactive button variants and sizes with Tech Noir styling."
        />
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button Sizes</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Zap className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buttons with Icons</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button>
                <Zap className="mr-2 h-4 w-4" />
                Get Started
              </Button>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="secondary">
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="destructive">
                <X className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button States</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>
                Disabled Outline
              </Button>
              <Button className="animate-pulse-glow">
                <Zap className="mr-2 h-4 w-4" />
                Pulsing Glow
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Inputs & Forms Section */}
      <section>
        <SectionHeader 
          title="Inputs & Forms" 
          description="Form controls with various states and configurations."
        />
        
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Input States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default">Default</Label>
                  <Input id="default" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="focus">Focus State</Label>
                  <Input id="focus" placeholder="Focused input" className="ring-2 ring-ring" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disabled">Disabled</Label>
                  <Input id="disabled" disabled placeholder="Disabled input" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Input with Icons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="search" placeholder="Search..." className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" className="pl-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Textarea</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  placeholder="Type your message here..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cards Section */}
      <section>
        <SectionHeader 
          title="Cards" 
          description="Various card styles for different use cases."
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card component</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The default card with header and content areas. Used for general content containers.
              </p>
            </CardContent>
          </Card>

          <GlowCard>
            <h3 className="text-lg font-semibold mb-2">Glow Card</h3>
            <p className="text-muted-foreground">
              A card with a subtle cyan glow effect that adds depth and visual interest.
            </p>
          </GlowCard>

          <GradientBorder>
            <h3 className="text-lg font-semibold mb-2">Gradient Border</h3>
            <p className="text-muted-foreground">
              Card with an animated gradient border that creates a vibrant, dynamic edge.
            </p>
          </GradientBorder>

          <Spotlight>
            <h3 className="text-lg font-semibold mb-2">Spotlight Card</h3>
            <p className="text-muted-foreground">
              Interactive card with a spotlight effect that follows your cursor movement.
            </p>
          </Spotlight>

          <GlowCard glowIntensity="high" animated>
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">High Intensity Glow</h3>
                <p className="text-sm text-muted-foreground">
                  With pulsing animation
                </p>
              </div>
            </div>
          </GlowCard>

          <GlowCard glowColor="rgba(255, 68, 68, 0.3)" glowIntensity="medium">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold">Red Glow</h3>
                <p className="text-sm text-muted-foreground">
                  Custom glow color for warnings
                </p>
              </div>
            </div>
          </GlowCard>
        </div>
      </section>

      {/* Badges Section */}
      <section>
        <SectionHeader 
          title="Badges" 
          description="Status indicators and labels."
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Badge Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="success">
                <Check className="mr-1 h-3 w-3" />
                Success
              </Badge>
              <Badge variant="warning">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Warning
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Alerts Section */}
      <section>
        <SectionHeader 
          title="Alerts" 
          description="Contextual feedback messages."
        />
        
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is a default alert with neutral styling for general information.
            </AlertDescription>
          </Alert>

          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertTitle>Info Alert</AlertTitle>
            <AlertDescription>
              This alert provides additional information with cyan accent colors.
            </AlertDescription>
          </Alert>

          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success Alert</AlertTitle>
            <AlertDescription>
              Your changes have been saved successfully with a green confirmation style.
            </AlertDescription>
          </Alert>

          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning Alert</AlertTitle>
            <AlertDescription>
              Please review your settings before continuing. This uses amber accent colors.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertTitle>Error Alert</AlertTitle>
            <AlertDescription>
              Something went wrong. Please try again later with red destructive styling.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Icons Section */}
      <section>
        <SectionHeader 
          title="Icons" 
          description="Lucide icon library integration with Tech Noir styling."
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Icon Gallery</CardTitle>
            <CardDescription>Common icons at various sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-4">
              {icons.map(({ icon: Icon, name }) => (
                <div key={name} className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/50">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">{name}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-4">Icon Sizes</h4>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">16px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">20px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  <span className="text-xs text-muted-foreground">24px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Zap className="h-8 w-8 text-primary" />
                  <span className="text-xs text-muted-foreground">32px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Zap className="h-10 w-10 text-primary" />
                  <span className="text-xs text-muted-foreground">40px</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Effects Section */}
      <section>
        <SectionHeader 
          title="Effects" 
          description="Special visual effects and animations."
        />
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Gradient Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold">
                <TextGradient>Default Gradient</TextGradient>
              </p>
              <p className="text-3xl font-bold">
                <TextGradient gradient="from-purple-400 via-pink-500 to-red-500">
                  Purple to Red
                </TextGradient>
              </p>
              <p className="text-3xl font-bold">
                <TextGradient gradient="from-green-400 to-emerald-600">
                  Green Emerald
                </TextGradient>
              </p>
              <p className="text-3xl font-bold">
                <TextGradient animate>
                  Animated Gradient
                </TextGradient>
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Glow Effects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary animate-pulse-glow" />
                  <span className="text-sm text-muted-foreground">Pulse Glow</span>
                </div>
                <div className="flex items-center gap-4">
                  <div 
                    className="h-12 w-12 rounded-lg bg-primary transition-all hover:shadow-[0_0_30px_rgba(0,217,255,0.5)]" 
                  />
                  <span className="text-sm text-muted-foreground">Hover Glow</span>
                </div>
                <div className="flex items-center gap-4">
                  <div 
                    className="h-12 w-12 rounded-lg bg-destructive shadow-[0_0_20px_rgba(255,68,68,0.4)]" 
                  />
                  <span className="text-sm text-muted-foreground">Red Glow</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skeleton Loading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex items-center gap-4 pt-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Spotlight className="bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex flex-col items-center text-center">
              <Sparkles className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                <TextGradient>Interactive Spotlight</TextGradient>
              </h3>
              <p className="text-muted-foreground max-w-md">
                Move your cursor over this card to see the spotlight effect in action. 
                It creates an engaging, dynamic feel that draws attention.
              </p>
            </div>
          </Spotlight>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
        <p>
          Tech Noir Design System — Built with Next.js 16, Tailwind CSS v4, and shadcn/ui
        </p>
      </footer>
    </div>
  )
}

---
name: shadcn-ui
description: shadcn/ui components library with Tailwind CSS 4, Next.js 16, and Charts (recharts)
license: MIT
compatibility: Next.js >=16.0.0, Tailwind CSS >=4.0.0, React >=19.0.0
---

# shadcn/ui Skill

Complete guide for using shadcn/ui component library with Next.js 16, Tailwind CSS 4, and Recharts for data visualization.

---

## What is shadcn/ui?

shadcn/ui is not a component library you install as a dependency. Instead:
- **Copy-paste components** into your project
- **Fully customizable** - you own the code
- **Built on Radix UI** primitives for accessibility
- **Styled with Tailwind CSS** - easy to customize
- **TypeScript first** - full type safety

---

## Project Setup

### 1. Initialize shadcn

```bash
npx shadcn@latest init
```

**Options:**
- Base color: `neutral` (recommended), `gray`, `zinc`, `stone`, `slate`
- CSS variables: Yes (for theming)

### 2. Configuration Files

**components.json** (auto-generated):
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### 3. Install Components

```bash
# UI Components
npx shadcn@latest add button card input label badge avatar
npx shadcn@latest add dialog dropdown-menu select tabs
npx shadcn@latest add table skeleton separator

# Charts
npx shadcn@latest add chart

# Forms (with React Hook Form + Zod)
npx shadcn@latest add form
```

---

## Core Components Usage

### Button

```tsx
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Variants
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading
</Button>

// As Child (for Next.js Link)
import Link from "next/link";
<Button asChild>
  <Link href="/dashboard">Dashboard</Link>
</Button>
```

### Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Create Project</CardTitle>
    <CardDescription>Deploy your new project</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Form or content */}
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Deploy</Button>
  </CardFooter>
</Card>
```

### Input with Label

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input type="email" id="email" placeholder="Email" />
</div>
```

### Dialog (Modal)

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Edit Profile</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here.
      </DialogDescription>
    </DialogHeader>
    {/* Form content */}
  </DialogContent>
</Dialog>
```

---

## Charts with Recharts

### Installation

```bash
npx shadcn@latest add chart
pnpm add recharts
```

### Basic Area Chart

```tsx
"use client";

import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function AreaChartDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart</CardTitle>
        <CardDescription>Showing total visitors</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="var(--color-mobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
```

### Bar Chart

```tsx
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

<ChartContainer config={chartConfig}>
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis
      dataKey="month"
      tickLine={false}
      tickMargin={10}
      axisLine={false}
      tickFormatter={(value) => value.slice(0, 3)}
    />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
```

### Line Chart

```tsx
import { Line, LineChart, CartesianGrid, XAxis } from "recharts";

<ChartContainer config={chartConfig}>
  <LineChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Line
      dataKey="desktop"
      type="monotone"
      stroke="var(--color-desktop)"
      strokeWidth={2}
      dot={false}
    />
  </LineChart>
</ChartContainer>
```

### Pie Chart

```tsx
import { Pie, PieChart } from "recharts";

<ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
  <PieChart>
    <ChartTooltip content={<ChartTooltipContent nameKey="visitors" hideLabel />} />
    <Pie data={chartData} dataKey="visitors" label nameKey="browser" />
  </PieChart>
</ChartContainer>
```

---

## 📱 Responsive Charts - Mobile-First Patterns

### Chart Container Requirements

**Always use `min-h-[VALUE]` + `w-full` on ChartContainer:**

```tsx
// ✅ Correct - ChartContainer gère la hauteur minimale
<ChartContainer config={chartConfig} className="min-h-[200px] w-full">
  <AreaChart accessibilityLayer data={chartData}>
    {/* ... */}
  </AreaChart>
</ChartContainer>

// ❌ Incorrect - Pas de hauteur fixe
<ChartContainer config={chartConfig} className="h-[300px]">
```

### Chart Grid Layout

**Envelopper les graphiques dans un conteneur avec `min-w-0 overflow-hidden`:**

```tsx
// ✅ Correct - Empêche le débordement
<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
  <div className="min-w-0 overflow-hidden">
    <RevenueChart />
  </div>
  <div className="min-w-0 overflow-hidden">
    <CategoryChart />
  </div>
</div>

// ❌ Incorrect - Risque de débordement sur mobile
<div className="grid gap-4 md:grid-cols-2">
  <RevenueChart />
  <CategoryChart />
</div>
```

### Area Chart - Responsive Pattern

```tsx
<ChartContainer config={chartConfig} className="min-h-[200px] w-full">
  <AreaChart
    accessibilityLayer
    data={chartData}
    margin={{
      left: 12,
      right: 12,
    }}
  >
    <CartesianGrid strokeDasharray="3 3" vertical={false} />
    <XAxis
      dataKey="month"
      tickLine={false}
      axisLine={false}
      tickMargin={8}
      tickFormatter={(value) => value.slice(0, 3)} // "Janvier" → "Jan"
    />
    <YAxis
      tickLine={false}
      axisLine={false}
      tickMargin={8}
      tickFormatter={(value) =>
        new Intl.NumberFormat("fr-FR", {
          notation: "compact",
          compactDisplay: "short",
          style: "currency",
          currency: "EUR",
        }).format(value as number)
      }
    />
    <ChartTooltip
      cursor={false}
      content={<ChartTooltipContent indicator="dot" />}
    />
    <Area
      dataKey="revenue"
      type="monotone"
      fill="var(--color-revenue)"  // Utilise les CSS variables
      stroke="var(--color-revenue)"
      fillOpacity={0.3}
      strokeWidth={2}
    />
  </AreaChart>
</ChartContainer>
```

### Horizontal Bar Chart - Responsive Pattern

```tsx
<ChartContainer config={chartConfig} className="min-h-[200px] w-full">
  <BarChart
    accessibilityLayer
    data={chartData}
    layout="vertical"
    margin={{
      left: -20,  // Compense la largeur des labels Y
    }}
  >
    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
    <XAxis
      type="number"
      tickFormatter={(value) => `${value}%`}
      tickLine={false}
      axisLine={false}
      tickMargin={8}
    />
    <YAxis
      dataKey="category"
      type="category"
      tickLine={false}
      tickMargin={10}
      axisLine={false}
    />
    <ChartTooltip
      cursor={false}
      content={<ChartTooltipContent hideLabel />}
    />
    <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} />
  </BarChart>
</ChartContainer>
```

### Chart Configuration Best Practices

```tsx
import { type ChartConfig } from "@/components/ui/chart";

// ✅ Utilise satisfies ChartConfig pour le typage
const chartConfig = {
  revenue: {
    label: "Revenus",
    color: "hsl(var(--chart-1))",  // CSS variable
  },
  target: {
    label: "Objectif",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// Utilise les couleurs dans le graphique
<Area fill="var(--color-revenue)" stroke="var(--color-revenue)" />
```

### Critical Rules for Responsive Charts

| Règle | Explication |
|-------|-------------|
| **`min-h-[VALUE]`** | Obligatoire pour responsivité (pas `h-[]`) |
| **`w-full`** | Toujours inclure sur ChartContainer |
| **`min-w-0 overflow-hidden`** | Sur le wrapper des cartes de graphiques |
| **`margin={{ left: -20 }}`** | Pour bar charts horizontaux |
| **`tickFormatter`** | Tronquer labels longs : `value.slice(0, 3)` |
| **`fill="var(--color-key)"`** | Utiliser les CSS variables du ChartConfig |
| **`cursor={false}`** | Désactiver curseur par défaut sur tooltip |
| **`accessibilityLayer`** | Toujours ajouter pour l'accessibilité |

---

## Theming with Tailwind 4

### CSS Variables in globals.css

shadcn adds CSS variables for theming. With Tailwind 4, configure in `globals.css` using `@theme inline`:

```css
@import "tailwindcss";

/* CSS Variables with hsl() wrapper */
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(0 0% 3.9%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(0 0% 3.9%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(0 0% 3.9%);
  --primary: hsl(0 0% 9%);
  --primary-foreground: hsl(0 0% 98%);
  --secondary: hsl(0 0% 96.1%);
  --secondary-foreground: hsl(0 0% 9%);
  --muted: hsl(0 0% 96.1%);
  --muted-foreground: hsl(0 0% 45.1%);
  --accent: hsl(0 0% 96.1%);
  --accent-foreground: hsl(0 0% 9%);
  --destructive: hsl(0 84.2% 60.2%);
  --destructive-foreground: hsl(0 0% 98%);
  --border: hsl(0 0% 89.8%);
  --input: hsl(0 0% 89.8%);
  --ring: hsl(0 0% 3.9%);
  --radius: 0.5rem;
  --chart-1: hsl(12 76% 61%);
  --chart-2: hsl(173 58% 39%);
  --chart-3: hsl(197 37% 24%);
  --chart-4: hsl(43 74% 66%);
  --chart-5: hsl(27 87% 67%);
}

.dark {
  --background: hsl(0 0% 3.9%);
  --foreground: hsl(0 0% 98%);
  --card: hsl(0 0% 3.9%);
  --card-foreground: hsl(0 0% 98%);
  --popover: hsl(0 0% 3.9%);
  --popover-foreground: hsl(0 0% 98%);
  --primary: hsl(0 0% 98%);
  --primary-foreground: hsl(0 0% 9%);
  --secondary: hsl(0 0% 14.9%);
  --secondary-foreground: hsl(0 0% 98%);
  --muted: hsl(0 0% 14.9%);
  --muted-foreground: hsl(0 0% 63.9%);
  --accent: hsl(0 0% 14.9%);
  --accent-foreground: hsl(0 0% 98%);
  --destructive: hsl(0 62.8% 30.6%);
  --destructive-foreground: hsl(0 0% 98%);
  --border: hsl(0 0% 14.9%);
  --input: hsl(0 0% 14.9%);
  --ring: hsl(0 0% 83.1%);
  --chart-1: hsl(220 70% 50%);
  --chart-2: hsl(160 60% 45%);
  --chart-3: hsl(30 80% 55%);
  --chart-4: hsl(280 65% 60%);
  --chart-5: hsl(340 75% 55%);
}

@theme inline {
  /* shadcn/ui colors - reference CSS variables directly */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  
  /* Chart colors */
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  
  /* Radius */
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}
```

---

## ⚠️ Tailwind CSS v4 Cursor Pointer Change

**Important:** Tailwind CSS v4 changed the default button cursor from `pointer` to `default`. This is an intentional design decision.

**To restore pointer cursor,** add to `src/app/globals.css`:
```css
@layer base {
  button:not([disabled]),
  [role="button"]:not([disabled]) {
    cursor: pointer;
  }
}
```

---

## Animation Plugin Migration

As of 2025, `tailwindcss-animate` is deprecated. Use `tw-animate-css` instead:

**Installation:**
```bash
pnpm add tw-animate-css
```

**Update globals.css:**
```css
/* Remove: @plugin 'tailwindcss-animate'; */
/* Add: */ 
@import "tw-animate-css";
```

---

## Dark Mode with next-themes

**Installation:**
```bash
pnpm add next-themes
```

**Create Theme Provider:**
```tsx
// components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Update layout.tsx:**
```tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Create Theme Toggle:**
```tsx
// components/theme-toggle.tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

---

## Best Practices

### 1. Component Composition

```tsx
// ✅ Good: Compose small components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <form>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" />
        </div>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  </CardContent>
</Card>
```

### 2. Customizing Components

Since you own the code, modify directly in `src/components/ui/`:

```tsx
// button.tsx - customized
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // Add your custom variants
        brand: "bg-blue-600 text-white hover:bg-blue-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-7 rounded px-2 text-xs", // Added
      },
    },
  }
);
```

### 3. Responsive Design

```tsx
<Card className="w-full max-w-sm md:max-w-md lg:max-w-lg">
  <CardContent className="p-4 md:p-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input />
      <Input />
    </div>
  </CardContent>
</Card>
```

### 4. Loading States

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Loading card
<Card>
  <CardHeader>
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-3 w-1/2" />
  </CardHeader>
  <CardContent className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
  </CardContent>
</Card>
```

### 5. Forms with shadcn + React 19

```tsx
"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, null);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
            {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

## Common Component Recipes

### Dashboard Stat Card

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export function StatCard({ title, value, change, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {trend === "up" ? (
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}
```

### Data Table with shadcn

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {invoices.map((invoice) => (
      <TableRow key={invoice.id}>
        <TableCell className="font-medium">{invoice.name}</TableCell>
        <TableCell>
          <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
            {invoice.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right">${invoice.amount}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Recharts Documentation](https://recharts.org/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

## Quick Command Reference

```bash
# Add component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add card input label

# Add all components
npx shadcn@latest add --all

# Update components
npx shadcn@latest update

# Diff (see what changed in registry)
npx shadcn@latest diff
```

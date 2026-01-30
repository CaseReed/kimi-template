---
name: deployment-vercel
description: Vercel deployment, CI/CD, and production best practices for Next.js applications
license: MIT
compatibility: Next.js 16+, Vercel platform
---

# Vercel Deployment & Production

> **Deploy and manage Next.js applications on Vercel** — Environment variables, Edge Functions, analytics, and CI/CD workflows.

---

## Quick Reference

### Official Documentation
- **Vercel Docs**: https://vercel.com/docs
- **Project Configuration**: https://vercel.com/docs/project-configuration
- **Environment Variables**: https://vercel.com/docs/environment-variables
- **Custom Environments**: https://vercel.com/docs/deployments/custom-environments
- **Edge Config**: https://vercel.com/docs/edge-config
- **Function Runtimes**: https://vercel.com/docs/functions/runtimes
- **Limits**: https://vercel.com/docs/limits
- **Analytics**: https://vercel.com/docs/analytics/quickstart
- **Speed Insights**: https://vercel.com/docs/speed-insights/quickstart

### Common Commands

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login to Vercel
vercel login

# Deploy (preview)
vercel

# Deploy to production
vercel --prod

# Deploy to custom environment (Pro/Enterprise)
vercel --target=staging

# Pull environment variables for local development
vercel env pull

# Pull from custom environment
vercel env pull .env.staging --environment=staging

# Link project
vercel link

# Add environment variable to custom environment
vercel env add API_KEY staging
```

---

## Installation & Setup

### 1. Connect Git Repository

```bash
# Option 1: Via Vercel Dashboard (recommended)
# 1. Go to https://vercel.com/new
# 2. Import your Git repository
# 3. Configure build settings

# Option 2: Via CLI
vercel
```

### 2. Framework Detection

Vercel auto-detects Next.js and sets defaults:
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install` (detected from `pnpm-lock.yaml`)

---

## Core Patterns

### 1. Environment Variables

#### Overview
- Total limit: **64 KB** per deployment (Node.js runtime)
- Max **1000 environment variables** per environment per project
- Edge Functions/Middleware: **5 KB** per variable
- Encrypted at rest, visible to project members
- Changes apply only to **new deployments**

#### Variable Types

| Prefix | Exposed to Browser? | Use Case |
|--------|---------------------|----------|
| `NEXT_PUBLIC_` | ✅ Yes | Public API keys, feature flags |
| No prefix | ❌ No (server-only) | Database URLs, secrets, tokens |

#### Environment Targets

| Environment | Applied To | Plan |
|-------------|------------|------|
| `Production` | Production branch (usually `main`) | All |
| `Preview` | All non-production branches | All |
| `Development` | `vercel dev` and local development | All |
| Custom | Specific branches (e.g., `staging`) | Pro/Enterprise only |

> **Custom Environments** (Pro/Enterprise):
> - Pro: 1 custom environment per project
> - Enterprise: 12 custom environments per project
> - Can attach custom domains and branch tracking rules
> - Create via Dashboard: Project Settings → Environments → Create Environment

#### Configuration Methods

**Method 1: Dashboard** (UI-based)
```
Project Settings → Environment Variables → Add New
```

**Method 2: CLI**
```bash
# Add production variable
vercel env add DATABASE_URL production

# Add preview variable
vercel env add API_KEY preview

# Add development variable
vercel env add DEBUG development

# Pull all variables to .env file
vercel env pull .env.local
```

**⚠️ CRITICAL: Avoid Newline Characters with CLI**

When piping values to `vercel env add`, `echo` adds a trailing newline that corrupts the value:

```bash
# ❌ WRONG - echo adds \n (causes OAuth "invalid_client" errors)
echo "my-secret" | vercel env add API_KEY production
# Results in: "my-secret\n" -> URL-encoded as "my-secret%0A"

# ✅ CORRECT - use printf without \n
printf "my-secret" | vercel env add API_KEY production
# Results in: "my-secret" (clean)

# ✅ ALTERNATIVE - use echo -n (not portable on all systems)
echo -n "my-secret" | vercel env add API_KEY production
```

**Symptoms of newline corruption:**
- OAuth errors: `invalid_client`, `redirect_uri_mismatch`
- URL-encoded values: `%0A` in query parameters
- API authentication failures

**Method 3: `vercel.json`** (static config - NOT for secrets!)
```json
{
  "env": {
    "PUBLIC_API_URL": "https://api.example.com"
  }
}
```

> ⚠️ **NEVER** commit secrets to `vercel.json` — use Dashboard or CLI instead.

#### Access in Code

```typescript
// Server-side (safe)
const dbUrl = process.env.DATABASE_URL;

// Client-side (must use NEXT_PUBLIC_ prefix)
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
```

#### Local Development

```bash
# Create .env.local file
vercel env pull .env.local

# Or manually create .env.local
echo "DATABASE_URL=postgresql://localhost:5432/mydb" > .env.local
```

---

### 2. Vercel Configuration (`vercel.json`)

#### Static Configuration

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=60, stale-while-revalidate=300"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/external/:path*",
      "destination": "https://api.external.com/:path*"
    }
  ]
}
```

#### Programmatic Configuration (`vercel.ts`)

```typescript
// vercel.ts - runs at build time
import type { VercelConfig } from '@vercel/sdk';

const config: VercelConfig = {
  buildCommand: process.env.CI ? 'next build' : 'next dev',
  regions: process.env.VERCEL_ENV === 'production' 
    ? ['iad1'] 
    : ['iad1', 'sfo1'],
  headers: async () => {
    // Dynamic header generation
    return [
      {
        source: '/api/(.*)',
        headers: [
          { key: 'X-Custom-Header', value: await getDynamicValue() }
        ]
      }
    ];
  }
};

export default config;
```

#### Key Configuration Properties

| Property | Description | Example |
|----------|-------------|---------|
| `regions` | Deploy functions to specific regions | `["iad1", "fra1"]` |
| `functionFailoverRegions` | Failover regions | `["sfo1"]` |
| `headers` | Custom HTTP headers | See below |
| `redirects` | URL redirects | 301/302 redirects |
| `rewrites` | URL rewrites without redirects | Proxy to external API |
| `cleanUrls` | Remove `.html` extensions | `true` |
| `trailingSlash` | Add/remove trailing slashes | `true`/`false` |
| `images` | Image optimization config | See Image docs |

---

### 3. Edge Functions & Middleware

#### Middleware Pattern (`src/middleware.ts`)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Authentication check
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // A/B testing
  const variant = request.cookies.get('ab-variant')?.value || 'a';
  request.headers.set('x-ab-variant', variant);

  // Geolocation
  const country = request.geo?.country || 'US';
  request.headers.set('x-country', country);

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml).*)',
  ],
};
```

#### Edge Function with Edge Config

```typescript
// middleware.ts with Edge Config
import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Feature flag check (sub-15ms latency)
  const isMaintenanceMode = await get('maintenanceMode');
  
  if (isMaintenanceMode && request.nextUrl.pathname !== '/maintenance') {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // IP blocking
  const blockedIps = await get<string[]>('blockedIps') || [];
  const clientIp = request.ip || request.headers.get('x-forwarded-for');
  
  if (clientIp && blockedIps.includes(clientIp)) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  return NextResponse.next();
}
```

#### Edge Config Setup

```bash
# Install Edge Config client
pnpm add @vercel/edge-config
```

```typescript
// lib/edge-config.ts
import { createClient } from '@vercel/edge-config';

// Uses EDGE_CONFIG env variable automatically
export const edgeConfig = createClient(process.env.EDGE_CONFIG);

// Read values (P99 < 15ms)
export async function getFeatureFlag(key: string): Promise<boolean> {
  return (await edgeConfig.get(key)) ?? false;
}
```

> **Edge Config Limits**:
> - Hobby: 1 config, 64KB storage, 100 reads/day
> - Pro: 10 configs, larger storage limits
> - Enterprise: Unlimited configs
> - P99 read latency: < 15ms
> - Best for: Feature flags, A/B testing, critical redirects, IP blocking

---

### 4. Analytics & Speed Insights

#### Web Analytics

```bash
# Install package
pnpm add @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Enable in Dashboard:**
1. Project → Analytics tab → Enable
2. Routes added at `/_vercel/insights/*`
3. Custom events (Pro/Enterprise):

```typescript
import { track } from '@vercel/analytics';

// Track custom events
track('Purchase Completed', {
  product: 'Pro Plan',
  value: 29,
  currency: 'USD'
});
```

#### Speed Insights

```bash
# Install package
pnpm add @vercel/speed-insights
```

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Features tracked:**
- Core Web Vitals (LCP, FID/INP, CLS)
- TTFB, FCP
- Real User Monitoring (RUM)

---

### 5. Preview Deployments & Git Workflow

#### Automatic Deployments

| Git Action | Deployment Type |
|------------|-----------------|
| Push to `main` | Production |
| Push to any other branch | Preview |
| Pull Request | Preview (with PR comment) |
| Merge PR to `main` | Production |

#### Preview Deployment Features

```
URL format: https://<project>-<unique-hash>-<team>.vercel.app
```

**Benefits:**
- Unique URL per branch/commit
- Automatic `X-Robots-Tag: noindex` (SEO protection)
- Share button in Vercel Toolbar
- Comments for team feedback

#### Branch-Specific Environment Variables

```bash
# Add variable for specific branch
vercel env add API_URL preview
# Select: "staging" branch

# staging branch gets this value
# other preview branches get preview default
```

#### Custom Production Branch

```bash
# Change production branch (default: main)
vercel --prod
# Or: Project Settings → Git → Production Branch
```

#### Ignored Build Step

```bash
# vercel.json - skip builds for specific branches
{
  "ignoreCommand": "git log -1 --pretty=oneline --abbrev-commit | grep -w '[skip ci]'"
}
```

Or via Dashboard:
```
Project Settings → Git → Ignored Build Step
Command: git diff --quiet HEAD^ HEAD ./
```

#### Deploy Hooks

```bash
# Create deploy hook for external CI/CD
curl -X POST "https://api.vercel.com/v1/integrations/deploy/<project>/<token>"
```

---

## Common Pitfalls

### ❌ Exposing Secrets

```typescript
// ❌ WRONG - Secret exposed to client
const apiKey = process.env.SECRET_API_KEY; // In client component

// ✅ CORRECT - Use NEXT_PUBLIC_ only for public values
const publicKey = process.env.NEXT_PUBLIC_API_KEY;
```

### ❌ Wrong Environment Variable Scope

```bash
# ❌ Setting DATABASE_URL as NEXT_PUBLIC_
NEXT_PUBLIC_DATABASE_URL=postgresql://...  # NEVER DO THIS

# ✅ Keep server-only variables without prefix
DATABASE_URL=postgresql://...  # Server only
```

### ❌ Edge Config Size Limits

```typescript
// ❌ Storing large data in Edge Config
// Edge Config: Max 64KB per store (Hobby)
// Better: Use database or Redis for large datasets

// ✅ Use for small, frequently-read data
const featureFlags = await get('flags'); // Small JSON object
```

### ❌ Middleware Performance

```typescript
// ❌ Heavy operations in middleware
export async function middleware(request: NextRequest) {
  const data = await fetch('https://slow-api.com/data'); // Blocks all requests
  // ...
}

// ✅ Lightweight checks only
export async function middleware(request: NextRequest) {
  const isEnabled = await get('featureFlag'); // Edge Config: < 15ms
  // ...
}
```

### ❌ Not Using Preview Deployments

```bash
# ❌ Testing in production
vercel --prod  # For every test

# ✅ Use preview deployments
vercel  # Preview URL for testing
# Merge to main only when ready
```

### ❌ Environment Variable Caching

```typescript
// ❌ Changes not reflecting
// Changed env var in dashboard but old value persists

// ✅ Solution: Redeploy
vercel --prod  # New deployment picks up new env vars
```

### ❌ Function Cold Starts

```typescript
// ❌ Unexpected latency on first request after idle
// Functions are archived when not invoked

// ✅ Solutions:
// 1. Use Edge runtime for low-latency requirements
// 2. Configure proper warming for critical paths
// 3. Use Edge Config for sub-15ms reads instead of database calls
```

---

## Validation Checklist

### Pre-Deployment

- [ ] All secrets use **no prefix** (server-only)
- [ ] Public variables use `NEXT_PUBLIC_` prefix
- [ ] Environment variables set for Production, Preview, and Development
- [ ] Under 1000 environment variables per environment
- [ ] Total env var size under 64KB (5KB per var for Edge)
- [ ] `vercel.json` schema validated (IDE autocomplete working)
- [ ] Middleware matcher excludes static files
- [ ] Edge Config size within limits (64KB Hobby, larger Pro/Enterprise)

### Post-Deployment

- [ ] Preview deployment works correctly
- [ ] Production environment variables loaded
- [ ] Analytics receiving data (`/_vercel/insights/view` network request)
- [ ] Speed Insights tracking Web Vitals
- [ ] `X-Robots-Tag: noindex` on preview URLs
- [ ] Custom domains configured (if applicable)

### Security

- [ ] No secrets in `vercel.json`
- [ ] No secrets committed to Git
- [ ] `.env.local` in `.gitignore`
- [ ] Preview deployments require authentication (Pro/Enterprise)
- [ ] Branch protection rules on production branch

---

## Troubleshooting

### Deployment Fails

```bash
# Check build logs
vercel --debug

# Verify environment variables
vercel env ls

# Pull latest env vars
vercel env pull .env.local
```

### Environment Variables Not Loading

```bash
# Verify correct environment
vercel env ls  # Check Production vs Preview

# Redeploy after env var changes
vercel --prod
```

### Edge Config Not Working

```bash
# Verify EDGE_CONFIG env var is set
vercel env ls | grep EDGE_CONFIG

# Check Edge Config ID in dashboard
# Project → Edge Config
```

---

### 6. Function Runtimes & Limits

#### Supported Runtimes

| Runtime | Use Case | Max Duration |
|---------|----------|--------------|
| **Node.js** | Next.js, standard APIs | 5-300s (configurable) |
| **Edge** | Middleware, low-latency | 30s |
| **Bun** | Fast JavaScript runtime | 5-300s |
| **Python** | ML, data processing | 5-300s |
| **Go** | High-performance APIs | 5-300s |
| **Ruby** | Ruby apps | 5-300s |
| **Rust** | Maximum performance | 5-300s |

#### Function Configuration (`vercel.json`)

```json
{
  "functions": {
    "api/generate-image.ts": {
      "maxDuration": 300,
      "memory": 3008
    },
    "api/edge-handler.ts": {
      "runtime": "edge"
    }
  }
}
```

#### Key Limits

| Limit | Hobby | Pro | Enterprise |
|-------|-------|-----|------------|
| Max function duration | 60s | 300s | 900s |
| Memory | 1024 MB | 1024-3008 MB | Custom |
| Deployments/day | 100 | 6000 | Custom |
| Build time | 45 min | 45 min | Custom |
| Concurrent builds | 1 | 12 | Custom |
| Static files upload | 100 MB | 1 GB | Custom |

#### Function Behavior

- **Cold starts**: Functions are archived when not used; unarchiving adds ~1s latency
- **Filesystem**: Read-only with writable `/tmp` scratch space (500 MB)
- **Concurrency**: Auto-scales to 30,000 (Hobby/Pro) or 100,000+ (Enterprise)
- **Regions**: Deploy to 3 regions (Pro) or 18 (Enterprise)

---

## Related Skills

- `/skill:security-best-practices` — Security headers, CSP, auth
- `/skill:performance-optimization` — CWV, caching, PPR
- `/skill:nextjs-16-tailwind-4` — Next.js deployment patterns
- `/skill:git-workflow` — Git branching strategies

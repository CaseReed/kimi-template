# Project: my-app

## Project Overview

This is a **Next.js 16** web application using the **App Router** architecture. It's a modern React application with TypeScript and Tailwind CSS v4, created using `create-next-app`.

### Language Convention

> ⚠️ **Important Language Rule**:
> - **CLI Conversations**: French only (between you and me via Kimi CLI)
> - **All Other Content**: English only
>   - Code comments
>   - Documentation (README, AGENTS.md, etc.)
>   - Commit messages
>   - UI content and labels
>   - Skills documentation
>   - Any text in the codebase
> 
> Never sign commits as AI. Use the user's git identity.

### Critical Rules

#### 🛑 NEVER Commit or Push Without Explicit User Permission

**ALWAYS ask for user confirmation before:**
- `git commit` — Any commit operation
- `git push` — Any push operation (including `--force`, `--force-with-lease`)
- `git rebase` — When modifying shared history
- Automated commits via scripts or hooks

**Required confirmation format:**
```
"I'm ready to commit these changes. Should I proceed with committing and pushing?"
```

**Why this rule matters:**
- Prevents unintended commits with errors or debug code
- Protects against pushing breaking changes
- Avoids accidental commits of sensitive data
- Respects user's control over their repository

**Exception:** None. Always ask first.

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5.9.3 | Type safety |
| Tailwind CSS | 4.1.18 | Utility-first CSS |
| ESLint | 9.x | Linting |
| pnpm | - | Package manager |

### Key Features

- **App Router**: Uses Next.js 13+ App Router (`src/app/` directory)
- **Tailwind CSS v4**: Latest version with `@theme` directive for custom theming
- **Geist Font**: Vercel's Geist font family (Sans + Mono) loaded via `next/font/google`
- **Path Aliases**: `@/*` maps to `./src/*` for clean imports
- **Strict TypeScript**: Strict mode enabled with bundler module resolution

---

## Project Structure

```
my-app/
├── src/
│   └── app/                    # App Router directory
│       ├── layout.tsx          # Root layout with fonts & metadata
│       ├── page.tsx            # Home page (landing)
│       ├── globals.css         # Global styles + Tailwind theme
│       ├── page.module.css     # CSS Module for page (legacy styles)
│       └── favicon.ico         # Site favicon
├── public/                     # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── package.json                # Dependencies & scripts
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── eslint.config.mjs           # ESLint flat config
├── postcss.config.mjs          # PostCSS config (Tailwind)
├── .gitignore                  # Git ignore rules
├── .npmrc                      # pnpm configuration
└── pnpm-lock.yaml              # Lock file
```

---

## Build and Development Commands

All commands use `pnpm` as the package manager:

```bash
# Development server (http://localhost:3000)
pnpm dev

# Production build
pnpm build

# Start production server (after build)
pnpm start

# Run ESLint
pnpm lint

# Clean Next.js cache only
pnpm clean:cache

# Full clean: remove node_modules, .next, lock file, and reinstall
pnpm clean

# Update packages to latest versions
pnpm update:latest

# Update packages (semver compatible)
pnpm update
```

---

## Code Style Guidelines

### TypeScript Configuration

- **Target**: ES2017
- **Strict Mode**: Enabled (`"strict": true`)
- **Module**: ESNext with bundler resolution
- **JSX**: `react-jsx` transform
- **Incremental**: Enabled for faster builds

### Path Aliases

Use `@/*` for imports from the `src/` directory:

```typescript
// ✅ Good
import { MyComponent } from "@/components/MyComponent";

// ❌ Avoid
import { MyComponent } from "../../components/MyComponent";
```

### Tailwind CSS v4 Conventions

Global styles are defined in `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  /* Custom theme variables */
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
}
```

- Use Tailwind utility classes directly in JSX (no `@apply` needed)
- Custom colors available via `bg-primary`, `text-secondary`, etc.
- The project uses Tailwind v4's new `@theme` directive instead of the old `tailwind.config.js`

### Font Usage

The Geist font family is configured in `layout.tsx`:

```typescript
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

Apply fonts via CSS variables:
```css
font-family: var(--font-geist-sans);
font-family: var(--font-geist-mono);
```

---

## Testing Instructions

**Note**: This project does not currently have a testing framework configured.

**Recommended Setup** (use `/skill:testing-vitest`):
```bash
# Vitest + React Testing Library (modern, fast)
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

See `.agents/skills/testing-vitest/` for:
- Test patterns for React 19 Server Components
- Mock and spy examples
- Async testing patterns
- Component testing best practices

**Alternative Options:**
- **Playwright** or **Cypress** for E2E tests
- **Jest** if you prefer the older ecosystem

---

## Security Considerations

### Environment Variables

- Environment files (`.env*`) are gitignored by default
- Use `.env.local` for local secrets (never commit)
- Use `.env` for non-sensitive defaults
- Next.js exposes only `NEXT_PUBLIC_*` variables to the browser

### ESLint Security

The project uses `eslint-config-next` which includes:
- React hooks rules
- TypeScript rules
- Next.js specific best practices

### Dependencies

- pnpm's `strict-peer-dependencies=false` allows more flexible dependency resolution
- Regular updates via `pnpm update:latest` recommended for security patches

---

## Deployment

### Vercel (Recommended)

This project is optimized for Vercel deployment.

**Quick deploy:**
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy (preview)
vercel

# Deploy to production
vercel --prod
```

**For detailed configuration**, see `/skill:deployment-vercel`:
- Environment variables (`NEXT_PUBLIC_*` vs secrets)
- `vercel.json` configuration
- Edge Functions & Middleware
- Analytics & Speed Insights
- Preview deployments workflow

### Docker Deployment

No Dockerfile is present. To containerize, create:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Build Output

- Static files: `.next/static/`
- Server build: `.next/server/`
- Output: `out/` (if static export configured)

---

## Development Notes

### Language Convention

See [Language Convention](#language-convention) in Project Overview above.

- **CLI Conversations**: French only
- **Everything else**: English only (UI, docs, comments, commits)

### Common Tasks

**Adding a new page:**
```bash
# Create src/app/about/page.tsx
export default function AboutPage() {
  return <div>About</div>;
}
```

**Adding a component:**
```bash
# Create src/components/Button.tsx
# Import with: import { Button } from "@/components/Button";
```

**Adding API routes:**
```bash
# Create src/app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: "Hello!" });
}
```

---

## Kimi Skills Reference

This project has **22 specialized skills** in `.agents/skills/` to help with development tasks:

### Planning & Coordination

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `/skill:plan-master` | Systematic planning methodology | Before starting complex features |
| `/skill:subagent-tasker` | Best practices for subagent tasks | When decomposing work into parallel tasks |
| `/skill:skill-creator` | **Mandatory process for creating skills** | **ALWAYS use before creating any skill** |

### Technical Skills

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `/skill:nextjs-16-tailwind-4` | Next.js 16 + Tailwind 4 + React 19 patterns | Any UI/component work |
| `/skill:nextjs-seo` | SEO optimization - metadata, OG, sitemap, JSON-LD | Adding SEO, social sharing, structured data |
| `/skill:shadcn-ui` | shadcn/ui components + Charts (recharts) | UI components, dashboards, data viz |
| `/skill:next-intl-i18n` | next-intl internationalization (i18n) | Multi-language apps, translations |
| `/skill:motion-animations` | Motion (Framer Motion) animations | Page transitions, gestures, scroll effects |
| `/skill:tanstack-query` | TanStack Query for data fetching | Client-side data, caching, mutations |
| `/skill:next-api-routes` | API Routes & Server Actions | Creating endpoints or actions |
| `/skill:forms-master` | Forms with React 19 + Zod + Server Actions | Building any form |
| `/skill:zustand-state` | Zustand state management | Global state, cart, auth |
| `/skill:security-best-practices` | Security best practices | Headers, XSS, CSRF, auth security |
| `/skill:react-custom-hooks` | Custom hooks patterns | Building reusable hooks |
| `/skill:testing-vitest` | Testing with Vitest + RTL | Writing tests |
| `/skill:accessibility-a11y` | A11y best practices | Making components accessible |
| `/skill:component-generator` | Component boilerplate | Generating new components |
| `/skill:migration-refactor` | Safe refactoring patterns | Refactoring existing code |
| `/skill:git-workflow` | Git best practices: commits, branches, PRs | Any git operations |
| `/skill:performance-optimization` | Next.js 16 + React 19 performance patterns | CWV, PPR, React Compiler, lazy loading |
| `/skill:deployment-vercel` | Vercel deployment, CI/CD, Edge Functions | Deploying to production, env vars, preview |
| `/skill:source-of-truth` | **Official documentation reference** | When stuck, in doubt, or adding deps |
| `/skill:post-review` | **Post-implementation code review** | **After EVERY feature implementation** |

### Development Workflow

**For Complex Features:**
```
1. /skill:plan-master → Create detailed plan
2. Validate plan with user
3. /skill:subagent-tasker → Decompose into subagent tasks
4. Execute with specialized skills
5. /skill:post-review → Systematic code review
6. Fix issues & validate
```

**For Simple Tasks:**
```
Direct execution with appropriate skill:
- New component → /skill:component-generator
- New hook → /skill:react-custom-hooks
- New API → /skill:next-api-routes

⚠️ ALWAYS end with /skill:post-review before marking complete!
```

**Golden Rule**: Never mark a feature as "done" without running `/skill:post-review`.

---

### Troubleshooting

- **Cache issues**: Run `pnpm clean:cache` or `pnpm clean`
- **Type errors**: Ensure `next-env.d.ts` exists (auto-generated)
- **Module resolution**: Check `tsconfig.json` paths configuration
- **Skill not found**: Check `.agents/skills/` directory exists

---

## Lessons Learned from Dashboard Implementation

The following issues were encountered and resolved during the dashboard implementation. Refer to these when working on similar features:

### React 19 useOptimistic Requires startTransition

When using `useOptimistic`, always wrap `addOptimistic` calls in `startTransition`:
```tsx
const [, startOptimisticUpdate] = useTransition();

startOptimisticUpdate(() => {
  addOptimisticUpdate({ id, newStatus });
});
```

### Pagination Loading State with placeholderData

With `placeholderData: (previousData) => previousData`, `isFetching` becomes false immediately. Use local state with minimum delay:
```tsx
const [isNavigating, setIsNavigating] = useState(false);

useEffect(() => {
  if (!isFetching && isNavigating) {
    const timeout = setTimeout(() => setIsNavigating(false), 300);
    return () => clearTimeout(timeout);
  }
}, [isFetching, isNavigating]);
```

### Individual Mutation States

Instead of using global `isFetching` that disables all buttons, track individual item states:
```tsx
const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
<button disabled={pendingIds.has(item.id)}>
```

### Motion Animations in Tables

Never use `motion.div` inside `<tbody>`. Use `motion.tr` directly:
```tsx
<tbody>
  {rows.map(row => (
    <motion.tr key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <td>{row.name}</td>
    </motion.tr>
  ))}
</tbody>
```

### Tailwind CSS v4 Cursor Pointer

Tailwind v4 changed default button cursor. Add to `globals.css`:
```css
@layer base {
  button:not([disabled]),
  [role="button"]:not([disabled]) {
    cursor: pointer;
  }
}
```

### AnimatePresence Requires Key

Always provide a `key` prop when using AnimatePresence:
```tsx
<AnimatePresence>
  {show && (
    <motion.div key="unique-key" exit={{ opacity: 0 }}>
      Content
    </motion.div>
  )}
</AnimatePresence>
```

---

## Lessons Learned from i18n Implementation

### next-intl ICU MessageFormat Syntax

**⚠️ CRITICAL**: next-intl uses ICU MessageFormat with **single braces**, NOT double braces:

```json
// ❌ WRONG - Double braces
{
  "greeting": "Hello {{name}}",
  "stats": "Page {{current}} of {{total}}"
}

// ✅ CORRECT - Single braces  
{
  "greeting": "Hello {name}",
  "stats": "Page {current} of {total}"
}
```

**Common Error:**
```
INVALID_MESSAGE: MALFORMED_ARGUMENT (Positive trend of {{value}}%)
```

**Usage in components:**
```tsx
const t = useTranslations('dashboard');

// ❌ Won't work with double braces in JSON
t('trendPositive', { value: formattedChange });

// ✅ Works with single braces in JSON
// JSON: "trendPositive": "Positive trend of {value}%"
```

### next-intl Hook Rules

Always use the correct hooks from next-intl:
- **`useLocale()`** - To get current locale (not `useTranslations('language')`)
- **`useTranslations(namespace)`** - For translations
- **`useRouter()` from `@/i18n/routing`** - For locale-aware navigation

```tsx
// ❌ WRONG - Hacky way to detect locale
const locale = useTranslations('language.switcher');
const currentLocale = locale('en') === 'Anglais' ? 'fr' : 'en';

// ✅ CORRECT - Use dedicated hook
const currentLocale = useLocale();
```

### Locale-Aware Formatting

Always use dynamic locale for `Intl` formatters to avoid hydration mismatches:

```tsx
// ❌ WRONG - Hardcoded locale
new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

// ✅ CORRECT - Dynamic locale
const locale = useLocale();
new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { 
  style: 'currency', 
  currency: 'EUR' 
})
```

### Next.js 16: Use `proxy.ts` not `middleware.ts`

Starting with Next.js 16, the i18n routing file must be named **`proxy.ts`** (previously `middleware.ts`):

```typescript
// proxy.ts (root of project)
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(en|fr)/:path*"],
};
```

### Static Message Imports for Client-Side Navigation

When using `router.push(pathname, { locale })` to change language **without page refresh**, avoid dynamic imports in the layout. Use static imports instead:

```tsx
// ✅ CORRECT - Static imports work with client-side navigation
import enMessages from "../../../i18n/messages/en.json";
import frMessages from "../../../i18n/messages/fr.json";

const messagesByLocale = { en: enMessages, fr: frMessages };

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  // Load messages statically (not via dynamic import)
  const messages = messagesByLocale[locale];
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

### Server Components: Use Explicit Locale

Server Components using `useTranslations()` without async/await may get wrong locale. Use `getTranslations({ locale, namespace })`:

```tsx
// ❌ WRONG - May get wrong locale in Server Components
export default function Page() {
  const t = useTranslations("home");  // Uses context, may be undefined
  return <h1>{t("title")}</h1>;
}

// ✅ CORRECT - Explicit locale ensures correct translations
export default async function Page({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return <h1>{t("title")}</h1>;
}
```

### Language Switcher Without Page Refresh

Use `router.push(pathname, { locale })` from `@/i18n/routing` for seamless locale switching:

```tsx
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // ✅ Navigate without full page reload
    router.push(pathname, { locale: newLocale });
  };

  return (
    <select value={locale} onChange={(e) => handleLocaleChange(e.target.value)}>
      <option value="en">English</option>
      <option value="fr">Français</option>
    </select>
  );
}
```

---

## Skills Audit & Maintenance

Skills are periodically audited against official documentation to ensure accuracy.

### Master Document
**📋 Single Source of Truth**: `.agents/skills/SKILL_AUDIT_MASTER.md`

This document contains:
- Complete audit history
- Current status of all skills
- Implementation progress
- Phase planning

### Quick Status

| Skill | Status | Last Updated |
|-------|--------|--------------|
| shadcn-ui | ✅ Updated | 2026-01-28 |
| zustand-state | ✅ Updated | 2026-01-28 |
| tanstack-query | ✅ Updated | 2026-01-28 |
| nextjs-16-tailwind-4 | ✅ Updated | 2026-01-28 |
| forms-master | ✅ Updated | 2026-01-28 |
| motion-animations | ✅ Updated | 2026-01-28 |

**All 6 skills are up to date! 🎉**

### How to Audit

```bash
# Request a new audit
"Audit all skills against official documentation"
```

See `SKILL_AUDIT_MASTER.md` for detailed findings and implementation plans.

---

### Audit Process

To maintain skill quality, run this audit process:

1. **Schedule**: Audit skills quarterly or when major versions release
2. **Subagents**: Spawn parallel subagents for each skill with online documentation
3. **Comparison**: Compare local skill content against official docs
4. **Documentation**: Update AGENTS.md with findings (this section)
5. **Updates**: Create tickets/tasks to update outdated skills
6. **Verification**: Re-audit after updates to confirm fixes

**Command to run audit:**
```
Request: "Audit all skills against official documentation"
```

---

### Skill Creation Maintenance

When creating a new skill, update the following files **if applicable**:

| File | When to Update | What to Update |
|------|---------------|----------------|
| `AGENTS.md` | **Always** | Skill count, skill list table, relevant sections |
| `source-of-truth/SKILL.md` | **Always** | Official documentation links for new technologies |
| `README.md` | **If needed** | If the skill introduces major features users should know about |

**Example:** Creating `deployment-vercel` skill
- ✅ `AGENTS.md` — Updated skill count (21→22) and added to table
- ✅ `source-of-truth/SKILL.md` — Added Vercel docs links
- ❌ `README.md` — Not needed (deployment is internal tooling)

**Example:** Creating `stripe-payments` skill  
- ✅ `AGENTS.md` — Updated count and table
- ✅ `source-of-truth/SKILL.md` — Added Stripe docs
- ✅ `README.md` — **Updated** if Stripe integration is a core project feature

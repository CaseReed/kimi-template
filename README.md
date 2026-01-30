# 🚀 Kimi k2.5 Template

> **Demo template for Kimi k2.5** — A modern Next.js 16 project optimized for AI-assisted development with a comprehensive collection of specialized skills.

---

## ✨ About

This project is a **demo/template specifically designed for Kimi k2.5**, showcasing:

- 🤖 **Optimal integration with Kimi k2.5** via a structured skill system
- 🏗️ **A modern tech stack** (Next.js 16, React 19, Tailwind CSS 4)
- 📚 **30 specialized skills** to accelerate development
- 🎯 **Patterns and best practices** validated for React 19 and Next.js App Router

---

## 🛠️ Tech Stack

| Technology | Version | Description |
|------------|---------|-------------|
| **Next.js** | 16.1.6 | React framework with App Router |
| **React** | 19.2.3 | UI library with Server Components |
| **TypeScript** | 5.9.3 | Strict type safety |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS with `@theme` |
| **Geist Font** | latest | Vercel font family (Sans + Mono) |
| **pnpm** | - | Fast package manager |

### UI & Data Libraries

- **[shadcn/ui](https://ui.shadcn.com)** — Radix UI components + Tailwind
- **[TanStack Query](https://tanstack.com/query)** — Data fetching and caching
- **[Motion (Framer Motion)](https://motion.dev)** — React animations
- **[Zustand](https://github.com/pmndrs/zustand)** — Lightweight state management
- **[Recharts](https://recharts.org)** — Data visualization
- **[Zod](https://zod.dev)** — TypeScript schema validation

---

## 🎓 Kimi Skills (30 Specializations)

The project includes **30 specialized skills** in `.agents/skills/` to guide Kimi k2.5:

### 🎯 Planning & Architecture
| Skill | Description |
|-------|-------------|
| [`plan-master`](.agents/skills/plan-master/SKILL.md) | Systematic planning methodology |
| [`subagent-tasker`](.agents/skills/subagent-tasker/SKILL.md) | Best practices for parallel tasks |
| [`post-review`](.agents/skills/post-review/SKILL.md) | Systematic post-implementation code review |

### 🏗️ Frontend Development
| Skill | Description |
|-------|-------------|
| [`nextjs-16-tailwind-4`](.agents/skills/nextjs-16-tailwind-4/SKILL.md) | Next.js 16 + Tailwind 4 + React 19 patterns |
| [`shadcn-ui`](.agents/skills/shadcn-ui/SKILL.md) | shadcn/ui components and Charts |
| [`frontend-design`](.agents/skills/frontend-design/SKILL.md) | Distinctive, production-grade UI design |
| [`motion-animations`](.agents/skills/motion-animations/SKILL.md) | Motion (Framer Motion) animations |
| [`component-generator`](.agents/skills/component-generator/SKILL.md) | React component generator |
| [`next-intl-i18n`](.agents/skills/next-intl-i18n/SKILL.md) | Internationalization (i18n) |
| [`forms-master`](.agents/skills/forms-master/SKILL.md) | Forms with React 19 + Zod + Server Actions |

### 🔄 Data & State Management
| Skill | Description |
|-------|-------------|
| [`tanstack-query`](.agents/skills/tanstack-query/SKILL.md) | Data fetching with TanStack Query |
| [`zustand-state`](.agents/skills/zustand-state/SKILL.md) | State management with Zustand |
| [`drizzle-orm`](.agents/skills/drizzle-orm/SKILL.md) | Drizzle ORM + Neon PostgreSQL |
| [`neon-postgresql`](.agents/skills/neon-postgresql/SKILL.md) | Neon PostgreSQL serverless database |
| [`react-custom-hooks`](.agents/skills/react-custom-hooks/SKILL.md) | Custom React hooks |

### 🔧 Backend & API
| Skill | Description |
|-------|-------------|
| [`next-api-routes`](.agents/skills/next-api-routes/SKILL.md) | API Routes & Server Actions |
| [`better-auth`](.agents/skills/better-auth/SKILL.md) | Authentication with Better Auth |

### ✅ Quality & Security
| Skill | Description |
|-------|-------------|
| [`testing-vitest`](.agents/skills/testing-vitest/SKILL.md) | Testing with Vitest + React Testing Library |
| [`accessibility-a11y`](.agents/skills/accessibility-a11y/SKILL.md) | Web accessibility (a11y) |
| [`security-best-practices`](.agents/skills/security-best-practices/SKILL.md) | Security best practices |
| [`git-workflow`](.agents/skills/git-workflow/SKILL.md) | Git best practices (commits, branches, PRs) |
| [`source-of-truth`](.agents/skills/source-of-truth/SKILL.md) | Official documentation reference |
| [`migration-refactor`](.agents/skills/migration-refactor/SKILL.md) | Refactoring and migrations |
| [`deployment-vercel`](.agents/skills/deployment-vercel/SKILL.md) | Vercel deployment |
| [`docker-deployment`](.agents/skills/docker-deployment/SKILL.md) | Docker containerization |
| [`nextjs-seo`](.agents/skills/nextjs-seo/SKILL.md) | SEO optimization (metadata, OG, sitemap) |
| [`performance-optimization`](.agents/skills/performance-optimization/SKILL.md) | Performance & Core Web Vitals |
| [`vercel-react-best-practices`](.agents/skills/vercel-react-best-practices/SKILL.md) | React & Next.js best practices (Vercel) |

---

## 📁 Project Structure

```
kimi-template/
├── .agents/
│   └── skills/                 # 🎓 Kimi Skills (30 specializations)
│       ├── SKILL_AUDIT_MASTER.md
│       ├── plan-master/
│       ├── nextjs-16-tailwind-4/
│       ├── shadcn-ui/
│       ├── tanstack-query/
│       ├── motion-animations/
│       └── ...
│
├── src/
│   ├── app/                    # 📱 Next.js App Router
│   │   ├── layout.tsx          # Root layout with fonts & metadata
│   │   ├── page.tsx            # Home page
│   │   ├── dashboard/          # Example: Dashboard page
│   │   │   └── page.tsx
│   │   ├── globals.css         # Global styles + Tailwind theme
│   │   └── favicon.ico
│   │
│   ├── components/             # 🧩 React Components
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── chart.tsx
│   │   │   └── ...
│   │   ├── animations/         # Motion animation components
│   │   │   ├── fade-in.tsx
│   │   │   ├── card-hover.tsx
│   │   │   └── ...
│   │   ├── dashboard/          # Dashboard business components
│   │   │   ├── stats-grid.tsx
│   │   │   ├── revenue-chart.tsx
│   │   │   └── ...
│   │   └── providers/          # React Providers
│   │       └── query-provider.tsx
│   │
│   ├── hooks/                  # 🎣 Custom hooks
│   │   └── use-dashboard.ts
│   │
│   └── lib/                    # 📚 Utilities and config
│       ├── utils.ts            # Utility functions (cn, etc.)
│       ├── query-client.ts     # TanStack Query config
│       ├── query-keys.ts       # Query keys
│       ├── api/                # API clients
│       │   └── dashboard.ts
│       └── types/              # TypeScript types
│           └── dashboard.ts
│
├── public/                     # 📦 Static assets
├── package.json                # Dependencies
├── next.config.ts              # Next.js config
├── tsconfig.json               # TypeScript config
├── eslint.config.mjs           # ESLint config
└── AGENTS.md                   # 📖 Complete agent documentation
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended)

### Installation

```bash
# Clone the repo
git clone https://github.com/CaseReed/kimi-template.git
cd kimi-template

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

### Available Scripts

```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
pnpm clean        # Full cleanup (node_modules, .next, etc.)
```

---

## 🔐 Authentication

The project includes a **complete authentication system** powered by [Better Auth](https://better-auth.com):

- 🔑 **Email/Password** authentication with secure session management
- 🔐 **OAuth providers** (GitHub, Google) - configurable
- 🛡️ **Protected routes** with Server Components
- 📧 **Session management** with HTTP-only cookies
- 🌍 **i18n support** for login/register pages

### Quick Start Auth

```bash
# 1. Start PostgreSQL database
docker-compose -f docker-compose.db.yml up -d

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. Run migrations
pnpm db:push

# 4. Create admin user
pnpm db:seed:admin

# 5. Start the app
pnpm dev
```

### Configure OAuth Providers

See **[OAUTH_SETUP.md](OAUTH_SETUP.md)** for detailed instructions on configuring GitHub and Google OAuth.

---

## 🎨 Example: Included Dashboard

The project includes a **complete Dashboard page** (`/dashboard`) demonstrating:

- 📊 **Charts** with Recharts (revenue, categories)
- 📈 **Statistics** with Motion animations
- 📋 **Transaction table** with pagination
- 🔄 **Data fetching** with TanStack Query
- 🎯 **Optimistic UI** with React 19

Perfect for understanding how skills integrate in a real-world case!

---

## 📝 How to Use Skills

In Kimi k2.5, use skills with the `/skill:skill-name` syntax:

```
# Examples:
/skill:plan-master          # To plan a complex feature
/skill:component-generator  # To generate a new component
/skill:shadcn-ui           # To add UI components
/skill:tanstack-query      # To implement data fetching
/skill:forms-master        # To create a form
/skill:post-review         # To review code after implementation
```

> 💡 **Golden Rule**: Always end with `/skill:post-review` before marking a feature as complete!

---

## 📖 Documentation

- **[AGENTS.md](AGENTS.md)** — Complete project documentation for agents
- **[SKILL_AUDIT_MASTER.md](.agents/skills/SKILL_AUDIT_MASTER.md)** — Skills audit and status
- **Individual skills** — See `.agents/skills/<skill-name>/SKILL.md`

---

## 🔐 Security

- Environment variables: use `.env.local` (never committed)
- Only `NEXT_PUBLIC_*` variables are exposed to the client
- ESLint includes React and Next.js security rules

---

## 📄 License

MIT — Free to use for your own projects.

---

<p align="center">
  Built with ❤️ for <strong>Kimi k2.5</strong>
</p>

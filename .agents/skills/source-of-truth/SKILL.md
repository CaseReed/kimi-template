# Source of Truth

> **Central reference for all official documentation** — When in doubt, check the source.

---

## 🎯 Purpose

This skill serves as the **single source of truth** for all official documentation links used in this project. 

### When to Use This Skill

- ❓ **You don't know something** — Check the official docs first
- 🐛 **Bug persists after 2 attempts** — Verify against official documentation
- 📦 **Adding new dependency/skill** — Update this document with official links
- 🔍 **Need to verify API usage** — Reference the authoritative source
- 📝 **See conflicting information** — Trust the official docs linked here

### Golden Rule

> **After 2 failed attempts to fix a bug → CHECK THIS SKILL → Consult official docs**

---

## 📚 Official Documentation

### Core Framework

| Technology | Official Docs | Version | Notes |
|------------|--------------|---------|-------|
| **Next.js** | https://nextjs.org/docs | 16.1.6 | App Router architecture |
| **React** | https://react.dev | 19.2.3 | Server Components, use hooks |
| **TypeScript** | https://www.typescriptlang.org/docs | 5.9.3 | Strict mode enabled |

### Styling & UI

| Technology | Official Docs | Version | Notes |
|------------|--------------|---------|-------|
| **Tailwind CSS** | https://tailwindcss.com/docs | 4.1.18 | `@theme` directive |
| **shadcn/ui** | https://ui.shadcn.com/docs | latest | Radix + Tailwind |
| **Radix UI** | https://www.radix-ui.com/primitives/docs | latest | Headless components |
| **Lucide Icons** | https://lucide.dev/icons | latest | Icon library |

### State Management & Data

| Technology | Official Docs | Version | Notes |
|------------|--------------|---------|-------|
| **TanStack Query** | https://tanstack.com/query/latest/docs | v5 | React Query, caching |
| **Zustand** | https://docs.pmnd.rs/zustand | v5 | Lightweight state |

### Internationalization (i18n)

| Technology | Official Docs | Version | Notes |
|------------|--------------|---------|-------|
| **next-intl** | https://next-intl.dev | v4 | Next.js i18n with App Router (ICU syntax: `{var}` not `{{var}}`)

### SEO

| Technology | Official Docs | Version | Notes |
|------------|--------------|---------|-------|
| **Next.js Metadata** | https://nextjs.org/docs/app/building-your-application/optimizing/metadata | 16+ | File-based metadata, OG images, sitemap |
| **Schema.org** | https://schema.org/ | latest | JSON-LD structured data |
| **Open Graph** | https://ogp.me/ | latest | Social sharing protocol |

### Animation

| Technology | Official Docs | Version | Notes |
|------------|--------------|---------|-------|
| **Motion** | https://motion.dev | latest | Framer Motion successor |

### Forms & Validation

| Technology | Official Docs | Version | Notes |
|------------|--------------|---------|-------|
| **Zod** | https://zod.dev | v3 | Schema validation |
| **React Hook Form** | https://react-hook-form.com/docs | v7 | Form management |

### Charts

| Technology | Official Docs | Version | Notes |
|------------|--------------|---------|-------|
| **Recharts** | https://recharts.org/en-US/api | v2 | Composable charts |

### Testing

| Technology | Official Docs | Version | Notes |
|------------|--------------|---------|-------|
| **Vitest** | https://vitest.dev/guide | v2 | Unit testing |
| **React Testing Library** | https://testing-library.com/docs/react-testing-library/intro | v16 | Component testing |

### Build Tools

| Technology | Official Docs | Notes |
|------------|--------------|-------|
| **pnpm** | https://pnpm.io/installation | Package manager |
| **ESLint** | https://eslint.org/docs/latest | Linting |

---

## 🔍 Troubleshooting Guide

### Common Issues & Official Solutions

#### Next.js App Router

| Issue | Check This |
|-------|-----------|
| Server Component errors | https://react.dev/reference/react/use-server |
| Caching behavior | https://nextjs.org/docs/app/building-your-application/caching |
| Route handlers | https://nextjs.org/docs/app/api-reference/file-conventions/route |

#### React 19

| Issue | Check This |
|-------|-----------|
| useOptimistic hook | https://react.dev/reference/react/useOptimistic |
| use() hook | https://react.dev/reference/react/use |
| Server Actions | https://react.dev/reference/react/use-server |

#### Tailwind CSS 4

| Issue | Check This |
|-------|-----------|
| @theme directive | https://tailwindcss.com/docs/theme |
| CSS import | https://tailwindcss.com/docs/upgrade-guide |

#### TypeScript

| Issue | Check This |
|-------|-----------|
| Strict config | https://www.typescriptlang.org/tsconfig#strict |
| Path aliases | https://www.typescriptlang.org/tsconfig#paths |

---

## 📝 Maintenance Rules

### Adding a New Dependency

When adding a new package or skill, **ALWAYS**:

1. Add the official documentation link to this file
2. Include the version being used
3. Add any relevant notes or gotchas
4. Update the count in AGENTS.md and README.md

### Template for New Entry

```markdown
| **Package Name** | https://official-docs-link | version | brief notes |
```

### Before Marking a Task Complete

- [ ] Checked official docs for any breaking changes?
- [ ] Verified API usage against latest documentation?
- [ ] Updated this file if new links needed?

---

## 🐛 Bug Resolution Protocol

```
Attempt #1 → Try to fix with knowledge
     ↓
Attempt #2 → Try alternative approach
     ↓
STILL FAILS
     ↓
CHECK /skill:source-of-truth
     ↓
Consult official documentation
     ↓
Verify against current version
     ↓
Fix with authoritative source
```

---

## 🔗 Quick Links by Category

### Getting Started
- Next.js Quick Start: https://nextjs.org/docs/getting-started/installation
- React Quick Start: https://react.dev/learn/thinking-in-react
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html

### Component Patterns
- shadcn/ui Components: https://ui.shadcn.com/docs/components
- Radix Primitives: https://www.radix-ui.com/primitives/docs/overview/introduction
- React Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components

### Data Fetching
- TanStack Query React: https://tanstack.com/query/latest/docs/framework/react/overview
- Next.js Data Fetching: https://nextjs.org/docs/app/building-your-application/data-fetching

### Styling
- Tailwind CSS Utility Classes: https://tailwindcss.com/docs/utility-first
- Tailwind CSS Customization: https://tailwindcss.com/docs/theme

### Forms
- Zod Schema Validation: https://zod.dev/?id=basic-usage
- Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions

---

## ⚠️ Version Mismatch Protocol

If you discover the project uses a different version than documented:

1. **Check** the actual version in `package.json`
2. **Verify** the official docs for that specific version
3. **Update** this document with correct version and links
4. **Report** if significant breaking changes are found

---

## 📊 Skills Documentation Links

| Skill | Documentation |
|-------|--------------|
| plan-master | `.agents/skills/plan-master/SKILL.md` |
| subagent-tasker | `.agents/skills/subagent-tasker/SKILL.md` |
| nextjs-16-tailwind-4 | `.agents/skills/nextjs-16-tailwind-4/SKILL.md` |
| shadcn-ui | `.agents/skills/shadcn-ui/SKILL.md` |
| tanstack-query | `.agents/skills/tanstack-query/SKILL.md` |
| motion-animations | `.agents/skills/motion-animations/SKILL.md` |
| forms-master | `.agents/skills/forms-master/SKILL.md` |
| zustand-state | `.agents/skills/zustand-state/SKILL.md` |
| next-api-routes | `.agents/skills/next-api-routes/SKILL.md` |
| testing-vitest | `.agents/skills/testing-vitest/SKILL.md` |
| accessibility-a11y | `.agents/skills/accessibility-a11y/SKILL.md` |
| security-best-practices | `.agents/skills/security-best-practices/SKILL.md` |
| react-custom-hooks | `.agents/skills/react-custom-hooks/SKILL.md` |
| component-generator | `.agents/skills/component-generator/SKILL.md` |
| migration-refactor | `.agents/skills/migration-refactor/SKILL.md` |
| git-workflow | `.agents/skills/git-workflow/SKILL.md` |
| post-review | `.agents/skills/post-review/SKILL.md` |
| **source-of-truth** | `.agents/skills/source-of-truth/SKILL.md` |
| **next-intl-i18n** | `.agents/skills/next-intl-i18n/SKILL.md` |
| **skill-creator** | `.agents/skills/skill-creator/SKILL.md` |

---

## ⚠️ Critical Rules

### NEVER Commit or Push Without User Permission

> **🛑 BEFORE ANY `git commit` or `git push`:**
> 
> **ALWAYS ask user for explicit confirmation**
> 
> Example: *"I'm ready to commit these changes. Should I proceed with committing and pushing?"*

This rule protects against:
- Unintended commits with errors or debug code
- Pushing breaking changes to production
- Committing sensitive data accidentally
- Force pushes that could lose work

**Applies to ALL git operations:**
- `git commit`
- `git push` (including `--force`, `--force-with-lease`)
- `git rebase` that modifies shared history
- Any automated commit/push via scripts

---

## 🎯 Checklist for AI Assistant

Before implementing a feature:

- [ ] Consulted relevant official documentation?
- [ ] Checked for version compatibility?
- [ ] Verified API signatures?
- [ ] Reviewed breaking changes?

When stuck on a bug:

- [ ] Attempted fix #1?
- [ ] Attempted fix #2?
- [ ] Checked `/skill:source-of-truth`?
- [ ] Consulted official docs?
- [ ] Verified against current versions?

After adding dependency:

- [ ] Added to this document?
- [ ] Included version number?
- [ ] Added relevant links?
- [ ] Updated README/AGENTS.md counts?

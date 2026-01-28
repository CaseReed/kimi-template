# 🚀 Kimi k2.5 Template

> **Template de démonstration pour Kimi k2.5** — Un projet Next.js 16 moderne optimisé pour le développement assisté par IA avec une collection complète de skills spécialisés.

---

## ✨ À propos

Ce projet est une **démo/template conçue spécifiquement pour Kimi k2.5**, mettant en avant :

- 🤖 **L'intégration optimale avec Kimi k2.5** via un système de skills structuré
- 🏗️ **Une stack technique moderne** (Next.js 16, React 19, Tailwind CSS 4)
- 📚 **15 skills spécialisés** pour accélérer le développement
- 🎯 **Des patterns et bonnes pratiques** validés pour React 19 et Next.js App Router

---

## 🛠️ Stack Technique

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Next.js** | 16.1.6 | Framework React avec App Router |
| **React** | 19.2.3 | UI library avec Server Components |
| **TypeScript** | 5.9.3 | Typage strict et sécurisé |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS avec `@theme` |
| **Geist Font** | latest | Police Vercel (Sans + Mono) |
| **pnpm** | - | Package manager rapide |

### Librairies UI & Data

- **[shadcn/ui](https://ui.shadcn.com)** — Composants Radix UI + Tailwind
- **[TanStack Query](https://tanstack.com/query)** — Data fetching et caching
- **[Motion (Framer Motion)](https://motion.dev)** — Animations React
- **[Zustand](https://github.com/pmndrs/zustand)** — State management léger
- **[Recharts](https://recharts.org)** — Visualisation de données
- **[Zod](https://zod.dev)** — Validation de schémas TypeScript

---

## 🎓 Skills Kimi (15 spécialisations)

Le projet inclut **15 skills spécialisés** dans `.agents/skills/` pour guider Kimi k2.5 :

### 🎯 Planification & Architecture
| Skill | Description |
|-------|-------------|
| [`plan-master`](.agents/skills/plan-master/SKILL.md) | Méthodologie de planification systématique |
| [`subagent-tasker`](.agents/skills/subagent-tasker/SKILL.md) | Best practices pour les tâches parallèles |
| [`post-review`](.agents/skills/post-review/SKILL.md) | Revue de code systématique post-implémentation |

### 🏗️ Développement Frontend
| Skill | Description |
|-------|-------------|
| [`nextjs-16-tailwind-4`](.agents/skills/nextjs-16-tailwind-4/SKILL.md) | Patterns Next.js 16 + Tailwind 4 + React 19 |
| [`shadcn-ui`](.agents/skills/shadcn-ui/SKILL.md) | Composants shadcn/ui et Charts |
| [`motion-animations`](.agents/skills/motion-animations/SKILL.md) | Animations Motion (Framer Motion) |
| [`component-generator`](.agents/skills/component-generator/SKILL.md) | Générateur de composants React |

### 🔄 Data & State Management
| Skill | Description |
|-------|-------------|
| [`tanstack-query`](.agents/skills/tanstack-query/SKILL.md) | Data fetching avec TanStack Query |
| [`zustand-state`](.agents/skills/zustand-state/SKILL.md) | State management avec Zustand |
| [`forms-master`](.agents/skills/forms-master/SKILL.md) | Formulaires React 19 + Zod + Server Actions |
| [`react-custom-hooks`](.agents/skills/react-custom-hooks/SKILL.md) | Custom hooks React |

### 🔧 Backend & API
| Skill | Description |
|-------|-------------|
| [`next-api-routes`](.agents/skills/next-api-routes/SKILL.md) | API Routes & Server Actions |

### ✅ Qualité & Sécurité
| Skill | Description |
|-------|-------------|
| [`testing-vitest`](.agents/skills/testing-vitest/SKILL.md) | Tests avec Vitest + React Testing Library |
| [`accessibility-a11y`](.agents/skills/accessibility-a11y/SKILL.md) | Accessibilité web (a11y) |
| [`security-best-practices`](.agents/skills/security-best-practices/SKILL.md) | Bonnes pratiques de sécurité |
| [`migration-refactor`](.agents/skills/migration-refactor/SKILL.md) | Refactoring et migrations |

---

## 📁 Structure du Projet

```
my-app/
├── .agents/
│   └── skills/                 # 🎓 Skills Kimi (15 spécialisations)
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
│   │   ├── layout.tsx          # Root layout avec fonts & metadata
│   │   ├── page.tsx            # Page d'accueil
│   │   ├── dashboard/          # Exemple: Dashboard page
│   │   │   └── page.tsx
│   │   ├── globals.css         # Styles globaux + Tailwind theme
│   │   └── favicon.ico
│   │
│   ├── components/             # 🧩 Composants React
│   │   ├── ui/                 # Composants shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── chart.tsx
│   │   │   └── ...
│   │   ├── animations/         # Composants d'animation Motion
│   │   │   ├── fade-in.tsx
│   │   │   ├── card-hover.tsx
│   │   │   └── ...
│   │   ├── dashboard/          # Composants métier Dashboard
│   │   │   ├── stats-grid.tsx
│   │   │   ├── revenue-chart.tsx
│   │   │   └── ...
│   │   └── providers/          # Providers React
│   │       └── query-provider.tsx
│   │
│   ├── hooks/                  # 🎣 Custom hooks
│   │   └── use-dashboard.ts
│   │
│   └── lib/                    # 📚 Utilitaires et config
│       ├── utils.ts            # Fonctions utilitaires (cn, etc.)
│       ├── query-client.ts     # Config TanStack Query
│       ├── query-keys.ts       # Clés de requête
│       ├── api/                # API clients
│       │   └── dashboard.ts
│       └── types/              # Types TypeScript
│           └── dashboard.ts
│
├── public/                     # 📦 Assets statiques
├── package.json                # Dépendances
├── next.config.ts              # Config Next.js
├── tsconfig.json               # Config TypeScript
├── eslint.config.mjs           # Config ESLint
└── AGENTS.md                   # 📖 Documentation agent complète
```

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 20+
- pnpm (recommandé)

### Installation

```bash
# Cloner le repo
git clone https://github.com/CaseReed/kimi-template.git
cd kimi-template

# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) pour voir le résultat.

### Scripts disponibles

```bash
pnpm dev          # Serveur de développement
pnpm build        # Build de production
pnpm start        # Démarrer le serveur de production
pnpm lint         # Linter ESLint
pnpm clean        # Nettoyage complet (node_modules, .next, etc.)
```

---

## 🎨 Exemple : Dashboard Inclus

Le projet inclut une **page Dashboard complète** (`/dashboard`) démontrant :

- 📊 **Graphiques** avec Recharts (revenus, catégories)
- 📈 **Statistiques** avec animations Motion
- 📋 **Tableau de transactions** avec pagination
- 🔄 **Data fetching** avec TanStack Query
- 🎯 **Optimistic UI** avec React 19

Parfait pour comprendre comment les skills s'intègrent dans un cas réel !

---

## 📝 Comment utiliser les Skills

Dans Kimi k2.5, utilise les skills avec la syntaxe `/skill:nom-du-skill` :

```
# Exemples:
/skill:plan-master          # Pour planifier une feature complexe
/skill:component-generator  # Pour générer un nouveau composant
/skill:shadcn-ui           # Pour ajouter des composants UI
/skill:tanstack-query      # Pour implémenter du data fetching
/skill:forms-master        # Pour créer un formulaire
/skill:post-review         # Pour revoir le code après implémentation
```

> 💡 **Golden Rule** : Toujours finir par `/skill:post-review` avant de marquer une feature comme terminée !

---

## 📖 Documentation

- **[AGENTS.md](AGENTS.md)** — Documentation complète du projet pour les agents
- **[SKILL_AUDIT_MASTER.md](.agents/skills/SKILL_AUDIT_MASTER.md)** — Audit et statut des skills
- **Skills individuels** — Voir `.agents/skills/<skill-name>/SKILL.md`

---

## 🔐 Sécurité

- Environment variables : utiliser `.env.local` (jamais commité)
- Seules les variables `NEXT_PUBLIC_*` sont exposées au client
- ESLint inclut les règles de sécurité React et Next.js

---

## 📄 License

MIT — Libre d'utilisation pour vos propres projets.

---

<p align="center">
  Conçu avec ❤️ pour <strong>Kimi k2.5</strong>
</p>

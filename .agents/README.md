# Agent Resources

This directory contains all AI-agent-specific resources for the kimi-template project.

## 📁 Structure

```
.agents/
├── README.md          # This file - overview of agent resources
├── docs/              # Agent documentation
│   ├── README.md      # Docs index
│   ├── AUTH.md        # Authentication system (Better Auth)
│   ├── DOCKER.md      # Docker configuration
│   ├── DOCKER_DATABASE.md  # Docker + PostgreSQL + Drizzle
│   └── OAUTH_SETUP.md # OAuth provider setup (GitHub, Google)
└── skills/            # Specialized agent skills
    ├── SKILL_AUDIT_MASTER.md
    ├── better-auth/
    ├── docker-deployment/
    ├── drizzle-orm/
    ├── forms-master/
    ├── motion-animations/
    ├── nextjs-16-tailwind-4/
    ├── plan-master/
    ├── post-review/
    ├── shadcn-ui/
    ├── tanstack-query/
    └── ... (27 total)
```

## 🎯 Purpose

This directory is **not for human contributors**. It contains:

1. **Documentation** (`docs/`) - Technical details about project setup and configuration
2. **Skills** (`skills/`) - Reusable, modular capabilities for AI agents

## 👥 For Humans

Please refer to the project root:
- [`README.md`](/README.md) - Project overview and setup
- [`AGENTS.md`](/AGENTS.md) - Main agent guidelines (includes links to this directory)

## 🤖 For Agents

When working on this project:
1. Start with [`AGENTS.md`](/AGENTS.md) at project root
2. Check relevant skills in `skills/` for specialized knowledge
3. Reference `docs/` for configuration details
4. Always follow the **Language Convention**: CLI in French, everything else in English

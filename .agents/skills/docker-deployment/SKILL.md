---
name: docker-deployment
description: Docker containerization and multi-platform deployment for Next.js 16 applications
license: MIT
compatibility: Next.js 16+, React 19+, Docker 24+, Node.js 20+
---

# Docker & Multi-Platform Deployment

Docker containerization and deployment patterns for Next.js 16 applications on various platforms.

---

## Quick Reference

### When to Use

- Deploying to non-Vercel platforms (AWS, GCP, Azure, DigitalOcean, Railway, Render, Fly.io)
- Need consistent environments between dev/staging/production
- Running microservices architecture
- Self-hosting on VPS or dedicated servers
- Building CI/CD pipelines with containerization

### Deployment Options Comparison

| Option | Features | Best For |
|--------|----------|----------|
| **Node.js Server** | All Next.js features | Direct VPS deployment |
| **Docker Container** | All Next.js features | Multi-platform, Kubernetes |
| **Static Export** | Limited (no API routes) | CDN hosting, simple sites |
| **Platform Adapters** | Platform-specific | AWS Amplify, Netlify, Cloudflare |

### Official Resources

- **Docker Best Practices**: https://docs.docker.com/build/building/best-practices/
- **Next.js Deployment**: https://nextjs.org/docs/app/getting-started/deploying
- **Docker Hub Node Images**: https://hub.docker.com/_/node

---

## Installation

### 1. Install Docker

```bash
# macOS
brew install --cask docker

# Linux (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh

# Windows
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
```

### 2. Verify Installation

```bash
docker --version
docker-compose --version
```

---

## Core Patterns

### Pattern 1: Multi-Stage Production Dockerfile

**Essential for optimized production builds.**

```dockerfile
# syntax=docker/dockerfile:1

# ==========================================
# Stage 1: Dependencies (with BuildKit cache)
# ==========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm via corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy only lockfile first for better caching
COPY pnpm-lock.yaml ./

# Use BuildKit cache mount for faster installs
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm fetch --frozen-lockfile

# Copy package.json and install
COPY package.json ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ==========================================
# Stage 2: Builder
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY . .

# Build the application
RUN pnpm build

# ==========================================
# Stage 3: Runner (Production)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Enable standalone output in `next.config.ts`:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

### Pattern 2: Development Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including dev)
RUN pnpm install

# Copy source
COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
```

### Pattern 3: Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - NEXT_TELEMETRY_DISABLED=1
```

### Pattern 3b: CI/CD Optimized Dockerfile (No BuildKit Cache)

**For ephemeral CI/CD environments where cache mounts aren't available.**

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ==========================================
# Stage 1: Fetch dependencies (cacheable layer)
# ==========================================
FROM base AS deps
COPY pnpm-lock.yaml ./
# pnpm fetch only needs lockfile - perfect for layer caching
RUN pnpm fetch --frozen-lockfile

COPY package.json ./
RUN pnpm install --frozen-lockfile --offline

# ==========================================
# Stage 2: Build
# ==========================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY . .
RUN pnpm build

# ==========================================
# Stage 3: Production
# ==========================================
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Pattern 4: Docker Compose (Production with Database)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Pattern 5: Monorepo Dockerfile (pnpm deploy)

**For monorepos with shared packages.**

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
RUN corepack enable

# ==========================================
# Stage 1: Build all packages
# ==========================================
FROM base AS build
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Fetch all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm fetch --frozen-lockfile

# Copy source and install
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --offline

# Build all packages
RUN pnpm run -r build

# Deploy only the web app with its production dependencies
RUN pnpm deploy --filter=web --prod /prod/web

# ==========================================
# Stage 2: Production
# ==========================================
FROM base AS runner
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy deployed app (includes standalone output)
COPY --from=build --chown=nextjs:nodejs /prod/web ./

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Project structure:**
```
monorepo/
├── packages/
│   ├── ui/               # Shared UI components
│   └── utils/            # Shared utilities
├── apps/
│   └── web/              # Next.js app
├── pnpm-workspace.yaml
└── Dockerfile
```

### Pattern 6: .dockerignore

```gitignore
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Next.js build output
.next
out

# Testing
coverage

# Environment files
.env*.local
.env

# Version control
.git
.gitignore

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Documentation
README.md
CHANGELOG.md
*.md

# CI/CD
.github
.gitlab-ci.yml

# Docker
Dockerfile*
docker-compose*
.dockerignore

# Monorepo specific
**/node_modules
turbo-cache
```

---

## Platform-Specific Deployments

### Railway

**Official template:** https://github.com/nextjs/deploy-railway

```yaml
# railway.yml
build:
  builder: DOCKERFILE
deploy:
  startCommand: node server.js
  healthcheckPath: /api/health
  restartPolicyType: ON_FAILURE
  restartPolicyMaxRetries: 3
```

**Deploy button:**
```markdown
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/your-template-id)
```

### Render (Blueprint)

**Official docs:** https://render.com/docs/blueprint-spec

```yaml
# render.yaml - Complete Blueprint Example
version: "1"

services:
  - type: web
    name: my-nextjs-app
    runtime: docker
    region: oregon
    plan: standard
    dockerfilePath: ./Dockerfile
    healthCheckPath: /api/health
    autoDeploy: true
    scaling:
      minInstances: 1
      maxInstances: 3
      targetCPUPercent: 70
      targetMemoryPercent: 70
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_TELEMETRY_DISABLED
        value: "1"
      - key: DATABASE_URL
        fromDatabase:
          name: postgres-db
          property: connectionString
      - key: NEXTAUTH_SECRET
        generateValue: true
      - key: STRIPE_API_KEY
        sync: false  # Prompt for value during setup
    buildFilter:
      paths:
        - apps/web/**
        - packages/**
      ignoredPaths:
        - "**/*.test.ts"
        - "**/*.spec.ts"

databases:
  - name: postgres-db
    databaseName: myapp
    user: myapp
    plan: standard
    region: oregon
    postgresMajorVersion: "16"
    ipAllowList: []  # Only private network access

envVarGroups:
  - name: common-settings
    envVars:
      - key: LOG_LEVEL
        value: info
      - key: ENABLE_ANALYTICS
        value: "true"
```

**Key Render Blueprint features:**
- `sync: false` - Prompts for secret values during initial setup
- `generateValue: true` - Generates random 256-bit secrets
- `fromDatabase` / `fromService` - Reference other resource values
- `scaling` - Autoscaling configuration
- `buildFilter` - Monorepo path filtering

### Fly.io

**Official template:** https://github.com/fly-apps/fly-nextjs-template

```toml
# fly.toml
app = "my-nextjs-app"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

  [http_service.concurrency]
    type = "requests"
    hard_limit = 1000
    soft_limit = 500

[[vm]]
  size = "shared-cpu-1x"
  memory = "512mb"
  cpu_kind = "shared"

# Mount persistent volume (optional)
[[mounts]]
  source = "data"
  destination = "/data"

# Health checks
[[http_service.checks]]
  interval = "30s"
  timeout = "5s"
  grace_period = "10s"
  method = "GET"
  path = "/api/health"
  protocol = "http"

# Secrets (set via CLI: fly secrets set KEY=value)
[env]
  NODE_ENV = "production"
  NEXT_TELEMETRY_DISABLED = "1"
```

**Fly.io CLI commands:**
```bash
# Launch new app
fly launch --dockerfile Dockerfile

# Set secrets
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Deploy
fly deploy

# Scale
fly scale count 2
fly scale vm shared-cpu-2x

# View logs
fly logs
```

### DigitalOcean App Platform

**Official template:** https://github.com/nextjs/deploy-digitalocean

```yaml
# .do/app.yaml - App Platform Specification
name: my-nextjs-app
region: nyc
services:
  - name: web
    source_dir: /
    github:
      repo: your-org/your-repo
      branch: main
      deploy_on_push: true
    dockerfile_path: Dockerfile
    http_port: 3000
    instance_count: 1
    instance_size_slug: apps-s-1vcpu-0.5gb
    health_check:
      http_path: /api/health
      port: 3000
    env:
      - key: NODE_ENV
        value: production
      - key: NEXT_TELEMETRY_DISABLED
        value: "1"
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
    routes:
      - path: /
    cors:
      allow_origins:
        - prefix: "https://yourdomain.com"

databases:
  - name: db
    engine: PG
    version: "16"
    size: db-s-dev-database
    num_nodes: 1
```

**Deploy via doctl:**
```bash
# Install doctl
brew install doctl

# Authenticate
doctl auth init

# Create app from spec
doctl apps create --spec .do/app.yaml

# Update app
doctl apps update <app-id> --spec .do/app.yaml
```

### Google Cloud Run

```yaml
# cloudbuild.yaml - Build & Deploy
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: 
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/my-nextjs-app:$COMMIT_SHA'
      - '-t'
      - 'gcr.io/$PROJECT_ID/my-nextjs-app:latest'
      - '.'
    env:
      - 'DOCKER_BUILDKIT=1'
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/my-nextjs-app:$COMMIT_SHA']
  
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'my-nextjs-app'
      - '--image'
      - 'gcr.io/$PROJECT_ID/my-nextjs-app:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--memory'
      - '512Mi'
      - '--cpu'
      - '1'
      - '--concurrency'
      - '80'
      - '--max-instances'
      - '10'
      - '--min-instances'
      - '0'
      - '--timeout'
      - '300'
      - '--health-check'
      - '/api/health'

images:
  - 'gcr.io/$PROJECT_ID/my-nextjs-app:$COMMIT_SHA'
  - 'gcr.io/$PROJECT_ID/my-nextjs-app:latest'

options:
  logging: CLOUD_LOGGING_ONLY
```

**Service YAML (for Infrastructure as Code):**
```yaml
# service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: my-nextjs-app
  annotations:
    run.googleapis.com/ingress: all
    run.googleapis.com/execution-environment: gen2
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "0"
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "true"
        run.googleapis.com/memory: "512Mi"
        run.googleapis.com/cpu: "1"
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      containers:
        - image: gcr.io/PROJECT_ID/my-nextjs-app
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
          resources:
            limits:
              memory: 512Mi
              cpu: 1000m
          startupProbe:
            httpGet:
              path: /api/health
              port: 3000
            failureThreshold: 3
            periodSeconds: 10
```

### AWS ECS / Fargate

```json
// task-definition.json
{
  "family": "nextjs-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "nextjs-app",
      "image": "your-ecr-repo/my-nextjs-app:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/nextjs-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

---

## Security Best Practices

### Handling Secrets Securely

#### ❌ NEVER: Hardcoded Secrets in Dockerfile

```dockerfile
# NEVER do this - secrets persist in image layers
ENV DATABASE_URL="postgresql://user:password@host/db"
ENV NEXTAUTH_SECRET="hardcoded-secret"
```

#### ✅ Runtime Secrets (Recommended)

```bash
# Pass at runtime (not in image)
docker run \
  -e NODE_ENV=production \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  -p 3000:3000 my-app
```

#### ✅ Docker Compose Secrets

```yaml
# docker-compose.yml
services:
  app:
    build: .
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production  # Gitignored file
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    file: ./secrets/api_key.txt
```

#### ✅ Build Secrets (BuildKit)

For secrets needed during build (private npm registries, GitHub tokens):

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps

# Install dependencies using mounted secret
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    pnpm install --frozen-lockfile
```

```bash
# Build with secret
docker build --secret id=npmrc,src=$HOME/.npmrc -t my-app .

# Or with env var
docker build --secret id=github_token,env=GITHUB_TOKEN -t my-app .
```

### Non-Root User Security

```dockerfile
# Create non-root user with explicit UID/GID
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Switch to non-root
USER nextjs
```

### Read-Only Filesystem

```dockerfile
# Make filesystem read-only for security
FROM node:20-alpine AS runner

# Create writable tmp directory
RUN mkdir -p /tmp/nextjs && chown nextjs:nodejs /tmp/nextjs

# Run with read-only root fs + tmpfs
docker run --read-only --tmpfs /tmp:rw,noexec,nosuid,size=100m my-app
```

### Image Scanning with Docker Scout

```bash
# Enable Docker Scout
docker scout quickview

# Scan image for vulnerabilities
docker scout cves my-app:latest

# Compare with previous version
docker scout compare my-app:latest my-app:previous

# Generate SBOM (Software Bill of Materials)
docker scout sbom --format spdx-json my-app:latest > sbom.json
```

### Security Hardening Checklist

- [ ] Run as non-root user (UID ≥ 10000 recommended)
- [ ] Use minimal base images (Alpine or distroless)
- [ ] Pin image digests for reproducible builds
- [ ] No secrets in image layers
- [ ] Read-only root filesystem
- [ ] Drop all capabilities except required ones
- [ ] Scan images regularly for CVEs
- [ ] Use multi-stage builds to exclude build tools

---

## Monitoring & Observability

### Structured Logging

```typescript
// lib/logger.ts
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  defaultMeta: { 
    service: 'nextjs-app',
    environment: process.env.NODE_ENV 
  },
  transports: [
    new transports.Console()
  ]
});

// Usage in API routes
logger.info('User logged in', { userId: user.id });
logger.error('Database connection failed', { error: err.message });
```

### Health & Readiness Checks

```typescript
// src/app/api/health/route.ts
import { logger } from '@/lib/logger';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
  };

  // Check database connectivity
  try {
    // await prisma.$queryRaw`SELECT 1`;
    checks.database = 'connected';
  } catch (error) {
    checks.status = 'unhealthy';
    checks.database = 'disconnected';
    logger.error('Health check failed', { error: error.message });
    return Response.json(checks, { status: 503 });
  }

  return Response.json(checks, { status: 200 });
}
```

### Metrics Endpoint (Prometheus)

```typescript
// src/app/api/metrics/route.ts
import { register, collectDefaultMetrics } from 'prom-client';

// Collect default metrics
collectDefaultMetrics();

export async function GET() {
  const metrics = await register.metrics();
  return new Response(metrics, {
    headers: { 'Content-Type': register.contentType }
  });
}
```

---

## Troubleshooting

### Common Errors

#### ❌ Error: "Cannot find module 'next'"

**Cause:** Missing node_modules in final stage or standalone output not configured.

**Fix:**
```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone', // Required!
};
```

```dockerfile
# Ensure all files are copied
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
```

#### ❌ Error: "EACCES: permission denied" on build

**Cause:** Running as root but files owned by different user.

**Fix:**
```dockerfile
# Set proper ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Or fix permissions
RUN chown -R nextjs:nodejs /app
```

#### ❌ Error: "db: error: database system is starting up"

**Cause:** App starts before database is ready.

**Fix:** Use init container or wait-for-it script:

```dockerfile
# Add wait-for-it to check DB readiness
COPY --from=ghcr.io/ufoscout/docker-compose-wait:latest /wait /wait
RUN chmod +x /wait
CMD /wait && node server.js
```

```yaml
# docker-compose.yml
services:
  app:
    environment:
      WAIT_HOSTS: db:5432
      WAIT_TIMEOUT: 60
```

#### ❌ Error: "Module not found" for CSS/SCSS

**Cause:** Missing build dependencies (python, make, g++).

**Fix:**
```dockerfile
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
```

#### ❌ Error: "sharp" module missing

**Cause:** Next.js image optimization requires sharp.

**Fix:**
```dockerfile
RUN apk add --no-cache libc6-compat vips-dev
# Or disable image optimization in next.config.ts
const nextConfig = {
  images: { unoptimized: true }
};
```

### Debugging Commands

```bash
# Shell into running container
docker exec -it <container-id> /bin/sh

# View logs
docker logs <container-id> -f --tail 100

# Check resource usage
docker stats

# Inspect container
docker inspect <container-id>

# View layer history
docker history my-app:latest

# Export filesystem for inspection
docker export <container-id> -o container-fs.tar

# Build with verbose output
DOCKER_BUILDKIT=0 docker build -t my-app . --progress=plain

# Scan image for issues
docker scout quickview my-app:latest
```

### Performance Profiling

```bash
# Analyze image size
docker images my-app --format "{{.Size}}"

# Dive - interactive image explorer
dive my-app:latest

# Check build cache usage
docker buildx build --no-cache -t my-app . 2>&1 | grep -E "(CACHED|RUN)"
```

---

## Health Checks

### Next.js Health Check API

```typescript
// src/app/api/health/route.ts
export async function GET() {
  // Check database connectivity, external services, etc.
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  };

  return Response.json(health, { status: 200 });
}
```

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --spider -q http://localhost:3000/api/health || exit 1
```

---

## Common Commands

```bash
# Build image
docker build -t my-nextjs-app .

# Build with BuildKit (faster)
DOCKER_BUILDKIT=1 docker build -t my-nextjs-app .

# Run container
docker run -p 3000:3000 my-nextjs-app

# Run with env vars
docker run -p 3000:3000 -e NODE_ENV=production my-nextjs-app

# Build multi-platform
docker buildx build --platform linux/amd64,linux/arm64 -t my-nextjs-app .

# Docker Compose
docker-compose up -d
docker-compose down
docker-compose logs -f

# Clean up
docker system prune -a
docker volume prune
```

---

## Common Pitfalls

### ❌ Pitfall 1: Not Using Standalone Output

```typescript
// ❌ Missing output: 'standalone' in next.config.ts
// Results in larger images and slower builds

// ✅ Correct
const nextConfig = {
  output: 'standalone',
};
```

### ❌ Pitfall 2: Running as Root User

```dockerfile
# ❌ Security risk - running as root
USER root

# ✅ Secure - run as non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
```

### ❌ Pitfall 3: Copying .env Files

```dockerfile
# ❌ NEVER copy .env files
COPY .env .env.local ./

# ✅ Use build args or runtime environment
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
```

### ❌ Pitfall 4: Not Using .dockerignore

```gitignore
# ❌ Without .dockerignore, node_modules and build artifacts
# are sent to Docker daemon, slowing builds

# ✅ Include node_modules, .next, .git in .dockerignore
```

### ❌ Pitfall 5: Missing libc6-compat on Alpine

```dockerfile
# ❌ May cause issues with some native modules
FROM node:20-alpine

# ✅ Always add for better compatibility
FROM node:20-alpine
RUN apk add --no-cache libc6-compat
```

### ❌ Pitfall 6: Using npm install Instead of ci

```dockerfile
# ❌ Non-deterministic installs
RUN npm install

# ✅ Deterministic installs with lock file
RUN npm ci
# or with pnpm
RUN pnpm install --frozen-lockfile
```

### ❌ Pitfall 7: Not Handling Next.js Runtime Features

```typescript
// ❌ Using server features without proper Docker setup
// API routes, Server Actions, and dynamic rendering need
// proper Node.js runtime in container

// ✅ Ensure your Dockerfile uses Node.js runtime
// and exposes the correct port
```

---

## Optimization Tips

### 1. Leverage Build Cache

Order Dockerfile instructions from least to most frequently changing:

```dockerfile
# 1. Base image (rarely changes)
FROM node:20-alpine

# 2. System dependencies (rarely changes)
RUN apk add --no-cache libc6-compat

# 3. Package files (change with dependencies)
COPY package.json pnpm-lock.yaml ./

# 4. Install dependencies (changes with package.json)
RUN pnpm install --frozen-lockfile

# 5. Source code (changes frequently)
COPY . .

# 6. Build (always changes with source)
RUN pnpm build
```

### 2. Use BuildKit Features

```dockerfile
# syntax=docker/dockerfile:1
# Enable BuildKit features

# Mount cache for faster installs
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile
```

### 3. Smaller Base Images

| Image | Size | Use Case |
|-------|------|----------|
| `node:20` | ~900MB | Full Debian, many tools |
| `node:20-alpine` | ~180MB | **Recommended for production** |
| `node:20-slim` | ~250MB | Good balance |
| `gcr.io/distroless/nodejs20` | ~120MB | Minimal, no shell |

### 4. Graceful Shutdown

Handle SIGTERM properly for zero-downtime deployments:

```typescript
// server.ts (for custom server)
import { createServer } from 'http';
import next from 'next';

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  server.listen(3000, () => {
    console.log('Server ready on port 3000');
  });

  // Graceful shutdown
  const gracefulShutdown = (signal: string) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });

    // Force shutdown after 30s
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
});
```

```dockerfile
# Set graceful shutdown timeout
ENV NEXT_TELEMETRY_DISABLED=1
STOPSIGNAL SIGTERM
```

---

## Debugging

```bash
# Shell into running container
docker exec -it <container-id> /bin/sh

# View logs
docker logs <container-id> -f

# Build with no cache
docker build --no-cache -t my-app .

# Pull fresh base images
docker build --pull -t my-app .

# Inspect image layers
docker history my-app

# Check image size
docker images my-app
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/docker.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## Validation Checklist

Before deploying to production:

- [ ] `next.config.ts` has `output: 'standalone'`
- [ ] Dockerfile uses multi-stage build
- [ ] `.dockerignore` excludes node_modules, .next, .env files
- [ ] Container runs as non-root user
- [ ] Only production dependencies in final stage
- [ ] Health check endpoint implemented
- [ ] Environment variables passed at runtime, not build time (for secrets)
- [ ] Proper PORT and HOSTNAME configuration
- [ ] Tested locally with `docker run`
- [ ] Image size is reasonable (< 200MB ideal)
- [ ] Logs are properly configured
- [ ] Graceful shutdown handling

---

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Deployment Guide](https://nextjs.org/docs/app/getting-started/deploying)
- [Docker Hub Node.js Images](https://hub.docker.com/_/node)
- [BuildKit Documentation](https://docs.docker.com/build/buildkit/)

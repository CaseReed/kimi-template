# Docker Configuration

Docker configuration for kimi-template (Next.js 16 + React 19 + pnpm).

---

## 🚀 Quick Start

### Development (with hot reload)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production (local)

```bash
# Build and start production image
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

### Direct Docker Commands

```bash
# Build production image
DOCKER_BUILDKIT=1 docker build -t kimi-template:latest .

# Run container
docker run -p 3000:3000 kimi-template:latest

# Run with environment variables
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_TELEMETRY_DISABLED=1 \
  kimi-template:latest
```

---

## 📁 Docker Files

| File | Description |
|------|-------------|
| `Dockerfile` | Production multi-stage image (optimized) |
| `Dockerfile.dev` | Development image with hot reload |
| `docker-compose.yml` | Development configuration |
| `docker-compose.prod.yml` | Production configuration |
| `.dockerignore` | Files excluded from build context |
| `src/app/api/health/route.ts` | Health check endpoint |

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file (not versioned):

```env
# Application
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Secrets (examples)
# DATABASE_URL=postgresql://user:pass@host:5432/db
# NEXTAUTH_SECRET=your-secret-here
# NEXTAUTH_URL=https://your-domain.com
```

### Ports

- **3000**: Next.js application

---

## 🏥 Health Check

The `/api/health` endpoint returns:

```json
{
  "status": "healthy",
  "timestamp": "2025-01-29T10:00:00.000Z",
  "uptime": 1234,
  "environment": "production",
  "version": "0.1.0"
}
```

Used by:
- Docker healthcheck
- Docker Compose
- Kubernetes probes
- Load balancers

---

## 📊 Included Optimizations

- **Multi-stage build**: Reduces final image size
- **BuildKit cache mounts**: Speeds up repeated builds
- **Non-root user**: Runs app as `nextjs` user
- **Standalone output**: Self-contained Node.js server
- **pnpm**: Fast and efficient package manager

---

## 🔒 Security

- Container runs as non-root user (UID 1001)
- No secrets in image (use environment variables)
- Read-only root filesystem
- Integrated health check

---

## 🐛 Debugging

```bash
# Shell into container
docker exec -it kimi-template-dev /bin/sh

# Logs
docker logs kimi-template-dev -f

# Stats
docker stats

# Rebuild without cache
docker-compose build --no-cache
```

---

## 📚 Reference

- [Docker Deployment Skill](/skill:docker-deployment)
- [Next.js Deployment](https://nextjs.org/docs/app/getting-started/deploying)
- [Docker Best Practices](https://docs.docker.com/build/building/best-practices/)

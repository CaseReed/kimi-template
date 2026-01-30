# Docker + PostgreSQL + Drizzle Setup

This guide explains how to run the application with PostgreSQL database in Docker, using Drizzle ORM for database management.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│   PostgreSQL    │
│   (Docker)      │     │   (Docker)      │
└─────────────────┘     └─────────────────┘
         │                       │
         │              ┌────────┴────────┐
         │              │   Persistent    │
         │              │   Volume        │
         │              └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Better Auth   │
│   (auto-migrate)│
└─────────────────┘
```

## Quick Start (Production Mode)

### 1. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
nano .env
```

Required variables:
```bash
DB_PASSWORD=your-secure-password
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
BETTER_AUTH_URL=http://localhost:3000
```

### 2. Start the Services

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Watch logs
docker-compose -f docker-compose.prod.yml logs -f

# Check specific service logs
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f db
```

### 3. Run Database Migrations

Better Auth will automatically create the required tables on first run. If you need to run migrations manually:

```bash
# Enter the app container
docker-compose -f docker-compose.prod.yml exec app sh

# Run Better Auth migrations
npx @better-auth/cli migrate

# Exit the container
exit
```

### 4. Create Admin User

```bash
# The app must be running
docker-compose -f docker-compose.prod.yml exec app sh

# Run seed script
pnpm db:seed:admin

# Exit
exit
```

### 5. Access the Application

- App: http://localhost:3000
- Database: localhost:5432 (if exposed)

## Development Mode

For local development with hot-reload:

### Option 1: Using Docker PostgreSQL + Local Next.js

```bash
# 1. Start only the database in Docker
docker run -d \
  --name myapp-db-dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=myapp \
  -p 5432:5432 \
  -v postgres_dev_data:/var/lib/postgresql/data \
  postgres:16-alpine

# 2. Update .env.local
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp

# 3. Run Next.js locally
pnpm dev
```

### Option 2: Using docker-compose.dev.yml (if available)

```bash
docker-compose up -d
```

## Database Management with Drizzle

### Generate Migrations

After modifying `src/lib/db/schema.ts`:

```bash
# Generate migration files
pnpm db:generate

# Or in Docker
docker-compose -f docker-compose.prod.yml exec app pnpm db:generate
```

### Apply Migrations

```bash
# Apply pending migrations
pnpm db:migrate

# Or push directly (development only)
pnpm db:push
```

### Drizzle Studio (GUI)

```bash
# Launch Drizzle Studio
pnpm db:studio

# Access at http://localhost:4983
```

### Using Drizzle in Code

```typescript
import { db, schema } from "@/lib/db";

// Query users
const users = await db.query.user.findMany();

// Insert user
const newUser = await db.insert(schema.user).values({
  id: "user-id",
  email: "user@example.com",
  name: "John Doe",
});

// With relations
const usersWithSessions = await db.query.user.findMany({
  with: {
    sessions: true,
  },
});
```

## Better Auth Database Schema

Better Auth automatically manages these tables:

| Table | Purpose |
|-------|---------|
| `user` | User accounts (email, name, image) |
| `session` | Active sessions with tokens |
| `account` | OAuth provider connections |
| `verification` | Email verification tokens |

## Backup & Restore

### Backup Database

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres myapp > backup.sql

# Compress backup
gzip backup.sql
```

### Restore Database

```bash
# Restore from backup
gunzip < backup.sql.gz | docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres myapp
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if database is running
docker-compose -f docker-compose.prod.yml ps

# Check database logs
docker-compose -f docker-compose.prod.yml logs db

# Test connection from app container
docker-compose -f docker-compose.prod.yml exec app sh -c "nc -zv db 5432"
```

### Reset Database (⚠️ Destructive)

```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Remove volume
docker-compose -f docker-compose.prod.yml down -v

# Restart
docker-compose -f docker-compose.prod.yml up -d
```

### Migration Failures

```bash
# Check migration status in container
docker-compose -f docker-compose.prod.yml exec app npx drizzle-kit check

# Force push (development only)
docker-compose -f docker-compose.prod.yml exec app pnpm db:push
```

## Production Checklist

- [ ] Change default `DB_PASSWORD`
- [ ] Generate strong `BETTER_AUTH_SECRET`
- [ ] Set correct `BETTER_AUTH_URL` (HTTPS)
- [ ] Configure OAuth providers
- [ ] Enable email verification (Better Auth config)
- [ ] Set up automated backups
- [ ] Configure log rotation
- [ ] Enable health checks (already configured)

## Useful Commands

```bash
# View running containers
docker-compose -f docker-compose.prod.yml ps

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Scale app (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Execute SQL
docker-compose -f docker-compose.prod.yml exec db psql -U postgres myapp -c "SELECT * FROM \"user\";"

# Check disk usage
docker system df -v

# Clean unused resources
docker system prune
```

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/docs)
- [Drizzle Kit Docs](https://orm.drizzle.team/docs/kit)
- [Better Auth Database](https://www.better-auth.com/docs/concepts/database)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)

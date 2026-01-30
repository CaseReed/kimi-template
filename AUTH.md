# Authentication System

This project uses [Better Auth](https://better-auth.com) for type-safe, self-hosted authentication with email/password, OAuth providers (GitHub, Google), and session management.

## Features

- 🔐 **Email/Password Authentication** - Traditional login with secure password hashing
- 🔑 **OAuth Providers** - GitHub and Google sign-in
- 🛡️ **Session Management** - Secure HTTP-only cookies with 7-day expiration
- 🌍 **i18n Support** - Login/register pages support English and French
- 📱 **Responsive UI** - Built with shadcn/ui components
- 🐳 **Docker Ready** - PostgreSQL database with Docker Compose

## Project Structure

```
src/
├── lib/
│   ├── auth.ts           # Better Auth server configuration
│   ├── auth-client.ts    # React client for authentication
│   └── db/
│       ├── index.ts      # Drizzle ORM client
│       └── schema.ts     # Database schema
├── components/auth/
│   ├── login-form.tsx    # Login form component
│   ├── register-form.tsx # Registration form component
│   └── logout-button.tsx # Logout button component
├── app/
│   ├── api/auth/[...all]/route.ts  # Auth API endpoints
│   └── [locale]/
│       ├── page.tsx      # Home (redirects to login or dashboard)
│       ├── login/page.tsx    # Login page
│       ├── register/page.tsx # Registration page
│       └── dashboard/page.tsx # Protected dashboard
```

## Database Architecture

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
│  Drizzle ORM    │
│  Better Auth    │
└─────────────────┘
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required - Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp

# Required - Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000

# OAuth (Optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin seed (Optional)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123456
ADMIN_NAME=Admin User

# Docker (Optional)
DB_PASSWORD=postgres
```

## Getting Started

### Option 1: Local Development (without Docker)

**Prerequisites:** PostgreSQL running locally

```bash
# 1. Install dependencies
pnpm install

# 2. Setup database (create database "myapp")
createdb myapp

# 3. Start development server
pnpm dev

# 4. Create admin user (in another terminal)
pnpm db:seed:admin
```

### Option 2: Docker Development (Recommended)

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your values

# 2. Start all services
docker-compose -f docker-compose.prod.yml up -d

# 3. Wait for database to be ready (first time)
docker-compose -f docker-compose.prod.yml logs -f db

# 4. Create admin user
docker-compose -f docker-compose.prod.yml exec app pnpm db:seed:admin

# 5. View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### Access the Application

- Login: http://localhost:3000/en or http://localhost:3000/fr
- Dashboard: http://localhost:3000/en/dashboard (requires authentication)

## Authentication Flow

```
User visits /              User visits /dashboard
      │                           │
      ▼                           ▼
Check session              Check session
      │                           │
   ┌──┴──┐                   ┌───┴────┐
   │     │                   │        │
Logged? Not logged?      Logged?  Not logged?
   │     │                   │        │
   ▼     ▼                   ▼        ▼
Redirect  Show           Show     Redirect
┌─────────┐ Login        Dashboard  ┌──────────┐
│Dashboard│ Form                    │  /login  │
└─────────┘                          └──────────┘
```

## Usage in Components

### Server Component (RSC)

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <div>Welcome {session.user.name}</div>;
}
```

### Client Component

```tsx
"use client";

import { authClient, useSession } from "@/lib/auth-client";

export function UserNav() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <a href="/login">Sign In</a>;

  return (
    <div>
      <span>{session.user.name}</span>
      <button onClick={() => authClient.signOut()}>Sign Out</button>
    </div>
  );
}
```

## Database Management with Drizzle

### Schema

Better Auth uses PostgreSQL with Drizzle ORM. Tables are automatically created:

| Table | Purpose |
|-------|---------|
| `user` | User accounts (email, name, image) |
| `session` | Active sessions with tokens |
| `account` | OAuth provider connections |
| `verification` | Email verification tokens |

### Drizzle Commands

```bash
# Generate migration files after schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema directly (development only)
pnpm db:push

# Launch Drizzle Studio GUI
pnpm db:studio
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

## API Endpoints

All auth endpoints are available under `/api/auth/*`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sign-in/email` | POST | Email/password sign in |
| `/api/auth/sign-up/email` | POST | Email/password registration |
| `/api/auth/sign-in/social` | POST | OAuth sign in |
| `/api/auth/sign-out` | POST | Sign out |
| `/api/auth/session` | GET | Get current session |

## Docker Commands

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Reset database (⚠️ destructive)
docker-compose -f docker-compose.prod.yml down -v

# Backup database
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres myapp > backup.sql

# Restore database
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres myapp
```

## Security Considerations

1. **Always verify session server-side** - The cookie check in proxy is optimistic, always use `auth.api.getSession()` in pages
2. **HTTPS in production** - Set `BETTER_AUTH_URL` to your HTTPS URL
3. **Strong secrets** - Use a cryptographically secure random string for `BETTER_AUTH_SECRET`
4. **Database credentials** - Use strong passwords for PostgreSQL in production
5. **OAuth redirect URIs** - Configure exact redirect URIs in your OAuth app settings

## OAuth Setup

### GitHub

1. Go to Settings → Developer settings → OAuth Apps → New OAuth App
2. Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID and Client Secret to `.env.local`

### Google

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret to `.env.local`

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps

# Check database logs
docker-compose -f docker-compose.prod.yml logs db

# Test connection
docker-compose -f docker-compose.prod.yml exec app sh -c "nc -zv db 5432"
```

### Session Not Persisting

- Check that `nextCookies()` plugin is included in `lib/auth.ts`
- Verify `BETTER_AUTH_SECRET` is set and consistent
- Check browser console for cookie-related errors

### OAuth Not Working

- Verify OAuth app credentials in `.env.local`
- Check redirect URI matches exactly (including protocol and port)
- Check browser network tab for OAuth callback errors

## Documentation

- [Better Auth Docs](https://better-auth.com/docs)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs)
- [Docker Database Setup](./DOCKER_DATABASE.md)

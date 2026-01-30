---
name: neon-postgresql
description: Neon PostgreSQL for Next.js 16 - serverless Postgres with branching, Vercel integration, and edge support
license: MIT
compatibility: Neon Serverless Driver v1.0+, Next.js 16+, Vercel
---

<!-- Official docs: https://neon.com/docs (previously neon.tech) -->

# Neon PostgreSQL

Neon is a serverless PostgreSQL platform with compute-storage separation, offering autoscaling, instant branching, point-in-time restore, and edge support.

## Quick Reference

```bash
# Install serverless driver
pnpm add @neondatabase/serverless

# Alternative: Install from JSR (JavaScript Registry)
deno add jsr:@neon/serverless
# or
npx jsr add @neon/serverless

# For Drizzle ORM integration
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit

# Connection string format
DATABASE_URL="postgresql://[user]:[password]@[hostname]/[dbname]?sslmode=require"

# Pooled connection (add -pooler to hostname)
DATABASE_URL="postgresql://[user]:[password]@[hostname]-pooler/[dbname]?sslmode=require"
```

## Installation

### 1. Install Dependencies

```bash
# Core serverless driver
pnpm add @neondatabase/serverless

# For WebSocket support (Node.js environments)
pnpm add ws
pnpm add -D @types/ws
```

### 2. Create Neon Project

1. Sign up at [neon.com](https://neon.com)
2. Create a new project
3. Copy the connection string from **Project Dashboard → Connect**

### 3. Environment Variables

```bash
# .env.local
# Use pooled connection for serverless/edge functions
DATABASE_URL="postgresql://[user]:[password]@[hostname]-pooler/[dbname]?sslmode=require"

# Unpooled connection for migrations and direct connections
DATABASE_URL_UNPOOLED="postgresql://[user]:[password]@[hostname]/[dbname]?sslmode=require"
```

## Core Patterns

### Database Connection Setup

#### Basic HTTP Connection (Recommended for single queries)

```typescript
// src/lib/db.ts
import { neon } from "@neondatabase/serverless";

// Create SQL query function
const sql = neon(process.env.DATABASE_URL!);

// Template literal usage (safe against SQL injection)
export async function getPost(id: number) {
  const post = await sql`SELECT * FROM posts WHERE id = ${id}`;
  return post[0];
}

// Multiple parameters - fully composable
export async function getPosts(limit: number, offset: number) {
  return await sql`SELECT * FROM posts LIMIT ${limit} OFFSET ${offset}`;
}
```

#### Server Components (App Router)

```typescript
// src/app/posts/page.tsx
import { neon } from "@neondatabase/serverless";

async function getPosts() {
  const sql = neon(process.env.DATABASE_URL!);
  return await sql`SELECT * FROM posts ORDER BY created_at DESC`;
}

export default async function PostsPage() {
  const posts = await getPosts();
  
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

#### Server Actions

```typescript
// src/app/actions.ts
"use server";

import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";

const sql = neon(process.env.DATABASE_URL!);

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  
  await sql`
    INSERT INTO posts (title, content, created_at)
    VALUES (${title}, ${content}, NOW())
  `;
  
  revalidatePath("/posts");
}

export async function deletePost(id: number) {
  await sql`DELETE FROM posts WHERE id = ${id}`;
  revalidatePath("/posts");
}
```

#### Edge Functions

```typescript
// src/app/api/edge/route.ts
export const runtime = "edge";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  const result = await sql`SELECT version()`;
  return Response.json({ version: result[0].version });
}
```

---

## Pricing & Plans

Neon introduced new usage-based pricing in August 2025:

| Plan | Cost | Best For |
|------|------|----------|
| **Free** | $0 | Side projects, learning |
| **Launch** | $5/mo base + usage | Production apps starting out |
| **Scale** | Usage-based | High-traffic production |

### Free Plan Limits
- 0.5 GB storage per project
- Compute hours included
- 1 project (unlimited branches)

### Usage Costs (Launch Plan)
- Compute: $0.106 per CU-hour
- Storage: $0.35 per GB-month
- Data transfer: First 5GB free

[Full pricing details](https://neon.com/docs/introduction/pricing)

### Vercel Integration (Marketplace)

The Neon Vercel Integration automatically manages database branches for preview deployments.

### Integration Options (2025)

Neon now offers two Vercel integration models:

| Feature | Vercel-Managed | Neon-Managed |
|---------|---------------|--------------|
| Neon account | Auto-created on first connect | Requires existing Neon account |
| Billing | Through Vercel | Direct with Neon |
| Branch cleanup | Deployment-based (auto on deploy deletion) | Git-branch-based |
| Neon Auth | Auto-provisioned on preview branches | Auto-provisioned |

> ⚠️ **Important Limitation:** The **Vercel-Managed (Native)** integration currently does **NOT** support automatic database branches for preview deployments. 
>
> For automatic preview branches (database per PR), use the **Neon-Managed** integration instead.

**Recommendation:** Use Vercel-Managed for new projects; Neon-Managed if you have an existing Neon organization.

#### Setup Steps

1. **Install Integration**: Go to [Vercel Marketplace](https://vercel.com/marketplace) → Search "Neon" → Add integration

2. **Configure Integration**:
   - Select your Vercel project
   - Select your Neon project, database, and role
   - Enable "Create a branch for your development environment" (creates `vercel-dev` branch)
   - Enable "Automatically delete obsolete Neon branches"

3. **Environment Variables Set Automatically**:
   ```
   DATABASE_URL          # Pooled connection string
   DATABASE_URL_UNPOOLED # Direct connection string
   ```

#### How It Works

```
Branch: main (production)
  ├── Preview PR #123 → Branch: preview/pr-123
  ├── Preview PR #124 → Branch: preview/pr-124  
  └── Development     → Branch: vercel-dev
```

- Each PR creates an isolated database branch
- Branch is created from the Neon default branch (usually `main`)
- Branch is automatically deleted when PR is merged/closed
- Preview deployments get their own `DATABASE_URL` pointing to the branch

### Branching Workflow for Preview Deployments

#### Manual Branching (Without Vercel Integration)

```typescript
// scripts/create-branch.ts
import { neon } from "@neondatabase/serverless";

async function createPreviewBranch(branchName: string) {
  // Use Neon API or CLI for branch creation
  // See: https://neon.com/docs/introduction/branching
  
  // Example using API
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${PROJECT_ID}/branches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NEON_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        branch: {
          parent_id: "main-branch-id",
          name: branchName,
        },
      }),
    }
  );
  
  return response.json();
}
```

#### Branch with TTL (Temporary Branches)

```typescript
// Create branch with expiration (auto-deletion)
async function createTempBranch(branchName: string, ttlHours: number) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);
  
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${PROJECT_ID}/branches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NEON_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        branch: {
          parent_id: "main-branch-id",
          name: branchName,
          suspend_timeout: 0,
        },
        // TTL handled via separate API or cron cleanup
      }),
    }
  );
  
  return response.json();
}
```

### Serverless Driver Usage Patterns

#### HTTP Queries (One-shot, Fastest)

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Single query - HTTP is fastest
const result = await sql`SELECT * FROM users WHERE id = ${userId}`;

// Multiple rows with limit
const posts = await sql`SELECT * FROM posts LIMIT ${10}`;
```

#### WebSocket Connections (Sessions & Transactions)

```typescript
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

// Configure WebSocket for Node.js environments
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Interactive transaction
export async function transferFunds(fromId: number, toId: number, amount: number) {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    await client.query(
      "UPDATE accounts SET balance = balance - $1 WHERE id = $2",
      [amount, fromId]
    );
    
    await client.query(
      "UPDATE accounts SET balance = balance + $1 WHERE id = $2",
      [amount, toId]
    );
    
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

#### Batch Queries with `transaction()`

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Batch multiple queries in one HTTP request
const [users, posts] = await sql.transaction([
  sql`SELECT * FROM users`,
  sql`SELECT * FROM posts`,
]);
```

#### Query Options

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!, {
  // Return rows as arrays instead of objects
  arrayMode: false,
  
  // Return full result with metadata
  fullResults: false,
  
  // Custom fetch options
  fetchOptions: {
    priority: "high",
  },
});

// Full results example
const sqlFull = neon(process.env.DATABASE_URL!, { fullResults: true });
const result = await sqlFull`SELECT * FROM users`;
// Returns: { rows: [...], fields: [...], rowCount: n, command: "SELECT" }
```

### Browser Security Warning

The serverless driver v1.0.1+ shows a security warning when used in browsers. To disable:

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!, {
  disableWarningInBrowsers: true  // Only if you understand the risks
});
```

> ⚠️ **Warning:** Only disable if you're building a development tool or internal app. Never disable for public-facing production apps.

#### Unsafe Interpolation (For Trusted Values)

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// For dynamic table/column names (trusted values only!)
const tableName = "users"; // Must be trusted/validated
const result = await sql`SELECT * FROM ${sql.unsafe(tableName)} WHERE id = ${id}`;

// Or using conditional table selection
const table = condition ? sql`table1` : sql`table2`;
const result = await sql`SELECT * FROM ${table} WHERE id = ${id}`;
```

### Connection Pooling Best Practices

#### When to Use Pooled vs Unpooled

| Environment | Connection Type | Reason |
|-------------|-----------------|--------|
| Serverless/Edge | Pooled (`-pooler`) | Support 10,000 concurrent connections |
| Migrations | Unpooled | Direct connection for schema changes |
| Long-running servers | Unpooled | Manage your own connection pool |
| Development | Either | Both work fine locally |

#### Pooled Connection String

```bash
# Add -pooler suffix to hostname
DATABASE_URL="postgresql://user:pass@ep-hostname-pooler.region.aws.neon.tech/dbname?sslmode=require"
                                                              ^^^^^^^
```

#### Connection Limits by Compute Size

| Compute | vCPU | RAM | max_connections | Available* |
|---------|------|-----|-----------------|------------|
| 0.25 CU | 0.25 | 1GB | 104             | 97         |
| 0.50 CU | 0.50 | 2GB | 209             | 202        |
| 1 CU    | 1    | 4GB | 419             | 412        |
| 2 CU    | 2    | 8GB | 839             | 832        |
| 3 CU    | 3    | 12GB| 1258            | 1251       |
| 4 CU    | 4    | 16GB| 1677            | 1670       |
| 5 CU    | 5    | 20GB| 2096            | 2089       |
| 6 CU    | 6    | 24GB| 2516            | 2509       |
| 7 CU    | 7    | 28GB| 2935            | 2928       |
| 8 CU    | 8    | 32GB| 3357            | 3350       |
| 9-56 CU | -    | -   | 4000 (capped)   | 3993       |

> **Note:** 7 connections are reserved for the Neon superuser. The "Available" column shows connections usable by your application.

Check your limit:
```sql
SHOW max_connections;
```

#### Connection Pooling Configuration (PgBouncer)

Neon automatically provides connection pooling with these settings:
- `pool_mode=transaction` - Best for serverless
- `max_client_conn=10000` - Up to 10,000 client connections
- `default_pool_size=0.9 * max_connections`

> **Query Queue Timeout:** When `default_pool_size` is reached, new queries wait in a queue with a **2-minute timeout**. Exceeding this throws `query_wait_timeout` error.

## Drizzle ORM Integration

### Schema Setup with Neon

```typescript
// src/db/schema.ts
import { pgTable, serial, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Database Client Setup

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// For serverless/edge (HTTP)
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });

// For WebSocket/Pool (transactions)
import { Pool } from "@neondatabase/serverless";
import { drizzle as drizzleWs } from "drizzle-orm/neon-serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const dbPool = drizzleWs(pool, { schema });
```

### Migrations on Neon

#### 1. Configure Drizzle Kit

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!, // Use unpooled for migrations
  },
});
```

#### 2. Migration Commands

```bash
# Generate migration
pnpm drizzle-kit generate

# Run migrations (use unpooled connection)
DATABASE_URL_UNPOOLED="your-unpooled-url" pnpm drizzle-kit migrate

# Push schema changes (development only)
pnpm drizzle-kit push
```

#### 3. Migration Script

```typescript
// scripts/migrate.ts
import { migrate } from "drizzle-orm/neon-http/migrator";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
const db = drizzle(sql);

async function main() {
  await migrate(db, { migrationsFolder: "./drizzle/migrations" });
  console.log("Migrations completed");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### Edge Functions Configuration with Drizzle

```typescript
// src/app/api/users/route.ts
export const runtime = "edge";

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

export async function GET() {
  const allUsers = await db.select().from(users);
  return Response.json(allUsers);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const [newUser] = await db
    .insert(users)
    .values(body)
    .returning();
  
  return Response.json(newUser, { status: 201 });
}
```

### Query Patterns with Drizzle

```typescript
// src/lib/users.ts
import { db } from "@/db";
import { users, posts } from "@/db/schema";
import { eq, desc, like, and } from "drizzle-orm";

// Select all with relations
export async function getUsersWithPosts() {
  return await db.query.users.findMany({
    with: {
      posts: true,
    },
  });
}

// Select with filters
export async function searchUsers(searchTerm: string) {
  return await db
    .select()
    .from(users)
    .where(like(users.name, `%${searchTerm}%`));
}

// Insert with returning
export async function createUser(data: typeof users.$inferInsert) {
  const [user] = await db
    .insert(users)
    .values(data)
    .returning();
  return user;
}

// Update
export async function updateUser(id: number, data: Partial<typeof users.$inferInsert>) {
  const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();
  return user;
}

// Delete
export async function deleteUser(id: number) {
  await db.delete(users).where(eq(users.id, id));
}

// Join query
export async function getUserPosts(userId: number) {
  return await db
    .select({
      postId: posts.id,
      title: posts.title,
      authorName: users.name,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(users.id, userId))
    .orderBy(desc(posts.createdAt));
}
```

## Environment Configuration

### Local Development with Docker PostgreSQL

#### 1. Docker Compose

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### 2. Environment Files

```bash
# .env.development (local Docker)
DATABASE_URL="postgresql://dev:devpassword@localhost:5432/myapp?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://dev:devpassword@localhost:5432/myapp?sslmode=require"

# .env.production (Neon - set in Vercel dashboard)
DATABASE_URL="postgresql://neon-user:password@ep-host-pooler.region.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://neon-user:password@ep-host.region.aws.neon.tech/neondb?sslmode=require"
```

#### 3. Next.js Environment Config

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Only expose to server
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
  },
};

export default nextConfig;
```

### Production with Neon

#### Vercel Deployment Checklist

1. **Add Neon Integration** (automatic)
   - Installs from Vercel Marketplace
   - Sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`

2. **Configure Build Settings**
   ```json
   // vercel.json
   {
     "buildCommand": "drizzle-kit migrate && next build"
   }
   ```

3. **Handle Migrations**
   ```json
   // package.json
   {
     "scripts": {
       "vercel-build": "drizzle-kit migrate && next build"
     }
   }
   ```

### Environment Variables Management

```typescript
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_URL_UNPOOLED: z.string().url().optional(),
  NEON_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

## Common Pitfalls

### 1. GA v1.0 Breaking Change

The Neon serverless driver v1.0+ requires **Node.js 19+** and has a breaking change:

```typescript
// ❌ OLD - Calling as regular function (no longer works)
const result = await sql("SELECT * FROM users WHERE id = $1", [id]);

// ✅ NEW - Use query() method for parameterized queries
const result = await sql.query("SELECT * FROM users WHERE id = $1", [id]);

// ✅ OR use template literal syntax (recommended)
const result = await sql`SELECT * FROM users WHERE id = ${id}`;
```

### 2. Prepared Statements in Pool Mode

PgBouncer in transaction mode does not support prepared statements:

```typescript
// ❌ Won't work with pooled connections
const result = await sql.prepare("SELECT * FROM users WHERE id = $1");

// ✅ Use template literals or query() instead
const result = await sql`SELECT * FROM users WHERE id = ${id}`;
```

### 3. Interactive Transactions Over HTTP

HTTP connections don't support multi-statement transactions:

```typescript
// ❌ Won't work with neon() HTTP driver
await sql`BEGIN`;
await sql`UPDATE accounts SET balance = balance - 100 WHERE id = 1`;
await sql`UPDATE accounts SET balance = balance + 100 WHERE id = 2`;
await sql`COMMIT`;

// ✅ Use Pool/Client for transactions
import { Pool } from "@neondatabase/serverless";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("UPDATE accounts...", [amount]);
  await client.query("COMMIT");
} finally {
  client.release();
}
```

### 4. Connection String Confusion

```typescript
// ❌ Using unpooled for serverless functions
const sql = neon(process.env.DATABASE_URL_UNPOOLED); // Risk of connection limit

// ✅ Use pooled connection for serverless
const sql = neon(process.env.DATABASE_URL); // Has -pooler suffix
```

### 5. WebSocket in Edge Runtime

```typescript
// ❌ Trying to use WebSocket in Edge
export const runtime = "edge";
import ws from "ws";
neonConfig.webSocketConstructor = ws; // Error: ws not available in Edge

// ✅ Use HTTP driver for Edge
export const runtime = "edge";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL); // Uses HTTP fetch
```

### 6. Missing sslmode

```typescript
// ❌ May fail depending on client defaults
DATABASE_URL="postgresql://user:pass@host/db"

// ✅ Always include sslmode=require
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

### 7. Hydration Mismatches with Timestamps

```typescript
// ❌ Can cause hydration mismatches
timestamp("created_at").defaultNow()

// ✅ Use consistent timestamp handling
// In schema
timestamp("created_at", { mode: "string" }).defaultNow()

// Or handle in application
const posts = await db.select().from(postsTable);
const serialized = posts.map(p => ({
  ...p,
  createdAt: p.createdAt.toISOString(), // Ensure consistent format
}));
```

### 8. Branch Naming Conflicts

```bash
# ❌ Don't manually rename branches created by Vercel integration
# The integration tracks branches by name for auto-deletion

# ✅ Let the integration manage branch names
# Or disable auto-deletion if you need custom naming
```

## Validation Checklist

Before deploying to production:

- [ ] **Driver Version**: Using `@neondatabase/serverless` v1.0+ with Node.js 19+
- [ ] **Connection String**: Using pooled connection (`-pooler` suffix) for serverless
- [ ] **Migrations**: Using unpooled connection for Drizzle migrations
- [ ] **SSL Mode**: `sslmode=require` in all connection strings
- [ ] **Environment Variables**: 
  - `DATABASE_URL` (pooled) set in Vercel
  - `DATABASE_URL_UNPOOLED` (direct) set for migrations
- [ ] **Vercel Integration**: Installed and configured from marketplace
- [ ] **Branching**: Auto-delete enabled for preview branches
- [ ] **Type Safety**: Drizzle schema matches database schema
- [ ] **Edge Runtime**: Using HTTP driver (not WebSocket) for Edge Functions
- [ ] **Transactions**: Using Pool/Client for multi-statement transactions
- [ ] **Error Handling**: Database errors caught and handled gracefully
- [ ] **Connection Testing**: Health check endpoint validates database connectivity

## Health Check Example

```typescript
// src/app/api/health/route.ts
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const result = await sql`SELECT version(), NOW() as time`;
    return Response.json({
      status: "healthy",
      database: "connected",
      version: result[0].version,
      timestamp: result[0].time,
    });
  } catch (error) {
    return Response.json(
      { status: "unhealthy", error: String(error) },
      { status: 503 }
    );
  }
}
```

## Additional Resources

- [Neon Documentation](https://neon.com/docs)
- [Neon Serverless Driver](https://neon.com/docs/serverless/serverless-driver)
- [Vercel Integration Guide](https://neon.com/docs/guides/vercel)
- [Drizzle ORM + Neon Tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon)
- [Connection Pooling](https://neon.com/docs/connect/connection-pooling)
- [Branching Guide](https://neon.com/docs/introduction/branching)

> **Note:** Neon changed from neon.tech to neon.com in September 2025

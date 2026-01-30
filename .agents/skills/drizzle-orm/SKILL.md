---
name: drizzle-orm
description: Drizzle ORM for Next.js 16 - type-safe SQL-like ORM with Drizzle Kit migrations, Neon PostgreSQL integration, and Edge compatibility
license: MIT
compatibility: Drizzle ORM v0.45+, Drizzle Kit v0.31+, Next.js 16+, PostgreSQL, Neon
---

# Drizzle ORM

Type-safe SQL-like ORM for Next.js 16 with first-class TypeScript support, zero dependencies, and edge-ready architecture.

---

## Quick Reference

```typescript
// Schema definition
import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Database client (Neon serverless - production/edge)
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });

// Database client (Local Docker - development)
// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle({ client: pool });

// Query patterns
const allUsers = await db.select().from(users);
const user = await db.select().from(users).where(eq(users.id, 1));

// Insert
await db.insert(users).values({ email: "user@example.com", name: "John" });

// Update
await db.update(users).set({ name: "Jane" }).where(eq(users.id, 1));

// Delete
await db.delete(users).where(eq(users.id, 1));
```

---

## Installation

### Core Packages

```bash
# Drizzle ORM + Kit
pnpm add drizzle-orm
pnpm add -D drizzle-kit

# Neon PostgreSQL driver (serverless/edge compatible)
pnpm add @neondatabase/serverless

# Local PostgreSQL driver (Docker/local Postgres)
pnpm add pg
pnpm add -D @types/pg

# Environment variables
pnpm add dotenv
```

**Current Stable Versions:**
- `drizzle-orm`: ^0.45.1
- `drizzle-kit`: ^0.31.8
- `@neondatabase/serverless`: ^1.0.2

> **Note:** Drizzle ORM v1.0.0-beta.2 is available with significant breaking changes (RQBv2, RLS syntax, array syntax). 
> This skill covers stable v0.x. See [migration guide](https://orm.drizzle.team/docs/relations-v1-v2) when v1 is released.

### Project Structure

```
my-app/
├── src/
│   ├── db/
│   │   ├── schema.ts          # Table definitions
│   │   ├── relations.ts       # Relations configuration (optional)
│   │   └── index.ts           # Database client export
│   └── app/
│       └── api/
│           └── ...            # API routes using db
├── drizzle.config.ts          # Drizzle Kit configuration
├── migrations/                # Generated migration files
└── .env.local                 # DATABASE_URL
```

---

## Core Patterns

### 1. Schema Definition

#### Basic Tables

```typescript
// src/db/schema.ts
import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
  index,
  uniqueIndex 
} from "drizzle-orm/pg-core";

// Users table with indexes
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  metadata: jsonb("metadata").$type<{ preferences?: Record<string, unknown> }>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex("email_idx").on(table.email),
  roleIdx: index("role_idx").on(table.role),
}));

// Posts table with foreign key
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  published: boolean("published").default(false).notNull(),
  authorId: integer("author_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  authorIdx: index("author_idx").on(table.authorId),
  publishedIdx: index("published_idx").on(table.published),
}));
```

#### UUID Primary Keys

```typescript
import { uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const organizations = pgTable("organizations", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### Enums

```typescript
import { pgEnum } from "drizzle-orm/pg-core";

// Define enum at database level
export const userRoleEnum = pgEnum("user_role", ["admin", "user", "guest"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("user").notNull(),
});
```

### 2. Database Client Setup

#### Neon Serverless (Recommended for Next.js)

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

// Neon serverless driver
const sql = neon(process.env.DATABASE_URL!);

// Create Drizzle client
export const db = drizzle({ 
  client: sql,
  // Optional: enable logger in development
  logger: process.env.NODE_ENV === "development",
});

// Export schema types
export type DbClient = typeof db;
```

#### Connection Pooling (for high traffic)

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

// Connection pool for better performance
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

export const db = drizzle(pool);
```

### 3. Local Development with Docker PostgreSQL

For local development, use Docker PostgreSQL instead of Neon to avoid cloud latency and costs:

#### Docker Compose Setup

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: myapp-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d  # Optional: seed data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d myapp"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s

volumes:
  postgres_data:
```

#### Local Database Client (postgres.js)

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

// Local PostgreSQL pool (node-postgres driver)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Local development optimizations
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle({ 
  client: pool,
  logger: process.env.NODE_ENV === "development",
});

// Handle pool shutdown gracefully
process.on("SIGTERM", () => pool.end());
process.on("SIGINT", () => pool.end());
```

#### Environment Configuration

```bash
# .env.local (Docker PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myapp"

# .env.production (Neon)
# DATABASE_URL="postgresql://user:pass@neon-host.neon.tech/neondb?sslmode=require"
```

#### Switching Between Local and Neon

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const isNeon = process.env.DATABASE_URL?.includes("neon.tech");

export const db = isNeon 
  ? drizzleNeon({ client: neon(process.env.DATABASE_URL!), logger: true })
  : drizzle({ client: new Pool({ connectionString: process.env.DATABASE_URL }), logger: true });
```

#### Running Local Database

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Wait for healthcheck, then run migrations
npx drizzle-kit migrate

# Seed data (optional)
# npx tsx src/db/seed.ts

# Stop container
docker-compose down

# Reset data (remove volume)
docker-compose down -v
```

#### Handling Connection Retry

Add to package.json scripts for reliable startup:

```json
{
  "scripts": {
    "db:up": "docker-compose up -d postgres",
    "db:wait": "sleep 2",
    "db:migrate": "pnpm db:wait && drizzle-kit migrate",
    "db:reset": "docker-compose down -v && pnpm db:up && pnpm db:migrate"
  }
}
```

### 4. Drizzle Kit Configuration

```typescript
// drizzle.config.ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Optional: casing strategy
  casing: "snake_case",
  // Optional: tables to include/exclude from migrations
  tablesFilter: ["!*_prisma_migrations"],
  // Optional: schema filter
  schemaFilter: ["public"],
});
```

### 5. Migration Commands

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply pending migrations
npx drizzle-kit migrate

# Push schema changes directly (development only)
npx drizzle-kit push

# Pull existing database schema
npx drizzle-kit pull

# Check for migration drift
npx drizzle-kit check

# Studio - visual database management
npx drizzle-kit studio
```

### 6. Query Patterns

#### Select Queries

```typescript
import { eq, and, or, like, desc, asc, count, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, posts } from "@/db/schema";

// Select all
const allUsers = await db.select().from(users);

// Select specific columns
const userEmails = await db.select({
  id: users.id,
  email: users.email,
}).from(users);

// Where clauses
const activeUsers = await db
  .select()
  .from(users)
  .where(eq(users.isActive, true));

// Multiple conditions
const filteredUsers = await db
  .select()
  .from(users)
  .where(
    and(
      eq(users.isActive, true),
      like(users.email, "%@example.com")
    )
  );

// Ordering
const sortedUsers = await db
  .select()
  .from(users)
  .orderBy(desc(users.createdAt));

// Pagination
const paginatedUsers = await db
  .select()
  .from(users)
  .limit(10)
  .offset(20);

// Count
const [userCount] = await db
  .select({ count: count() })
  .from(users)
  .where(eq(users.isActive, true));

// Raw SQL expressions
const usersWithAge = await db
  .select({
    ...users,
    daysSinceCreated: sql<number>`EXTRACT(DAY FROM NOW() - ${users.createdAt})`,
  })
  .from(users);
```

#### Insert Queries

```typescript
// Single insert
const [newUser] = await db
  .insert(users)
  .values({
    email: "user@example.com",
    name: "John Doe",
    role: "user",
  })
  .returning();

// Multiple inserts
await db.insert(users).values([
  { email: "user1@example.com", name: "User 1" },
  { email: "user2@example.com", name: "User 2" },
]);

// Insert with onConflict
await db
  .insert(users)
  .values({ email: "existing@example.com", name: "User" })
  .onConflictDoUpdate({
    target: users.email,
    set: { name: "Updated Name" },
  });

// Insert or ignore
await db
  .insert(users)
  .values({ email: "existing@example.com", name: "User" })
  .onConflictDoNothing({ target: users.email });
```

#### Update Queries

```typescript
// Update single record
await db
  .update(users)
  .set({ 
    name: "Updated Name",
    updatedAt: new Date(),
  })
  .where(eq(users.id, 1));

// Update with returning
const [updatedUser] = await db
  .update(users)
  .set({ name: "Updated" })
  .where(eq(users.id, 1))
  .returning();

// Conditional update
await db
  .update(users)
  .set({ isActive: false })
  .where(
    and(
      eq(users.role, "guest"),
      sql`${users.createdAt} < NOW() - INTERVAL '30 days'`
    )
  );
```

#### Delete Queries

```typescript
// Delete single record
await db.delete(users).where(eq(users.id, 1));

// Delete with returning
const [deletedUser] = await db
  .delete(users)
  .where(eq(users.id, 1))
  .returning();

// Bulk delete
await db
  .delete(users)
  .where(sql`${users.createdAt} < NOW() - INTERVAL '1 year'`);
```

#### Joins

```typescript
// Inner join
const usersWithPosts = await db
  .select({
    userId: users.id,
    userName: users.name,
    postTitle: posts.title,
  })
  .from(users)
  .innerJoin(posts, eq(users.id, posts.authorId));

// Left join with aggregation
const usersWithPostCount = await db
  .select({
    id: users.id,
    name: users.name,
    postCount: count(posts.id),
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .groupBy(users.id, users.name);

// Complex join with filters
const recentPostsByActiveUsers = await db
  .select({
    user: users,
    post: posts,
  })
  .from(users)
  .innerJoin(posts, eq(users.id, posts.authorId))
  .where(
    and(
      eq(users.isActive, true),
      eq(posts.published, true),
      sql`${posts.createdAt} > NOW() - INTERVAL '7 days'`
    )
  )
  .orderBy(desc(posts.createdAt));
```

### 7. Relations (Relational Query Builder)

```typescript
// src/db/schema.ts
import { relations } from "drizzle-orm";

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ 
  client: sql,
  schema, // Include relations
});
```

```typescript
// Using relational queries
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: {
      where: (posts, { eq }) => eq(posts.published, true),
      orderBy: (posts, { desc }) => desc(posts.createdAt),
      limit: 5,
    },
  },
  where: (users, { eq }) => eq(users.isActive, true),
});

// Single user with posts
const userWithPosts = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.id, 1),
  with: {
    posts: true,
  },
});
```

### 8. Server Actions Integration

```typescript
// src/app/actions/user-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

// Get users (for Server Components)
export async function getUsers() {
  return db.select().from(users).where(eq(users.isActive, true));
}

// Create user
export async function createUser(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  if (!email || !name) {
    return { error: "Email and name are required" };
  }

  try {
    const [user] = await db
      .insert(users)
      .values({ email, name })
      .returning();

    revalidatePath("/users");
    return { success: true, user };
  } catch (error) {
    return { error: "Failed to create user" };
  }
}

// Update user
export async function updateUser(id: number, formData: FormData) {
  const name = formData.get("name") as string;

  try {
    const [user] = await db
      .update(users)
      .set({ name, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    revalidatePath("/users");
    return { success: true, user };
  } catch (error) {
    return { error: "Failed to update user" };
  }
}

// Delete user
export async function deleteUser(id: number) {
  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete user" };
  }
}
```

### 9. React 19 useActionState Integration

```typescript
// src/app/components/user-form.tsx
"use client";

import { useActionState } from "react";
import { createUser } from "@/app/actions/user-actions";

export function UserForm() {
  const [state, action, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await createUser(formData);
      return result;
    },
    null
  );

  return (
    <form action={action}>
      <input name="email" type="email" required />
      <input name="name" type="text" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create User"}
      </button>
      {state?.error && <p className="error">{state.error}</p>}
      {state?.success && <p className="success">User created!</p>}
    </form>
  );
}
```

---

## Neon PostgreSQL Integration

### Connection String

```bash
# .env.local
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

### Serverless Driver Setup

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Neon HTTP client (edge-compatible)
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
```

### Edge Functions Support

Drizzle with Neon works in Vercel Edge Functions:

```typescript
// src/app/api/edge/route.ts
import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users } from "@/db/schema";

export const runtime = "edge";

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle({ client: sql });
  
  const allUsers = await db.select().from(users);
  
  return NextResponse.json({ users: allUsers });
}
```

### Connection Pooling Best Practices

```typescript
// For high-traffic apps, use Pool with connection string
// that includes pooling parameters

// .env.local
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.neon.tech/neondb?sslmode=require

// src/db/index.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum connections in pool
});

export const db = drizzle(pool);
```

---

## Transactions

```typescript
import { db } from "@/db";
import { users, posts } from "@/db/schema";

// Basic transaction
await db.transaction(async (tx) => {
  const [user] = await tx
    .insert(users)
    .values({ email: "user@example.com", name: "User" })
    .returning();

  await tx.insert(posts).values({
    title: "First Post",
    authorId: user.id,
  });
});

// Transaction with rollback condition
await db.transaction(async (tx) => {
  const [user] = await tx
    .insert(users)
    .values({ email: "user@example.com" })
    .returning();

  if (!user) {
    tx.rollback();
    return;
  }

  await tx.insert(posts).values({
    title: "Post",
    authorId: user.id,
  });
});

// Savepoints
await db.transaction(async (tx) => {
  // First operation
  await tx.insert(users).values({ email: "user1@example.com" });
  
  // Create savepoint
  await tx.execute("SAVEPOINT sp1");
  
  try {
    await tx.insert(users).values({ email: "user2@example.com" });
  } catch {
    // Rollback to savepoint on error
    await tx.execute("ROLLBACK TO SAVEPOINT sp1");
  }
});
```

---

## Type Safety

### Infer Types from Schema

```typescript
// src/db/schema.ts
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
});

// Infer types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Usage
import type { User, NewUser } from "@/db/schema";

function processUser(user: User) {
  // user is fully typed
  console.log(user.email);
}

function createUser(data: NewUser) {
  // data type matches insert requirements
}
```

### Generic Repository Pattern

```typescript
// src/lib/repository.ts
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { PgTable } from "drizzle-orm/pg-core";

export class Repository<T extends PgTable, InsertT = T["$inferInsert"], SelectT = T["$inferSelect"]> {
  constructor(private table: T) {}

  async findAll(): Promise<SelectT[]> {
    return db.select().from(this.table) as Promise<SelectT[]>;
  }

  async findById(id: number): Promise<SelectT | undefined> {
    const [result] = await db
      .select()
      .from(this.table)
      .where(eq(this.table.id as any, id));
    return result as SelectT | undefined;
  }

  async create(data: InsertT): Promise<SelectT> {
    const [result] = await db
      .insert(this.table)
      .values(data as any)
      .returning();
    return result as SelectT;
  }
}
```

---

## Common Pitfalls

### 1. Environment Variables Not Loaded

```typescript
// ❌ Wrong - env not loaded before schema import
import { db } from "@/db";
import { config } from "dotenv";
config(); // Too late!

// ✅ Correct - load env in db/index.ts
// src/db/index.ts
import { config } from "dotenv";
config({ path: ".env.local" });
// ... rest of imports
```

### 2. Forgetting `notNull()` on Required Fields

```typescript
// ❌ Wrong - field can be null unexpectedly
export const users = pgTable("users", {
  email: varchar("email", { length: 255 }), // Can be null!
});

// ✅ Correct - explicitly mark as notNull
export const users = pgTable("users", {
  email: varchar("email", { length: 255 }).notNull(),
});
```

### 3. Not Handling Unique Constraint Errors

```typescript
// ❌ Wrong - no error handling
await db.insert(users).values({ email: "exists@example.com" });

// ✅ Correct - handle conflicts
await db
  .insert(users)
  .values({ email: "exists@example.com" })
  .onConflictDoNothing({ target: users.email });

// Or catch and handle
import { NeonDbError } from "@neondatabase/serverless";

try {
  await db.insert(users).values({ email: "exists@example.com" });
} catch (error) {
  if (error instanceof NeonDbError && error.code === "23505") {
    // Unique violation
    return { error: "Email already exists" };
  }
  throw error;
}
```

### 4. Using Wrong Driver for Edge Runtime

```typescript
// ❌ Wrong - node-postgres won't work in Edge
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const runtime = "edge"; // Will fail!

// ✅ Correct - use Neon serverless
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

export const runtime = "edge";
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });
```

### 5. Forgetting to Await Transactions

```typescript
// ❌ Wrong - transaction not awaited
async function createUserWithPosts(data: NewUser) {
  db.transaction(async (tx) => {
    // Operations...
  }); // Missing await!
}

// ✅ Correct - always await transactions
async function createUserWithPosts(data: NewUser) {
  await db.transaction(async (tx) => {
    // Operations...
  });
}
```

### 6. Not Using `returning()` for New Records

```typescript
// ❌ Wrong - can't access created record
await db.insert(users).values({ email: "user@example.com" });
// No way to get the auto-generated id

// ✅ Correct - use returning()
const [newUser] = await db
  .insert(users)
  .values({ email: "user@example.com" })
  .returning();
// newUser has id, createdAt, etc.
```

### 7. Incorrect Timestamp Usage

```typescript
// ❌ Wrong - timezone issues
export const users = pgTable("users", {
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ✅ Correct - use withTimezone for consistency
export const users = pgTable("users", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
```

### 8. Schema Drift Without Migrations

```typescript
// ❌ Wrong - using push in production
// drizzle.config.ts
export default defineConfig({
  // ...
  // Never use push in production!
});

// ✅ Correct - use migrations in production
// Generate and apply migrations properly
// npx drizzle-kit generate
// npx drizzle-kit migrate
```

### 9. Mixing Local and Neon Drivers

```typescript
// ❌ Wrong - using node-postgres with Neon URL
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// This fails with Neon because pg expects TCP, Neon uses HTTP/WebSocket
const pool = new Pool({ 
  connectionString: "postgresql://neon.tech/..." // Won't work!
});

// ✅ Correct - match driver to database
// For Neon (production/edge):
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

// For local Docker PostgreSQL:
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });
```

**Driver Selection Guide:**

| Environment | Driver | Package | Use Case |
|-------------|--------|---------|----------|
| Local Dev | `node-postgres` | `pg` | Docker PostgreSQL, local TCP connections |
| Production (Node) | `neon-serverless` | `@neondatabase/serverless` | Neon with WebSocket pooling |
| Edge Functions | `neon-http` | `@neondatabase/serverless` | Vercel Edge, Cloudflare Workers |
| Serverless | `neon-http` | `@neondatabase/serverless` | AWS Lambda, Vercel Functions |

### 10. Preparing for v1.0

When v1.0 stable is released, expect these breaking changes:

1. **Relational Query Builder v2** - Complete rewrite
2. **RLS syntax**: `pgTable.withRLS('users', {})` instead of `.enableRLS()`
3. **Array syntax**: `.array('[][]')` instead of `.array().array()`
4. **Drizzle Kit**: `drizzle-kit drop` removed, folders v3 format

Migration guide: https://orm.drizzle.team/docs/relations-v1-v2

---

## Validation Checklist

Before deploying Drizzle ORM to production:

### Schema
- [ ] All required fields marked with `.notNull()`
- [ ] Indexes added for frequently queried columns
- [ ] Foreign keys with proper `onDelete` behavior
- [ ] Timestamps use `{ withTimezone: true }`
- [ ] JSON columns use `.$type<YourType>()` for type safety

### Database Client
- [ ] **Production**: Using `@neondatabase/serverless` for Edge/Neon compatibility
- [ ] **Local Dev**: Using `pg` driver for Docker PostgreSQL
- [ ] Environment variables loaded before database initialization
- [ ] Connection pooling configured for production traffic
- [ ] Database URL uses SSL (`sslmode=require`) in production
- [ ] Driver matches environment (check `Driver Selection Guide`)

### Migrations
- [ ] All schema changes generated as migrations (`drizzle-kit generate`)
- [ ] Migrations tested in staging environment
- [ ] Migrations committed to version control
- [ ] No `drizzle-kit push` used in production

### Server Actions
- [ ] Input validation before database operations
- [ ] Proper error handling with user-friendly messages
- [ ] `revalidatePath` called after mutations
- [ ] SQL injection prevented by using parameterized queries

### Type Safety
- [ ] `inferSelect` and `inferInsert` types exported from schema
- [ ] Database types used in function signatures
- [ ] No `any` types in database-related code

### Performance
- [ ] Indexes added for query patterns
- [ ] Pagination implemented for large datasets
- [ ] N+1 queries avoided using joins or relational queries
- [ ] Transactions used for multi-step operations

---

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs)
- [Drizzle Kit Documentation](https://orm.drizzle.team/docs/kit)
- [Neon PostgreSQL Docs](https://neon.com/docs)
- [Neon Serverless Driver](https://github.com/neondatabase/serverless)
- [Drizzle GitHub](https://github.com/drizzle-team/drizzle-orm)
- [Drizzle Studio](https://orm.drizzle.team/docs/drizzle-studio)

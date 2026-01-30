---
name: better-auth
description: Better Auth integration for Next.js 16 - type-safe authentication with email/password, social providers, 2FA, and session management
license: MIT
compatibility: Next.js 16+, React 19+, TypeScript 5.9+
---

# Better Auth

> Type-safe, self-hosted authentication for Next.js 16 with support for email/password, OAuth providers, two-factor authentication (2FA), and session management.

---

## Quick Reference

| Task | Command/Pattern |
|------|-----------------|
| **Install** | `pnpm add better-auth` |
| **Init auth instance** | `betterAuth({ database, emailAndPassword: { enabled: true } })` |
| **Create client** | `createAuthClient()` from `better-auth/react` |
| **Get session (RSC)** | `await auth.api.getSession({ headers })` |
| **Get session (Client)** | `authClient.useSession()` |
| **API Route** | `toNextJsHandler(auth)` in `/api/auth/[...all]/route.ts` |
| **Protect route** | Check session in page or use cookie check in proxy |

---

## Installation

```bash
# Install Better Auth
pnpm add better-auth

# Install the database adapter of your choice (examples)
pnpm add @better-auth/sqlite
pnpm add @better-auth/prisma
pnpm add drizzle-orm
```

### Environment Variables

```bash
# .env
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
```

**Generate secret:**
```bash
openssl rand -base64 32
```

---

## Core Patterns

### 1. Auth Instance (Server)

Create `lib/auth.ts` (or `src/lib/auth.ts`):

```typescript
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  // Database adapter (example with SQLite)
  database: {
    provider: "sqlite",
    url: "./db.sqlite",
  },
  
  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    // Optional: require email verification
    requireEmailVerification: true,
    // Optional: auto sign-in after sign-up
    autoSignInAfterSignUp: true,
  },
  
  // Social providers
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  
  // Plugins
  plugins: [
    nextCookies(), // REQUIRED for Server Actions - must be last in array
  ],
});

// Export type for TypeScript inference
export type Auth = typeof auth;
```

### 2. API Route Handler

Create `app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

**Note:** The catch-all route `[...all]` handles all auth endpoints under `/api/auth/*`.

### 3. Auth Client

Create `lib/auth-client.ts`:

```typescript
"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Optional: custom base URL if different from current domain
  // baseURL: "http://localhost:3000"
});

// Export specific methods (optional but recommended)
export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession,
  getSession,
  forgetPassword,
  resetPassword,
} = authClient;
```

### 4. Session in React Server Components

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>Welcome {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
    </div>
  );
}
```

### 5. Session in Client Components

```typescript
"use client";

import { authClient, useSession } from "@/lib/auth-client";

export function UserNav() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <a href="/sign-in">Sign In</a>;
  }

  return (
    <div>
      <span>{session.user.name}</span>
      <button onClick={() => authClient.signOut()}>
        Sign Out
      </button>
    </div>
  );
}
```

### 6. Sign In / Sign Up Forms

```typescript
"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard", // Redirect after sign-in
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### 7. Server Actions with Auth

With `nextCookies()` plugin, cookies are set automatically:

```typescript
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateProfile(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Perform authenticated action
  const name = formData.get("name") as string;
  
  await auth.api.updateUser({
    body: { name },
    headers: await headers(),
  });
}
```

### 8. Route Protection (Next.js 16 Proxy)

Create `proxy.ts` in project root:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  // Fast cookie-only check (optimistic redirect)
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

**Important:** For secure authorization, always verify the session in the page/component, not just in proxy.

---

## Database Setup

### Using CLI (Recommended)

```bash
# Generate migration/schema
npx @better-auth/cli generate

# Apply directly (Kysely adapter only)
npx @better-auth/cli migrate
```

### Programmatic Migrations (Edge/Serverless)

For Cloudflare Workers, Deno Deploy, or when CLI isn't available:

```typescript
import { getMigrations } from "better-auth/db";

// Check and run migrations
const { toBeCreated, toBeAdded, runMigrations, compileMigrations } = 
  await getMigrations(authOptions);

console.log("Tables to create:", toBeCreated);
console.log("Fields to add:", toBeAdded);

// Run migrations
await runMigrations();

// Or get SQL to run manually
const sql = await compileMigrations();
```

**Cloudflare Workers Example:**

```typescript
app.post("/migrate", async (c) => {
  const authConfig = {
    database: c.env.DB, // D1 binding
    // ... rest of config
  };

  const { runMigrations } = await getMigrations(authConfig);
  await runMigrations();
  
  return c.json({ message: "Migrations completed" });
});
```

**Note:** Programmatic migrations work only with built-in Kysely adapter (SQLite, PostgreSQL, MySQL). For Prisma/Drizzle, use their migration tools.

### Manual Schema (Core Tables)

```sql
-- User table
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  emailVerified INTEGER,
  name TEXT,
  image TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- Session table
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  userId TEXT NOT NULL REFERENCES user(id),
  expiresAt INTEGER NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- Account table (for OAuth)
CREATE TABLE account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id),
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  accessTokenExpiresAt INTEGER,
  refreshTokenExpiresAt INTEGER,
  scope TEXT,
  idToken TEXT,
  password TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  UNIQUE(userId, providerId, accountId)
);

-- Verification table
CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  createdAt INTEGER,
  updatedAt INTEGER
);
```

### Secondary Storage (Redis, etc.)

Offload session data and rate limiting to key-value stores:

```typescript
import { createClient } from "redis";

const redis = createClient();
await redis.connect();

export const auth = betterAuth({
  secondaryStorage: {
    get: async (key) => {
      return await redis.get(key);
    },
    set: async (key, value, ttl) => {
      if (ttl) {
        await redis.set(key, value, { EX: ttl });
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
});
```

---

## Session Configuration

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days (default)
    updateAge: 60 * 60 * 24,      // Update expiration every 1 day
    
    // Cookie cache for performance (optional)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
      strategy: "compact", // "compact" | "jwt" | "jwe"
    },
    
    // Freshness check for sensitive operations
    freshAge: 60 * 5, // 5 minutes
  },
});
```

### Cookie Cache Strategies

| Strategy | Size | Security | Use Case |
|----------|------|----------|----------|
| `compact` (default) | Smallest | Signed | Performance-critical, internal |
| `jwt` | Medium | Signed | JWT compatibility, external APIs |
| `jwe` | Largest | Encrypted | Maximum security, compliance |

---

## Common Pitfalls

### ❌ Wrong Import Path for Client

```typescript
// WRONG - imports server code
import { createAuthClient } from "better-auth";

// CORRECT - imports React client
import { createAuthClient } from "better-auth/react";
```

### ❌ Missing nextCookies Plugin

```typescript
// WRONG - Server Actions can't set cookies
export const auth = betterAuth({
  // ...config without plugins
});

// CORRECT - Cookies work in Server Actions
export const auth = betterAuth({
  // ...config
  plugins: [nextCookies()], // Must be LAST in array
});
```

### ❌ Forgetting Headers in getSession

```typescript
// WRONG - headers() returns a Promise in Next.js 15+
const session = await auth.api.getSession({
  headers: headers(), // ❌
});

// CORRECT - await headers()
const session = await auth.api.getSession({
  headers: await headers(), // ✓
});
```

### ❌ Using middleware.ts in Next.js 16

```typescript
// WRONG - Next.js 16 uses proxy.ts not middleware.ts
// middleware.ts won't work properly

// CORRECT - Use proxy.ts
// Create proxy.ts in project root with proxy() function
```

### ❌ Calling auth.api without Type Inference

```typescript
// Type inference requires importing the auth instance type
import { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

// Now session is properly typed
const session = await auth.api.getSession({ headers: await headers() });
```

### ❌ Trusting Proxy Check Alone

```typescript
// WRONG - Cookie-only check can be spoofed
export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) redirect("/sign-in"); // Can be bypassed
}

// CORRECT - Always verify in page/component
export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in"); // Secure
}
```

---

## Two-Factor Authentication (2FA)

### Setup

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  appName: "My App",
  plugins: [
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          // Send OTP via email/SMS
          await sendEmail(user.email, `Your code: ${otp}`);
        },
      },
    }),
    nextCookies(),
  ],
});
```

### Client Setup

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        // Redirect to 2FA verification page
        window.location.href = "/2fa";
      },
    }),
  ],
});
```

### Enable 2FA

```typescript
const { data, error } = await authClient.twoFactor.enable({
  password: "current-password",
});

// Returns: { totpURI, backupCodes }
// Display QR code from totpURI for user to scan
```

### Verify TOTP

```typescript
const { error } = await authClient.twoFactor.verifyTotp({
  code: "123456",
  trustDevice: true, // Skip 2FA for 30 days
});
```

---

## Social Sign-On (OAuth)

### Configuration

```typescript
export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // Optional: redirect URI
      redirectURI: "http://localhost:3000/api/auth/callback/github",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    // ...other providers
  },
});
```

### Usage

```typescript
// Sign in with social provider
await authClient.signIn.social({
  provider: "github",
  callbackURL: "/dashboard",
});
```

---

## User Management

### Update User Information

```typescript
await authClient.updateUser({
  name: "John Doe",
  image: "https://example.com/avatar.jpg",
});
```

### Change Email

Enable in auth config:

```typescript
export const auth = betterAuth({
  user: {
    changeEmail: {
      enabled: true,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        text: `Click here: ${url}`,
      });
    },
  },
});
```

Client usage:

```typescript
await authClient.changeEmail({
  newEmail: "new@example.com",
  callbackURL: "/dashboard",
});
```

### Change Password

```typescript
const { data, error } = await authClient.changePassword({
  currentPassword: "old-password",
  newPassword: "new-password",
  revokeOtherSessions: true, // Sign out from other devices
});
```

### Delete User Account

Enable in auth config:

```typescript
export const auth = betterAuth({
  user: {
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }) => {
        await sendEmail({
          to: user.email,
          subject: "Confirm account deletion",
          text: `Click to delete: ${url}`,
        });
      },
    },
  },
});
```

Client usage (requires password or fresh session):

```typescript
// With password
await authClient.deleteUser({
  password: "current-password",
  callbackURL: "/goodbye",
});

// With fresh session (signed in recently)
await authClient.deleteUser({
  callbackURL: "/goodbye",
});
```

---

## Popular Plugins

### Username Plugin

Add username support for email/password auth.

**Server setup:**

```typescript
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";

export const auth = betterAuth({
  emailAndPassword: { enabled: true },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      usernameValidator: (username) => {
        // Return false to reject username
        return !["admin", "root"].includes(username.toLowerCase());
      },
    }),
    nextCookies(),
  ],
});
```

**Client setup:**

```typescript
import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [usernameClient()],
});
```

**Usage:**

```typescript
// Sign up with username
await authClient.signUp.email({
  email: "user@example.com",
  username: "johndoe",
  password: "password123",
  name: "John Doe",
});

// Sign in with username
await authClient.signIn.username({
  username: "johndoe",
  password: "password123",
});

// Check availability
const { data } = await authClient.isUsernameAvailable({
  username: "johndoe",
});
// data.available: boolean
```

### Organization Plugin (Multi-tenancy)

Manage teams, roles, and permissions.

**Server setup:**

```typescript
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    organization({
      allowUserToCreateOrganization: async (user) => {
        // Restrict organization creation
        return user.plan === "pro";
      },
      organizationHooks: {
        beforeCreateOrganization: async ({ organization, user }) => {
          // Modify organization data
          return {
            data: {
              ...organization,
              metadata: { createdBy: user.id },
            },
          };
        },
        afterCreateOrganization: async ({ organization, member }) => {
          // Send notifications, setup defaults
        },
      },
    }),
    nextCookies(),
  ],
});
```

**Client setup:**

```typescript
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [organizationClient()],
});
```

**Usage:**

```typescript
// Create organization
const { data } = await authClient.organization.create({
  name: "Acme Corp",
  slug: "acme-corp",
  logo: "https://example.com/logo.png",
});

// List organizations
const { data: orgs } = await authClient.organization.list();

// Set active organization
await authClient.organization.setActive({
  organizationId: "org-id",
});

// Invite member
await authClient.organization.inviteMember({
  email: "new@example.com",
  role: "member",
});

// Check slug availability
const { data } = await authClient.organization.checkSlug({
  slug: "acme-corp",
});
```

### Passkey Plugin (WebAuthn)

Passwordless authentication with biometrics/security keys.

**Install:**

```bash
pnpm add @better-auth/passkey
```

**Server setup:**

```typescript
import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";

export const auth = betterAuth({
  plugins: [passkey(), nextCookies()],
});
```

**Client setup:**

```typescript
import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  plugins: [passkeyClient()],
});
```

**Usage:**

```typescript
// Register passkey (user must be signed in)
const { data, error } = await authClient.passkey.addPasskey({
  name: "My Laptop",
  authenticatorAttachment: "platform", // or "cross-platform"
});

// Sign in with passkey
const { data, error } = await authClient.signIn.passkey({
  autoFill: true, // Conditional UI support
});

// List passkeys
const { data: passkeys } = await authClient.passkey.listUserPasskeys();

// Delete passkey
await authClient.passkey.deletePasskey({
  id: "passkey-id",
});
```

**Conditional UI (Auto-fill):**

Add `webauthn` to autocomplete attributes:

```html
<input type="text" name="email" autocomplete="username webauthn" />
<input type="password" name="password" autocomplete="current-password webauthn" />
```

Preload on component mount:

```typescript
useEffect(() => {
  authClient.signIn.passkey({ autoFill: true });
}, []);
```

---

## Cookies & Advanced Configuration

### Cookie Prefix

Change the default cookie prefix (`better-auth`):

```typescript
export const auth = betterAuth({
  advanced: {
    cookiePrefix: "my-app",
  },
});
```

### Custom Cookie Options

```typescript
export const auth = betterAuth({
  advanced: {
    cookies: {
      session_token: {
        name: "custom_session",
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        },
      },
    },
  },
});
```

### Cross-Subdomain Cookies

Share session across subdomains:

```typescript
export const auth = betterAuth({
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: "example.com", // Root domain
    },
  },
  trustedOrigins: [
    "https://app1.example.com",
    "https://app2.example.com",
  ],
});
```

### Force Secure Cookies

```typescript
export const auth = betterAuth({
  advanced: {
    useSecureCookies: true, // Always use secure cookies
  },
});
```

---

## Hooks

Hooks let you customize Better Auth's behavior without writing a full plugin.

### Before Hooks

Execute logic before an endpoint:

```typescript
import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";

export const auth = betterAuth({
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Only run on sign-up
      if (ctx.path !== "/sign-up/email") {
        return;
      }

      // Validate email domain
      if (!ctx.body?.email.endsWith("@company.com")) {
        throw new APIError("BAD_REQUEST", {
          message: "Only company emails allowed",
        });
      }
    }),
  },
});
```

### After Hooks

Execute logic after an endpoint:

```typescript
export const auth = betterAuth({
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up")) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          // Send welcome notification
          await sendWelcomeEmail(newSession.user.email);
        }
      }
    }),
  },
});
```

### Modify Request Context

```typescript
export const auth = betterAuth({
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              name: ctx.body.name || "Anonymous",
            },
          },
        };
      }
    }),
  },
});
```

### Available Context Properties

| Property | Description |
|----------|-------------|
| `ctx.path` | Current endpoint path |
| `ctx.body` | Parsed request body |
| `ctx.headers` | Request headers |
| `ctx.query` | Query parameters |
| `ctx.context.newSession` | Newly created session (after hooks only) |
| `ctx.context.secret` | Auth secret |
| `ctx.context.password.hash/verify` | Password utilities |
| `ctx.context.adapter` | Database adapter methods |
| `ctx.context.generateId()` | ID generator |

### Cookie Operations in Hooks

```typescript
createAuthMiddleware(async (ctx) => {
  // Set cookie
  ctx.setCookies("my-cookie", "value");
  
  // Set signed cookie
  await ctx.setSignedCookie("signed-cookie", "value", ctx.context.secret, {
    maxAge: 3600,
  });
  
  // Get cookie
  const value = ctx.getCookies("my-cookie");
});
```

---

## Database Adapters

### Prisma Adapter

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "sqlite", "mysql"
  }),
  experimental: {
    joins: true, // Enable database joins (2-3x performance boost)
  },
});
```

**Generate Prisma schema:**

```bash
npx @better-auth/cli generate
```

### Drizzle Adapter

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "postgresql",
  }),
});
```

### Built-in Adapters (No ORM)

```typescript
// SQLite
export const auth = betterAuth({
  database: {
    provider: "sqlite",
    url: "./db.sqlite",
  },
});

// PostgreSQL
export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL,
  },
});

// MySQL
export const auth = betterAuth({
  database: {
    provider: "mysql",
    url: process.env.DATABASE_URL,
  },
});
```

---

## Admin Plugin

Administrative functions for user management.

**Server setup:**

```typescript
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    admin({
      adminUserIds: ["user-id-1", "user-id-2"], // Specific admin users
      // OR rely on role: "admin"
    }),
    nextCookies(),
  ],
});
```

**Client setup:**

```typescript
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient()],
});
```

**Admin operations:**

```typescript
// Create user
const { data } = await authClient.admin.createUser({
  email: "new@example.com",
  password: "password",
  name: "New User",
  role: "user",
});

// List users with pagination
const { data } = await authClient.admin.listUsers({
  query: {
    limit: 10,
    offset: 0,
    searchValue: "john",
    searchField: "name",
  },
});

// Ban/unban user
await authClient.admin.banUser({
  userId: "user-id",
  banReason: "Spam",
  banExpiresIn: 60 * 60 * 24 * 7, // 7 days
});

await authClient.admin.unbanUser({ userId: "user-id" });

// Set role
await authClient.admin.setRole({
  userId: "user-id",
  role: "admin",
});

// Impersonate user (create session as another user)
await authClient.admin.impersonateUser({
  userId: "user-id",
});

// Revoke all user sessions
await authClient.admin.revokeUserSessions({ userId: "user-id" });
```

---

## Best Practices

### 1. Environment Variables

```bash
# Required
BETTER_AUTH_SECRET=         # Min 32 chars
BETTER_AUTH_URL=            # Public URL

# OAuth Providers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database (if using connection string)
DATABASE_URL=
```

### 2. Secure Configuration

```typescript
export const auth = betterAuth({
  // Use strong secret
  secret: process.env.BETTER_AUTH_SECRET,
  
  // Trust only your domains
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL!,
    "https://app.example.com",
  ],
  
  // Secure cookies in production
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: true,
      domain: "example.com",
    },
  },
  
  // Reasonable session settings
  session: {
    expiresIn: 60 * 60 * 24 * 7,     // 7 days
    updateAge: 60 * 60 * 24,          // Update daily
    freshAge: 60 * 60,                // 1 hour for sensitive ops
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,                 // 5 min cache
    },
  },
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  
  plugins: [nextCookies()], // Always last
});
```

### 3. Type Safety

```typescript
// lib/auth.ts
export const auth = betterAuth({ /* config */ });
export type Auth = typeof auth;

// Use inferred types
type Session = Auth["$Infer"]["Session"];
type User = Auth["$Infer"]["User"];
```

### 4. Error Handling

```typescript
const { data, error } = await authClient.signIn.email({
  email,
  password,
});

if (error) {
  // Handle specific error types
  switch (error.code) {
    case "INVALID_CREDENTIALS":
      // Show invalid credentials message
      break;
    case "EMAIL_NOT_VERIFIED":
      // Redirect to verification page
      break;
    default:
      // Generic error
  }
}
```

---

## Troubleshooting

### Session not persisting

- ✅ `nextCookies()` plugin added and is **last** in plugins array
- ✅ `BETTER_AUTH_SECRET` is at least 32 characters
- ✅ `BETTER_AUTH_URL` matches the actual URL
- ✅ Database tables created (run `npx @better-auth/cli migrate`)

### OAuth callback fails

- ✅ Redirect URI configured correctly in provider dashboard
- ✅ `http://localhost:3000/api/auth/callback/github` (example)
- ✅ No trailing slash mismatch

### CORS errors

- ✅ `trustedOrigins` includes your domain
- ✅ Protocol matches (`https://` in production)

### TypeScript errors with client

- ✅ Import from `better-auth/react` not `better-auth`
- ✅ Client plugins match server plugins

### Rate limiting in development

Better Auth has built-in rate limiting. For development:

```typescript
export const auth = betterAuth({
  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
  },
});
```

---

## Validation Checklist

Before deploying auth features:

- [ ] `BETTER_AUTH_SECRET` is set and ≥ 32 characters
- [ ] `BETTER_AUTH_URL` matches production URL
- [ ] Database schema created (migrations applied)
- [ ] API route `/api/auth/[...all]` created
- [ ] `nextCookies()` plugin added (last in plugins array)
- [ ] Client imported from `better-auth/react`
- [ ] Server-side session checks use `await headers()`
- [ ] OAuth redirect URIs configured in provider dashboards
- [ ] Email verification configured (if required)
- [ ] Session `freshAge` appropriate for sensitive operations
- [ ] Rate limiting configured for auth endpoints
- [ ] `trustedOrigins` includes all production domains
- [ ] Secure cookies enabled for production
- [ ] Database backups configured before running migrations
- [ ] Admin users configured (if using admin plugin)

---

## Official Documentation

- **Main Docs:** https://www.better-auth.com/docs
- **Next.js Integration:** https://www.better-auth.com/docs/integrations/next
- **Installation:** https://www.better-auth.com/docs/installation
- **Session Management:** https://www.better-auth.com/docs/concepts/session-management
- **Plugins (2FA, etc.):** https://www.better-auth.com/docs/plugins/2fa

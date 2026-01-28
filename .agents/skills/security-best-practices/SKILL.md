---
name: security-best-practices
description: Security best practices for Next.js 16, React 19, authentication, and web application protection
license: MIT
compatibility: Next.js >=16.0.0, React >=19.0.0
---

# Security Best Practices Skill

Comprehensive security guide for Next.js 16 and React 19 applications. Protect against XSS, CSRF, injection attacks, and implement secure authentication.

---

## Security Checklist

Use this checklist for every feature:

```markdown
□ Input validation (Zod) on client AND server
□ Output encoding (prevent XSS)
□ Authentication required for sensitive routes
□ CSRF protection for mutations
□ Rate limiting on APIs
□ Secure headers configured
□ Secrets in environment variables only
□ SQL/NoSQL injection prevention
□ File upload restrictions
□ Error messages don't leak sensitive info
```

---

## Next.js 16 Security Configuration

### Secure Headers (next.config.ts)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Content Security Policy (CSP)

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data:",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};
```

**Note:** `'unsafe-inline'` is needed for Next.js but remove in production if possible.

### Secure Cookies

```typescript
// Server Action or API Route
import { cookies } from "next/headers";

export async function setSecureCookie(name: string, value: string) {
  const cookieStore = await cookies();
  
  cookieStore.set(name, value, {
    httpOnly: true,        // Not accessible via JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only
    sameSite: "strict",    // CSRF protection
    maxAge: 60 * 60 * 24,  // 24 hours
    path: "/",
  });
}
```

---

## Input Validation & Sanitization

### Zod Validation (Recommended)

```typescript
import { z } from "zod";

// Define schema once, use everywhere
const userSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character"),
  name: z
    .string()
    .min(2)
    .max(100)
    .transform((val) => val.trim()), // Sanitize
});

// Server Action with validation
"use server";

export async function createUser(formData: FormData) {
  const rawData = Object.fromEntries(formData);
  
  const result = userSchema.safeParse(rawData);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  
  // Now safe to use result.data
  const { email, password, name } = result.data;
  // ... create user
}
```

### URL Parameter Validation

```typescript
// app/users/[id]/page.tsx
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
});

export default async function UserPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const result = paramsSchema.safeParse({ id });
  if (!result.success) {
    notFound(); // Or redirect to error page
  }
  
  const user = await fetchUser(result.data.id);
  // ...
}
```

### Search Params Validation

```typescript
// app/search/page.tsx
import { z } from "zod";

const searchParamsSchema = z.object({
  q: z.string().max(200).optional(),
  page: z.coerce.number().min(1).max(100).default(1),
  category: z.enum(["all", "tech", "design"]).default("all"),
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  const result = searchParamsSchema.safeParse(params);
  if (!result.success) {
    // Return safe defaults or error
    return <div>Invalid search parameters</div>;
  }
  
  const { q, page, category } = result.data;
  // ... perform search
}
```

---

## XSS Prevention

### Never Use dangerouslySetInnerHTML

```tsx
// ❌ BAD - Vulnerable to XSS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ GOOD - Use React's built-in escaping
<div>{userInput}</div>

// ✅ GOOD - If HTML needed, sanitize first
import DOMPurify from "dompurify";

const sanitized = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

### URL Validation

```typescript
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http/https
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Usage
const userProvidedUrl = "javascript:alert('xss')"; // Attack attempt
if (isValidUrl(userProvidedUrl)) {
  // Safe to use
}
```

### CSS Injection Prevention

```tsx
// ❌ BAD - CSS injection possible
<div style={{ color: userInput }} />

// ✅ GOOD - Whitelist allowed values
const allowedColors = ["red", "blue", "green"] as const;
const color = allowedColors.includes(userInput) ? userInput : "black";
<div style={{ color }} />
```

---

## CSRF Protection

### SameSite Cookies (Primary Defense)

```typescript
// Already configured in cookie settings above
// sameSite: "strict" or "lax"
```

### CSRF Token for Sensitive Operations

```typescript
// lib/csrf.ts
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

export async function generateCsrfToken() {
  const token = randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  
  cookieStore.set("csrf-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  
  return token;
}

export async function validateCsrfToken(token: string) {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get("csrf-token")?.value;
  
  if (!storedToken || storedToken !== token) {
    throw new Error("Invalid CSRF token");
  }
}
```

```tsx
// Server Action with CSRF protection
"use server";

export async function sensitiveAction(formData: FormData) {
  const csrfToken = formData.get("csrf-token") as string;
  await validateCsrfToken(csrfToken);
  
  // Proceed with action
}
```

---

## SQL/NoSQL Injection Prevention

### Never Concatenate SQL

```typescript
// ❌ BAD - SQL Injection vulnerable
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ GOOD - Parameterized queries (Prisma example)
const user = await prisma.user.findUnique({
  where: { email: validatedEmail },
});

// ✅ GOOD - Raw query with parameters
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${validatedEmail}
`;
```

### MongoDB/NoSQL Safety

```typescript
// ❌ BAD - NoSQL injection possible
const user = await db.users.findOne({ email: userInput });

// ✅ GOOD - Validate before query
const validatedEmail = z.string().email().parse(userInput);
const user = await db.users.findOne({ email: validatedEmail });

// ❌ BAD - Object injection
const query = { [userInput]: value };

// ✅ GOOD - Whitelist keys
const allowedFields = ["name", "email", "age"] as const;
if (allowedFields.includes(userInput)) {
  const query = { [userInput]: value };
}
```

---

## Rate Limiting

### API Route Rate Limiting

```typescript
// lib/rate-limit.ts
import { LRUCache } from "lru-cache";

const rateLimitCache = new LRUCache({
  max: 500,
  ttl: 60 * 1000, // 1 minute
});

export function rateLimit(
  identifier: string,
  limit: number = 10
): { success: boolean; limit: number; remaining: number } {
  const current = (rateLimitCache.get(identifier) as number) || 0;
  
  if (current >= limit) {
    return { success: false, limit, remaining: 0 };
  }
  
  rateLimitCache.set(identifier, current + 1);
  
  return {
    success: true,
    limit,
    remaining: limit - current - 1,
  };
}
```

```typescript
// app/api/users/route.ts
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "anonymous";
  
  const limit = rateLimit(ip, 5); // 5 requests per minute
  
  if (!limit.success) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }
  
  // Proceed with request
}
```

### Production Rate Limiting (Redis)

```typescript
// For production, use Upstash Redis or similar
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function rateLimitWithRedis(
  identifier: string,
  limit: number = 10,
  window: number = 60
) {
  const key = `rate_limit:${identifier}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  return {
    success: current <= limit,
    limit,
    remaining: Math.max(0, limit - current),
  };
}
```

---

## Secure Authentication Patterns

### Password Hashing

```typescript
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### JWT Best Practices

```typescript
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createToken(payload: object) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .setAudience("your-app")
    .setIssuer("your-app")
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: ["HS256"],
      audience: "your-app",
      issuer: "your-app",
    });
    return payload;
  } catch {
    return null;
  }
}
```

### Session Management

```typescript
// lib/session.ts
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function createSession(userId: string) {
  const sessionId = randomUUID();
  
  // Store in database with expiration
  await db.sessions.create({
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  
  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("session-id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  });
  
  return sessionId;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session-id")?.value;
  
  if (!sessionId) return null;
  
  const session = await db.sessions.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
  
  if (!session || session.expiresAt < new Date()) {
    // Clear expired session
    cookieStore.delete("session-id");
    return null;
  }
  
  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session-id")?.value;
  
  if (sessionId) {
    await db.sessions.delete({ where: { id: sessionId } });
  }
  
  cookieStore.delete("session-id");
}
```

---

## File Upload Security

### Validation

```typescript
import { z } from "zod";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const fileSchema = z.instanceof(File).refine(
  (file) => ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number]),
  "Invalid file type. Only JPEG, PNG, WebP allowed."
).refine(
  (file) => file.size <= MAX_SIZE,
  "File too large. Max 5MB."
);

// Server Action
"use server";

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;
  
  const result = fileSchema.safeParse(file);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }
  
  // Generate safe filename
  const ext = file.name.split(".").pop()?.toLowerCase();
  const safeName = `${randomUUID()}.${ext}`;
  
  // Store file (S3, local, etc.)
  // ...
}
```

### Image Processing

```typescript
// Use sharp to process images
import sharp from "sharp";

export async function processImage(buffer: Buffer) {
  // Validate it's actually an image
  const metadata = await sharp(buffer).metadata();
  
  if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format)) {
    throw new Error("Invalid image format");
  }
  
  // Strip metadata (EXIF) to prevent information leakage
  return sharp(buffer)
    .resize(1200, 1200, { fit: "inside" })
    .withMetadata({ exif: {} })
    .toBuffer();
}
```

---

## Environment Variables

### Secure Configuration

```bash
# .env.local (never commit this!)
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/db"

# Auth
JWT_SECRET="your-super-secret-min-32-chars-long"
NEXTAUTH_SECRET="another-super-secret"

# APIs
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Third-party
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### Access Pattern

```typescript
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
});

// Validate on startup
const env = envSchema.parse(process.env);

export default env;
```

```typescript
// ❌ BAD - Exposed to client
const secret = process.env.STRIPE_SECRET_KEY;

// ✅ GOOD - Only server-side
"use server";
const secret = process.env.STRIPE_SECRET_KEY;

// ✅ GOOD - Explicitly public
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

---

## Error Handling Security

### Don't Leak Information

```typescript
// ❌ BAD - Leaks implementation details
try {
  await db.user.create({ data });
} catch (error) {
  return { error: `Database error: ${error.message}` };
  // Might leak: "Database error: column 'password' does not exist"
}

// ✅ GOOD - Generic error messages
try {
  await db.user.create({ data });
} catch (error) {
  console.error("User creation failed:", error); // Log for debugging
  return { error: "Failed to create user. Please try again." };
}
```

### Different Errors for Dev/Prod

```typescript
export function handleError(error: unknown) {
  if (process.env.NODE_ENV === "development") {
    // Detailed error for debugging
    console.error(error);
    return {
      error: "Server error",
      details: error instanceof Error ? error.message : String(error),
    };
  }
  
  // Generic message in production
  return { error: "An unexpected error occurred" };
}
```

---

## Dependencies Security

### Regular Audits

```bash
# Check for vulnerabilities
pnpm audit

# Fix automatically
pnpm audit --fix

# Check specific package
npm audit fix --package-name <package>
```

### Lock File Integrity

```bash
# Ensure lock file is up to date
pnpm install --frozen-lockfile

# In CI/CD
pnpm ci  # Uses lock file strictly
```

### Dependency Updates

```bash
# Check outdated packages
pnpm outdated

# Update with caution
pnpm update --interactive
```

---

## Quick Security Command Reference

```bash
# Run security audit
pnpm audit

# Check for secrets in git history
git log --all --full-history -- .env

# Scan for secrets in code
grep -r "password\|secret\|key" --include="*.ts" --include="*.tsx" .

# Check file permissions
ls -la .env*

# Should be: -rw------- (600) or -rw-r--r-- (644) max
```

---

## Resources

- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [Security Headers](https://securityheaders.com/)

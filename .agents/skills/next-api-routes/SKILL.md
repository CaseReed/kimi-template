---
name: next-api-routes
description: API Routes and Server Actions for Next.js 16 with validation and error handling. Use when building REST APIs, server actions, form submissions, data mutations, or backend logic in Next.js App Router.
license: MIT
compatibility: Next.js >=16, React >=19
---

# Next.js API Routes & Server Actions

Complete guide for building backend logic in Next.js App Router using Route Handlers and Server Actions.

## Route Handlers (App Router)

Route Handlers provide a flexible way to create REST endpoints within the `app` directory.

### File Structure

```
app/
├── api/
│   ├── users/
│   │   ├── route.ts          # GET /api/users, POST /api/users
│   │   └── [id]/
│   │       └── route.ts      # GET /api/users/123, PUT /api/users/123
│   └── posts/
│       └── route.ts
```

### HTTP Methods

Export named functions matching HTTP methods:

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const users = await db.user.findMany();
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json({ user }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.update({ where: { id: body.id }, data: body });
  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.update({ 
    where: { id: body.id }, 
    data: { name: body.name } 
  });
  return NextResponse.json({ user });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  await db.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

### Dynamic Routes

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id } });
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const user = await db.user.update({ where: { id }, data: body });
  return NextResponse.json({ user });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await db.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

### Query Parameters & Headers

```typescript
export async function GET(request: NextRequest) {
  // Query parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '10');
  const search = searchParams.get('search');
  
  // Headers
  const authHeader = request.headers.get('authorization');
  const userAgent = request.headers.get('user-agent');
  
  return NextResponse.json({ page, limit, search });
}
```

## Server Actions

Server Actions allow server-side mutations to be called directly from components.

### Basic Server Action

```typescript
// app/actions/user.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  const user = await db.user.create({
    data: { name, email }
  });
  
  revalidatePath('/users');
  return { success: true, user };
}
```

### Form Action Usage

```tsx
// app/users/page.tsx
import { createUser } from '@/app/actions/user';

export default function UserForm() {
  return (
    <form action={createUser}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Create User</button>
    </form>
  );
}
```

### Programmatic Server Action (React 19)

Use `useActionState` for form actions without forms:

```tsx
'use client';

import { useActionState } from 'react';
import { updateUser } from '@/app/actions/user';

export function EditUserButton({ userId }: { userId: string }) {
  const [state, dispatch, isPending] = useActionState(
    async () => {
      return await updateUser(userId, { name: 'New Name' });
    },
    null
  );
  
  return (
    <button onClick={() => dispatch()} disabled={isPending}>
      {isPending ? 'Updating...' : 'Update User'}
    </button>
  );
}
```

> **Note**: The legacy pattern with manual `useState` (pre-React 19) is deprecated. Always use `useActionState` for action pending states.

### Server Action with bind()

```typescript
// app/actions/user.ts
'use server';

export async function updateUser(
  prevState: { success: boolean; message: string } | null,
  formData: FormData
) {
  const userId = formData.get('userId') as string;
  const name = formData.get('name') as string;
  
  const user = await db.user.update({
    where: { id: userId },
    data: { name }
  });
  
  return { success: true, message: 'User updated!' };
}
```

```tsx
// app/users/[id]/page.tsx
'use client';

import { useActionState } from 'react';
import { updateUser } from '@/app/actions/user';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [state, formAction, isPending] = useActionState(updateUser, null);
  
  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={id} />
      <input name="name" placeholder="New Name" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Updating...' : 'Update'}
      </button>
      {state?.success && <p>{state.message}</p>}
    </form>
  );
}
```

### Revalidation

```typescript
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function createPost(data: PostData) {
  await db.post.create({ data });
  
  // Revalidate specific path
  revalidatePath('/posts');
  revalidatePath(`/users/${data.authorId}`);
  
  // Revalidate by cache tag
  revalidateTag('posts');
  
  return { success: true };
}
```

## Validation with Zod

### Schema Definitions

```typescript
// lib/validations/user.ts
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  age: z.number().int().min(0).max(150).optional(),
  role: z.enum(['user', 'admin', 'moderator']).default('user'),
  isActive: z.boolean().default(true),
  metadata: z.record(z.unknown()).optional(),
});

export const userUpdateSchema = userSchema.partial().omit({ id: true });

// For API query parameters
export const userListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type inference
export type User = z.infer<typeof userSchema>;
export type UserInput = z.input<typeof userSchema>;
```

### Parsing in Route Handlers

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { userSchema, userListSchema } from '@/lib/validations/user';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = userSchema.parse(body);
    
    const user = await db.user.create({ data: validatedData });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const validatedParams = userListSchema.parse(params);
    
    const users = await db.user.findMany({
      skip: (validatedParams.page - 1) * validatedParams.limit,
      take: validatedParams.limit,
    });
    
    return NextResponse.json({ users, pagination: validatedParams });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', issues: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

### Parsing in Server Actions

```typescript
// app/actions/user.ts
'use server';

import { userSchema } from '@/lib/validations/user';
import { ZodError } from 'zod';

export async function createUser(prevState: unknown, formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      age: formData.get('age') ? Number(formData.get('age')) : undefined,
    };
    
    const validatedData = userSchema.parse(rawData);
    const user = await db.user.create({ data: validatedData });
    
    return { success: true, user };
  } catch (error) {
    if (error instanceof ZodError) {
      return { 
        success: false, 
        errors: error.flatten().fieldErrors 
      };
    }
    throw error;
  }
}
```

## Error Handling

### Custom Error Classes

```typescript
// lib/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id ${id} not found` : `${resource} not found`,
      404,
      'NOT_FOUND'
    );
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}
```

### Global Error Handler

```typescript
// lib/api-error-handler.ts
import { NextResponse } from 'next/server';
import { ApiError } from './errors';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  // Custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      { 
        error: error.message, 
        code: error.code,
        ...(error instanceof ValidationError && error.fields 
          ? { fields: error.fields } 
          : {})
      },
      { status: error.statusCode }
    );
  }
  
  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation failed', 
        code: 'VALIDATION_ERROR',
        issues: error.issues 
      },
      { status: 400 }
    );
  }
  
  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Unique constraint violation', code: 'DUPLICATE' },
        { status: 409 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
  }
  
  // Default error
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
```

### Using Error Handler in Routes

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { NotFoundError, ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const users = await db.user.findMany();
    return NextResponse.json({ users });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.email) {
      throw new ValidationError('Email is required');
    }
    
    const user = await db.user.create({ data: body });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Rate Limiting

### Simple In-Memory Rate Limiting

```typescript
// lib/rate-limit.ts
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { success: boolean; limit: number; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }
  
  if (entry.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  entry.count++;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}
```

### Rate Limiting in Routes

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/utils';

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = getClientIP(request);
  const limit = rateLimit(ip, 5, 60000); // 5 requests per minute
  
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit.limit),
          'X-RateLimit-Remaining': String(limit.remaining),
          'X-RateLimit-Reset': String(limit.resetTime),
        }
      }
    );
  }
  
  // Process request...
}
```

### Using rate-limiter-flexible

```typescript
// lib/rate-limiter.ts
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : null;

export const rateLimiter = redis 
  ? new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'api_limit',
      points: 10, // 10 requests
      duration: 60, // per 60 seconds
    })
  : new RateLimiterMemory({
      keyPrefix: 'api_limit',
      points: 10,
      duration: 60,
    });

export async function checkRateLimit(key: string) {
  try {
    await rateLimiter.consume(key);
    return { allowed: true };
  } catch (rejRes) {
    return { 
      allowed: false, 
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1 
    };
  }
}
```

## Security Best Practices

### Input Sanitization

```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

export function sanitizeInput<T extends Record<string, unknown>>(
  data: T,
  textFields: (keyof T)[]
): T {
  const sanitized = { ...data };
  
  for (const field of textFields) {
    if (typeof data[field] === 'string') {
      sanitized[field] = sanitizeHtml(data[field] as string) as T[keyof T];
    }
  }
  
  return sanitized;
}

// Usage in route
const sanitizedData = sanitizeInput(body, ['name', 'bio', 'title']);
```

### CORS Configuration

```typescript
// middleware.ts or lib/cors.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
  'https://example.com',
  'https://app.example.com',
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') ?? '';
  const isAllowedOrigin = allowedOrigins.includes(origin);
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    return response;
  }
  
  // Handle actual requests
  const response = NextResponse.next();
  
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### Authentication Checks

```typescript
// lib/auth.ts
import { NextRequest } from 'next/server';
import { UnauthorizedError, ForbiddenError } from './errors';
import { auth } from '@/auth'; // NextAuth v5 or similar

export async function requireAuth(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  
  return session;
}

export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const session = await requireAuth(request);
  
  if (!allowedRoles.includes(session.user.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }
  
  return session;
}

// Usage in route
export async function DELETE(request: NextRequest) {
  await requireRole(request, ['admin']);
  
  // Only admins can delete
  await db.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

## Complete Examples

### CRUD API Route

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { userSchema, userUpdateSchema } from '@/lib/validations/user';
import { handleApiError } from '@/lib/api-error-handler';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { rateLimit } from '@/lib/rate-limit';
import { requireAuth, requireRole } from '@/lib/auth';
import { getClientIP } from '@/lib/utils';
import { ZodError } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      throw new NotFoundError('User', id);
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/users/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth(request);
    
    const { id } = await params;
    const body = await request.json();
    
    const validatedData = userUpdateSchema.parse(body);
    
    const user = await db.user.update({
      where: { id },
      data: validatedData,
    });
    
    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/users/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireRole(request, ['admin']);
    
    const { id } = await params;
    
    await db.user.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Server Action with Form

```typescript
// app/actions/post.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { postSchema } from '@/lib/validations/post';
import { auth } from '@/auth';
import { ZodError } from 'zod';

export interface PostState {
  errors?: {
    title?: string[];
    content?: string[];
    tags?: string[];
  };
  message?: string;
  success?: boolean;
}

export async function createPost(
  prevState: PostState,
  formData: FormData
): Promise<PostState> {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return { message: 'Unauthorized', success: false };
    }
    
    // Parse and validate
    const rawData = {
      title: formData.get('title'),
      content: formData.get('content'),
      tags: formData.get('tags')?.toString().split(',').filter(Boolean) ?? [],
    };
    
    const validatedData = postSchema.parse(rawData);
    
    // Create post
    const post = await db.post.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
        slug: slugify(validatedData.title),
      },
    });
    
    // Revalidate
    revalidatePath('/posts');
    revalidatePath('/dashboard');
    
    redirect(`/posts/${post.slug}`);
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        errors: error.flatten().fieldErrors,
        message: 'Validation failed',
        success: false,
      };
    }
    throw error;
  }
}
```

```tsx
// app/posts/create/page.tsx
'use client';

import { useActionState } from 'react';
import { createPost, PostState } from '@/app/actions/post';

const initialState: PostState = {};

export default function CreatePostPage() {
  const [state, formAction, isPending] = useActionState(createPost, initialState);
  
  return (
    <form action={formAction}>
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" required />
        {state.errors?.title && <span>{state.errors.title[0]}</span>}
      </div>
      
      <div>
        <label htmlFor="content">Content</label>
        <textarea id="content" name="content" rows={10} required />
        {state.errors?.content && <span>{state.errors.content[0]}</span>}
      </div>
      
      <div>
        <label htmlFor="tags">Tags (comma separated)</label>
        <input id="tags" name="tags" placeholder="nextjs, react, web" />
      </div>
      
      {state.message && !state.success && (
        <div role="alert">{state.message}</div>
      )}
      
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

### File Upload Handling

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';
import { UnauthorizedError } from '@/lib/errors';
import { requireAuth } from '@/lib/auth';
import { handleApiError } from '@/lib/api-error-handler';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large (max 5MB)' },
        { status: 400 }
      );
    }
    
    // Generate safe filename
    const ext = file.name.split('.').pop()?.toLowerCase();
    const filename = `${randomUUID()}.${ext}`;
    
    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });
    
    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);
    
    // Save to database
    const upload = await db.upload.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: filepath,
      },
    });
    
    return NextResponse.json({
      success: true,
      upload: {
        id: upload.id,
        filename: upload.filename,
        url: `/uploads/${upload.filename}`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```tsx
// File upload component
'use client';

import { useState, useRef } from 'react';

export function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  async function handleSubmit(formData: FormData) {
    setIsUploading(true);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUploadedFile(result.upload.url);
        inputRef.current?.reset();
      } else {
        alert(result.error);
      }
    } finally {
      setIsUploading(false);
    }
  }
  
  return (
    <form action={handleSubmit}>
      <input 
        ref={inputRef}
        type="file" 
        name="file" 
        accept="image/*,.pdf"
        required 
      />
      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
      {uploadedFile && (
        <p>Uploaded: <a href={uploadedFile}>{uploadedFile}</a></p>
      )}
    </form>
  );
}
```

## Testing

### Testing Route Handlers

```typescript
// __tests__/api/users.test.ts
import { GET, POST } from '@/app/api/users/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/db', () => ({
  user: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

describe('GET /api/users', () => {
  it('returns users list', async () => {
    const mockUsers = [{ id: '1', name: 'John' }];
    require('@/lib/db').user.findMany.mockResolvedValue(mockUsers);
    
    const request = new NextRequest('http://localhost:3000/api/users');
    const response = await GET(request);
    const data = await response.json();
    
    expect(data.users).toEqual(mockUsers);
  });
});

describe('POST /api/users', () => {
  it('creates a new user', async () => {
    const newUser = { name: 'Jane', email: 'jane@example.com' };
    require('@/lib/db').user.create.mockResolvedValue({ id: '2', ...newUser });
    
    const request = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify(newUser),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

### Testing Server Actions

```typescript
// __tests__/actions/user.test.ts
import { createUser } from '@/app/actions/user';

jest.mock('@/lib/db', () => ({
  user: {
    create: jest.fn(),
  },
}));

describe('createUser', () => {
  it('creates user with valid data', async () => {
    const formData = new FormData();
    formData.append('name', 'John');
    formData.append('email', 'john@example.com');
    
    const result = await createUser({}, formData);
    
    expect(result.success).toBe(true);
  });
  
  it('returns validation errors for invalid data', async () => {
    const formData = new FormData();
    formData.append('name', ''); // Empty name
    formData.append('email', 'invalid');
    
    const result = await createUser({}, formData);
    
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });
});
```

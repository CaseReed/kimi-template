---
name: nextjs-16-tailwind-4
description: Next.js 16 + Tailwind CSS 4 + React 19 best practices and coding standards
license: MIT
compatibility: Next.js >=16.0.0, Tailwind CSS >=4.0.0, React >=19.0.0
---

# Next.js 16 + Tailwind CSS 4 Skill

This skill provides guidelines for working with Next.js 16, Tailwind CSS 4, and React 19.

## Architecture Overview

### Stack
- **Next.js 16** - React framework with App Router, Turbopack, React 19
- **Tailwind CSS 4** - CSS-first utility framework (no JS config file)
- **React 19** - Server Components by default, Actions, new hooks
- **TypeScript** - Strict mode recommended

### Project Structure
```
my-app/
├── src/
│   ├── app/                 # App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   ├── globals.css      # Global styles + Tailwind imports
│   │   ├── error.tsx        # Error boundaries
│   │   ├── loading.tsx      # Loading UI
│   │   └── not-found.tsx    # 404 page
│   ├── components/          # Shared components
│   │   ├── ui/             # Primitive UI components
│   │   └── features/       # Feature-specific components
│   └── lib/                # Utilities
│       └── utils.ts
├── public/                 # Static assets
├── postcss.config.mjs      # PostCSS config for Tailwind
├── next.config.ts          # Next.js config
└── package.json
```

---

## Tailwind CSS 4 Guidelines

### Configuration (CSS-First)

**NO `tailwind.config.js` in v4!** Configuration happens in CSS.

**File: `src/app/globals.css`**
```css
@import "tailwindcss";

/* Define your theme variables */
@theme {
  /* Colors */
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-secondary: #8b5cf6;
  
  /* Fonts */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, monospace;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  
  /* Breakpoints (optional) */
  --breakpoint-xs: 480px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #60a5fa;
  }
}

/* Custom utilities */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### PostCSS Config

**File: `postcss.config.mjs`**
```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
export default config;
```

### Key Differences from Tailwind v3

| v3 | v4 |
|----|-----|
| `tailwind.config.js` | CSS-based config with `@theme` |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `theme.extend.colors` | `--color-*` CSS variables |
| `plugins: []` in JS | `@plugin` in CSS |

---

## Next.js 16 Guidelines

### Server vs Client Components

**Default: Server Components** (no directive needed)
```tsx
// Server Component by default
async function UserList() {
  const users = await fetchUsers(); // Direct DB/API calls OK
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

**Client Components** (only when needed)
```tsx
'use client';

import { useState } from 'react';

// Only when you need:
// - Browser APIs
// - React hooks (useState, useEffect)
// - Event handlers (onClick, onSubmit)
// - Context consumers
export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### When to use 'use client':
| Scenario | Use 'use client'? |
|----------|-------------------|
| Interactivity (click, hover) | ✅ Yes |
| Browser APIs (localStorage, window) | ✅ Yes |
| React hooks (useState, useEffect) | ✅ Yes |
| Context consumers | ✅ Yes |
| Displaying data from props | ❌ No (Server Component) |
| Static layout/markup | ❌ No (Server Component) |

### React 19 Features

**Actions & Form Status:**
```tsx
// Server Action in separate file (e.g., app/actions.ts)
'use server';

export async function createUser(formData: FormData) {
  const name = formData.get('name');
  // Server-side logic here
  return { success: true };
}
```

```tsx
// Component using the action
import { createUser } from './actions';

export function UserForm() {
  return (
    <form action={createUser}>
      <input name="name" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

**Metadata:**
```tsx
// Static metadata
export const metadata = {
  title: 'My Page',
  description: 'Page description',
};

// Dynamic metadata
export async function generateMetadata({ params }) {
  const product = await fetchProduct(params.id);
  return {
    title: product.name,
  };
}
```

---

## Styling Patterns

### Tailwind + Server Components

```tsx
// ✅ Perfect for Server Components
export async function ProductCard({ id }: { id: string }) {
  const product = await fetchProduct(id);
  
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
      <p className="mt-2 text-gray-600">{product.description}</p>
      <span className="mt-4 inline-block text-lg font-bold text-primary">
        ${product.price}
      </span>
    </article>
  );
}
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="
  grid
  grid-cols-1          /* Mobile: 1 column */
  sm:grid-cols-2       /* Small: 2 columns */
  lg:grid-cols-3       /* Large: 3 columns */
  xl:grid-cols-4       /* Extra large: 4 columns */
  gap-4
  p-4
  sm:p-6
  lg:p-8
">
```

### Dark Mode

```tsx
// Using Tailwind's dark: modifier
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <h1 className="text-2xl font-bold">Title</h1>
</div>
```

Or with CSS variables (preferred for custom themes):
```css
@theme {
  --color-bg: #ffffff;
  --color-text: #111827;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #111827;
    --color-text: #f9fafb;
  }
}
```

```tsx
<div className="bg-bg text-text">
```

---

## Component Guidelines

### Recommended: shadcn/ui + Tailwind

For production UI components, use **shadcn/ui** (see `/skill:shadcn-ui`):

```bash
npx shadcn@latest add button card input
```

Benefits:
- Copy-paste components (you own the code)
- Built on Radix UI (accessible)
- Pre-styled with Tailwind
- Fully customizable

### Custom UI Components (if not using shadcn)

```tsx
// src/components/ui/Button.tsx
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary text-white hover:bg-primary-dark': variant === 'primary',
          'bg-secondary text-white hover:bg-secondary-dark': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-base': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
```

### Utility: `cn()` function

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Install: `pnpm add clsx tailwind-merge`

---

## Performance Best Practices

### 1. Keep Client Components Small

```tsx
// ❌ Bad: Entire page as client component
'use client';
export default function Page() { ... }

// ✅ Good: Extract client parts
// page.tsx (Server Component)
export default async function Page() {
  const data = await fetchData();
  return (
    <div>
      <h1>{data.title}</h1>
      <InteractiveChart data={data.chart} /> {/* Client Component */}
    </div>
  );
}
```

### 2. Use Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  className="rounded-lg"
  priority  // For LCP images
/>
```

### 3. Streaming with Suspense

```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<Skeleton />}>
        <SlowWidget />
      </Suspense>
    </div>
  );
}
```

### 4. Caching Strategies

```tsx
// Revalidate page every hour
export const revalidate = 3600;

// Or dynamic revalidation
fetch('https://api.example.com/data', {
  next: { revalidate: 60 }
});
```

---

## Common Patterns

### Loading States

```tsx
// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary" />
    </div>
  );
}
```

### Error Handling

```tsx
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-dark"
      >
        Try again
      </button>
    </div>
  );
}
```

### Route Groups

```
app/
├── (marketing)/           # Route group (no URL segment)
│   ├── layout.tsx         # Marketing layout
│   ├── page.tsx           # / (homepage)
│   └── about/
│       └── page.tsx       # /about
├── (dashboard)/           # Dashboard route group
│   ├── layout.tsx         # Dashboard layout
│   └── dashboard/
│       └── page.tsx       # /dashboard
└── api/                   # API routes
```

---

## Package Management

### Recommended pnpm Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack

# Building
pnpm build            # Production build
pnpm start            # Start production server

# Maintenance
pnpm clean            # Clean everything & reinstall
pnpm clean:cache      # Clean Next.js cache only
pnpm update           # Update semver-compatible packages
pnpm update:latest    # Update to latest versions
```

### Useful Packages

```bash
# Styling
pnpm add -D clsx tailwind-merge        # Class merging

# Forms
pnpm add react-hook-form zod @hookform/resolvers

# Icons
pnpm add lucide-react                  # Modern icon library

# Utilities
pnpm add date-fns                      # Date formatting
```

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Pages | `page.tsx` | `app/about/page.tsx` |
| Layouts | `layout.tsx` | `app/layout.tsx` |
| Components | PascalCase | `Button.tsx`, `UserCard.tsx` |
| Utilities | camelCase | `utils.ts`, `formatDate.ts` |
| Hooks | `use` prefix | `useAuth.ts` |
| Server Actions | camelCase | `createUser.ts`, `app/actions.ts` |
| Types | PascalCase + `Type` suffix | `UserType.ts` or inline in file |

---

---

## ⚠️ Lessons Learned from Real Implementation

Based on actual project experience, here are critical issues and their solutions:

### useOptimistic Must Use startTransition

**Problem:** Calling `addOptimistic()` without wrapping in `startTransition` causes React warning:
```
An optimistic state update occurred outside a transition or action.
```

**❌ Wrong:**
```tsx
const handleUpdate = async (id: string, newStatus: string) => {
  addOptimisticUpdate({ id, newStatus }); // Warning!
  await updateStatus(id, newStatus);
};
```

**✅ Correct:**
```tsx
const [, startOptimisticUpdate] = useTransition();

const handleUpdate = async (id: string, newStatus: string) => {
  startOptimisticUpdate(() => {
    addOptimisticUpdate({ id, newStatus });
  });
  await updateStatus(id, newStatus);
};
```

### Pagination Loading State with placeholderData

**Problem:** With `placeholderData: (previousData) => previousData`, `isFetching` becomes `false` immediately when cached data is available, so loading spinner disappears too fast.

**Solution:** Use a local state with minimum delay:
```tsx
const [isNavigating, setIsNavigating] = useState(false);

useEffect(() => {
  if (!isFetching && isNavigating) {
    const timeout = setTimeout(() => setIsNavigating(false), 300);
    return () => clearTimeout(timeout);
  }
}, [isFetching, isNavigating]);

const handlePageChange = (page: number) => {
  setIsNavigating(true);
  setCurrentPage(page);
};
```

### Parallel Mutations (Individual Button States)

**Problem:** Using `isFetching` from TanStack Query disables all buttons during any mutation.

**Solution:** Track individual mutation states:
```tsx
const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

const handleUpdate = async (id: string) => {
  setPendingIds(prev => new Set(prev).add(id));
  try {
    await updateItem(id);
  } finally {
    setPendingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }
};

// In render:
<button disabled={pendingIds.has(item.id)}>
```

### HTML Table Structure with Motion

**Problem:** `motion.div` inside `<tbody>` causes hydration error.

**Solution:** Use `motion.tr` directly:
```tsx
<tbody>
  {rows.map((row, index) => (
    <motion.tr
      key={row.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <td>{row.name}</td>
    </motion.tr>
  ))}
</tbody>
```

### AnimatePresence Requires Key

**Problem:** Exit animations don't work without `key`.

**❌ Wrong:**
```tsx
<AnimatePresence>
  {show && <motion.div exit={{ opacity: 0 }} />}
</AnimatePresence>
```

**✅ Correct:**
```tsx
<AnimatePresence>
  {show && (
    <motion.div key="unique" exit={{ opacity: 0 }} />
  )}
</AnimatePresence>
```

---

## React 19 Features

React 19 brings significant improvements for building modern applications. Here's what you need to know.

### The `use()` Hook

The `use()` hook is a powerful new API for unwrapping resources (Promises, Context) in render.

**Reading Promises in Server Components:**

```tsx
// app/page.tsx
async function fetchData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

// Server Component
export default function Page() {
  const dataPromise = fetchData(); // Don't await here
  
  return (
    <Suspense fallback={<Loading />}>
      <DataComponent dataPromise={dataPromise} />
    </Suspense>
  );
}

// Can be Server or Client Component
function DataComponent({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise); // Unwraps the promise
  return <div>{data.name}</div>;
}
```

**Reading Context in Client Components (replaces useContext):**

```tsx
'use client';

import { use, Suspense } from 'react';
import { ThemeContext } from './ThemeProvider';

// In React 19, you can read context with use() anywhere in the component
// No longer limited to top-level like useContext
function ThemedButton() {
  // Can be called conditionally (unlike useContext!)
  const theme = use(ThemeContext);
  
  return <button className={theme.buttonClass}>Click me</button>;
}

// Using with Suspense for async context
function UserProfile() {
  // Works with async context values too
  const user = use(UserContext);
  
  return <div>{user.name}</div>;
}
```

**Key differences from `useContext`:**

| `useContext` | `use()` |
|--------------|---------|
| Must be called at top level | Can be called conditionally |
| Only synchronous | Handles Promises and async resources |
| Returns current value | Can suspend component with Suspense |

---

### Actions & Form Hooks

React 19 introduces first-class support for async actions and form handling.

#### `useActionState`

Handle form submissions with state, loading, and error handling:

```tsx
'use client';

import { useActionState } from 'react';
import { createUser } from './actions';

// Server Action with state
async function createUserAction(
  prevState: { message: string; success: boolean },
  formData: FormData
) {
  'use server';
  
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  try {
    await db.user.create({ data: { name, email } });
    return { message: 'User created!', success: true };
  } catch (error) {
    return { message: 'Failed to create user', success: false };
  }
}

// Client Component using the action
export function UserForm() {
  const [state, formAction, isPending] = useActionState(createUserAction, {
    message: '',
    success: false,
  });

  return (
    <form action={formAction}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>
      
      {state.message && (
        <p className={state.success ? 'text-green-600' : 'text-red-600'}>
          {state.message}
        </p>
      )}
    </form>
  );
}
```

#### `useFormStatus`

Track form submission status from child components:

```tsx
'use client';

import { useFormStatus } from 'react-dom';

// Submit button component that shows loading state
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

// Parent form component
export function ContactForm() {
  async function submitAction(formData: FormData) {
    'use server';
    // Process form data
    await sendEmail(formData);
  }

  return (
    <form action={submitAction}>
      <input name="email" type="email" required />
      <textarea name="message" required />
      
      {/* SubmitButton automatically tracks this form's status */}
      <SubmitButton />
    </form>
  );
}
```

#### `useOptimistic`

Update UI immediately while waiting for server confirmation:

```tsx
'use client';

import { useOptimistic, useState } from 'react';
import { addComment } from './actions';

interface Comment {
  id: string;
  text: string;
  author: string;
}

export function CommentSection({ 
  initialComments 
}: { 
  initialComments: Comment[] 
}) {
  const [comments, setComments] = useState(initialComments);
  
  // optimisticComments includes pending updates
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: Comment) => [...state, newComment]
  );

  async function handleSubmit(formData: FormData) {
    const text = formData.get('comment') as string;
    
    // Create optimistic comment immediately
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      text,
      author: 'You (pending...)',
    };
    
    addOptimisticComment(optimisticComment);
    
    // Actually send to server
    const savedComment = await addComment(text);
    
    // Replace optimistic with real data
    setComments(prev => 
      prev.map(c => c.id === optimisticComment.id ? savedComment : c)
    );
  }

  return (
    <div>
      {optimisticComments.map(comment => (
        <div key={comment.id} className="comment">
          <p>{comment.text}</p>
          <span>{comment.author}</span>
        </div>
      ))}
      
      <form action={handleSubmit}>
        <input name="comment" placeholder="Add a comment..." />
        <button type="submit">Post</button>
      </form>
    </div>
  );
}
```

---

### Server Components Deep Dive

#### Async Components

Server Components can be async and fetch data directly:

```tsx
// app/products/page.tsx
async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 } // Revalidate every hour
  });
  return res.json();
}

// Async Server Component
export default async function ProductsPage() {
  // This runs on the server, no client-side JS needed
  const products = await getProducts();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

#### Caching Strategies with `fetch`

```tsx
// Force cache (default for GET requests)
const data = await fetch('/api/data', {
  cache: 'force-cache'
});

// No cache - fetch fresh every time
const data = await fetch('/api/data', {
  cache: 'no-store'
});

// Revalidate on a timer
const data = await fetch('/api/data', {
  next: { revalidate: 60 } // seconds
});

// Revalidate by tag (useful for on-demand revalidation)
const data = await fetch('/api/data', {
  next: { 
    revalidate: 3600,
    tags: ['products', 'inventory']
  }
});

// Later, revalidate specific tags
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';

export async function POST() {
  revalidateTag('products');
  return Response.json({ revalidated: true });
}
```

#### Streaming with Suspense

```tsx
import { Suspense } from 'react';

// Component that loads quickly
function Layout() {
  return (
    <div>
      <Header />
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      <main>
        <Suspense fallback={<ContentSkeleton />}>
          <MainContent />
        </Suspense>
      </main>
    </div>
  );
}

// Nested Suspense boundaries
function ProductPage({ id }: { id: string }) {
  return (
    <div>
      {/* Product info loads first */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails id={id} />
      </Suspense>
      
      {/* Reviews load separately */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews id={id} />
      </Suspense>
      
      {/* Related products load last */}
      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedProducts id={id} />
      </Suspense>
    </div>
  );
}
```

#### Error Boundaries for Server Components

```tsx
// app/error.tsx - Error boundary for the route segment
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// app/products/[id]/error.tsx - Specific to product pages
'use client';

export default function ProductError({ error, reset }: { 
  error: Error; 
  reset: () => void;
}) {
  if (error.message === 'Product not found') {
    return <div>Product not found. Check the URL.</div>;
  }
  
  return (
    <div>
      <h2>Failed to load product</h2>
      <button onClick={reset}>Retry</button>
    </div>
  );
}

// Using error.js with loading.js
// app/products/loading.tsx
export default function Loading() {
  return <div>Loading product...</div>;
}

// app/products/page.tsx
export default async function Page() {
  const products = await fetchProducts();
  
  if (!products) {
    throw new Error('Failed to fetch products');
  }
  
  return <ProductList products={products} />;
}
```

---

### Ref as Prop

React 19 eliminates the need for `forwardRef`. You can now pass `ref` as a normal prop.

**Before (React 18):**

```tsx
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

// Had to use forwardRef
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

**After (React 19):**

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

// ref is just a regular prop now!
export function Button({ 
  variant = 'primary', 
  ref,  // Destructure ref like any other prop
  ...props 
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <button
      ref={ref}
      className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
      {...props}
    />
  );
}
```

**Custom components with refs:**

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, ref, ...props }: InputProps & { 
  ref?: React.Ref<HTMLInputElement> 
}) {
  return (
    <div>
      <label>{label}</label>
      <input
        ref={ref}
        className={error ? 'input-error' : 'input'}
        {...props}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

// Usage remains the same
function Form() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  return <Input ref={inputRef} label="Email" type="email" />;
}
```

---

### React Compiler (Optional Preview)

The React Compiler is an optimizing compiler that automatically memoizes your components without manual `useMemo` and `useCallback`.

**What it means for your code:**

```tsx
// WITHOUT compiler - need manual memoization
'use client';

import { useMemo, useCallback, memo } from 'react';

const ExpensiveComponent = memo(function ExpensiveComponent({ 
  data, 
  onUpdate 
}: { 
  data: Data[];
  onUpdate: (id: string) => void;
}) {
  const processedData = useMemo(() => {
    return data.filter(d => d.active).sort((a, b) => b.score - a.score);
  }, [data]);
  
  const handleClick = useCallback((id: string) => {
    onUpdate(id);
  }, [onUpdate]);
  
  return <div>{/* render */}</div>;
});
```

```tsx
// WITH compiler - manual memoization often not needed
'use client';

// Compiler automatically memoizes props, states, and derived values
function ExpensiveComponent({ 
  data, 
  onUpdate 
}: { 
  data: Data[];
  onUpdate: (id: string) => void;
}) {
  // Compiler memoizes this automatically
  const processedData = data.filter(d => d.active).sort((a, b) => b.score - a.score);
  
  // Compiler memoizes this callback
  const handleClick = (id: string) => {
    onUpdate(id);
  };
  
  return <div>{/* render */}</div>;
}
```

**When you STILL need memoization:**

```tsx
// 1. For expensive calculations that the compiler can't optimize
const expensiveValue = useMemo(() => {
  return heavyComputation(data);
}, [data]);

// 2. For stable references passed to memoized child components
// (Compiler handles this in most cases, but explicit memo can help)
const stableCallback = useCallback(() => {
  doSomething();
}, []);

// 3. When integrating with non-React code
const canvasRef = useRef<HTMLCanvasElement>(null);
useEffect(() => {
  if (canvasRef.current) {
    drawOnCanvas(canvasRef.current);
  }
}, []);
```

**Enabling the compiler in Next.js:**

```js
// next.config.js
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
};

module.exports = nextConfig;
```

**Migration strategy:**

1. Enable compiler and test thoroughly
2. Remove `useMemo`/`useCallback` that the compiler makes redundant
3. Keep explicit memoization for:
   - Complex derived state with expensive calculations
   - Integration with external libraries
   - Cases where you need guaranteed referential equality

---

## Next.js 16 Features

### Cache Components

Next.js 16 introduces explicit caching with the `"use cache"` directive.

**Enable in next.config.ts:**
```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    useCache: true,
  },
}

export default nextConfig
```

**Cache a Component:**
```tsx
// components/cached-widget.tsx
'use cache'

export async function CachedWidget() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }
  })
  const json = await data.json()
  
  return <div>{json.value}</div>
}
```

**Cache a Function:**
```tsx
// lib/data.ts
'use cache'

export async function getCachedData() {
  return await fetch('https://api.example.com/data').then(r => r.json())
}
```

**Important Notes:**
- Components with `'use cache'` must be async
- Works with `revalidate` and `tags` from fetch
- Replaces experimental `unstable_cache`

### Proxy (proxy.ts)

`proxy.ts` is the new way to handle network boundary logic in Next.js 16, replacing `middleware.ts` for Node.js runtime use cases.

**Create app/proxy.ts:**
```ts
import { proxy } from 'next/proxy'
import { NextResponse } from 'next/server'

export default proxy((request) => {
  // Runs on Node.js runtime
  const url = request.nextUrl
  
  // Example: Redirect old paths
  if (url.pathname.startsWith('/old-path')) {
    return NextResponse.redirect(new URL('/new-path', url))
  }
  
  // Example: Add headers
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'value')
  return response
})
```

**Comparison with middleware.ts:**

| Feature | middleware.ts | proxy.ts |
|---------|--------------|----------|
| Runtime | Edge | Node.js |
| Use case | Simple redirects/headers | Complex logic, DB access |
| Performance | Fast, at edge | Standard, on server |
| Status | Still supported | New in v16 |

**When to use proxy.ts:**
- You need Node.js APIs (fs, db, etc.)
- Complex authentication logic
- Request/response transformation

**When to keep middleware.ts:**
- Simple redirects at the edge
- A/B testing at edge
- Geolocation-based routing

### Async Request APIs

Starting with Next.js 15, request-specific APIs are asynchronous.

**Dynamic Route Params:**
```tsx
// app/users/[id]/page.tsx
// Next.js 15+ - params is now async
export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Must await params
  const { id } = await params
  
  const user = await fetchUser(id)
  
  return <UserProfile user={user} />
}
```

**Search Params:**
```tsx
// app/search/page.tsx
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { q, category } = await searchParams
  
  const results = await search({ query: q, category })
  
  return <SearchResults results={results} />
}
```

**Migration from Next.js 14:**
```tsx
// BEFORE (Next.js 14)
export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params // Direct destructuring
}

// AFTER (Next.js 15+)
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params // Must await
}
```

### @theme vs @theme inline

Tailwind CSS v4 supports two `@theme` variants:

**`@theme` - Static Values:**
```css
@theme {
  --color-primary: #3b82f6;
  --spacing-md: 1rem;
}
```
Use when you have static values that don't reference CSS variables.

**`@theme inline` - CSS Variable References:**
```css
:root {
  --primary: hsl(217 91% 60%);
}

@theme inline {
  --color-primary: var(--primary);
}
```
Use when you need to reference CSS custom properties (variables).

**When to use which:**

| Scenario | Use |
|----------|-----|
| Static design tokens | `@theme` |
| CSS variable theming (light/dark) | `@theme inline` |
| shadcn/ui integration | `@theme inline` |
| Dynamic runtime values | `@theme inline` |

---

## Quick Checklist

When creating/modifying files:

- [ ] Is this a Server or Client Component? (Only use `'use client'` when necessary)
- [ ] Are Tailwind classes following the design system?
- [ ] Is the component typed with TypeScript?
- [ ] Are images optimized with `next/image`?
- [ ] Is data fetching cached appropriately?
- [ ] Are loading/error states handled?
- [ ] Is the code accessible (ARIA labels, focus states)?

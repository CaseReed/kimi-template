---
name: performance-optimization
description: Performance optimization patterns for Next.js 16, React 19, and Core Web Vitals - React Compiler, PPR, Streaming, Image optimization, Lazy loading
license: MIT
compatibility: Next.js 16+, React 19+, TypeScript 5+
---

# Performance Optimization for Next.js 16 & React 19

Performance optimization patterns for modern React applications using Next.js 16 and React 19.

---

## Quick Reference

| Pattern | Use When | Key Benefit |
|---------|----------|-------------|
| React Compiler | All new projects | Automatic memoization, no manual `useMemo`/`useCallback` |
| Server Components | Default for pages | Zero client JS for static content |
| PPR (Partial Prerendering) | Mixed static/dynamic content | Static shell + streaming dynamic content |
| `next/image` | All images | Automatic optimization, WebP/AVIF, lazy loading |
| `next/dynamic` | Client Components below fold | Code splitting, reduce initial bundle |
| Suspense boundaries | Async data fetching | Streaming, progressive loading |

---

## React Compiler: Automatic Memoization

React Compiler (formerly React Forget) automatically optimizes your React applications by handling memoization for you.

### What It Does

- **Eliminates manual memoization**: No more `useMemo`, `useCallback`, or `React.memo`
- **Automatic optimization**: Compiler analyzes component dependencies automatically
- **Zero runtime overhead**: Optimizations happen at build time

### Installation

```bash
# Install the compiler
npm install babel-plugin-react-compiler

# Or with React 19 (built-in support)
# Next.js 16+ has built-in support via next.config.ts
```

### Configuration

Next.js 15.3.1+ includes a custom SWC optimization that makes the React Compiler more efficient. Instead of running the compiler on every file, Next.js analyzes your project and only applies the React Compiler to relevant files (like those with JSX or React Hooks). This avoids unnecessary work and leads to faster builds.

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
}

export default nextConfig
```

### ESLint Plugin

React Compiler includes an ESLint rule that helps identify code that breaks the Rules of React. The linter does NOT require the compiler to be installed.

**Important:** The ESLint plugin is now included in `eslint-plugin-react-hooks` (v5+), no need for separate `eslint-plugin-react-compiler`:

```bash
# Install the hooks plugin (includes compiler rules)
npm install --save-dev eslint-plugin-react-hooks@latest
```

```javascript
// eslint.config.js (Flat Config)
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  reactHooks.configs.flat.recommended,
])
```

### Compiler Directives

You can use directives to opt-in or opt-out specific components/hooks:

```typescript
// Opt-in a specific component (when using opt-in mode)
"use memo"
function MyComponent() {
  // This component will be compiled even in opt-in mode
}

// Opt-out a specific component
"use no memo"
function ManualOptimizedComponent() {
  // This component will NOT be compiled
}
```

To enable opt-in mode, configure:

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    reactCompiler: {
      mode: 'opt-in', // Only compile components with "use memo"
    },
  },
}
```

### React Version Compatibility

React Compiler is compatible with React 17 and up. If you are not yet on React 19, you can use React Compiler by:
1. Specifying a minimum target in your compiler config
2. Adding `react-compiler-runtime` as a dependency

```bash
npm install react-compiler-runtime
```

### When You Still Need Manual Memoization

React Compiler handles 95%+ of cases, but manual memoization may still be needed for:

```typescript
// Complex object references that escape the component
const externalCache = new Map()

function Component({ id }) {
  // Compiler can't track external mutable state
  const data = useMemo(() => {
    return expensiveCompute(externalCache.get(id))
  }, [id])
  
  return <div>{data}</div>
}

// Ref callbacks that need stable identity
function Component() {
  const ref = useCallback((node) => {
    // Complex ref logic
    if (node) {
      observeNode(node)
    }
  }, []) // Empty deps - stable identity required
  
  return <div ref={ref} />
}

// Props passed to non-React systems (D3, canvas, etc.)
function ChartComponent({ data }) {
  const chartConfig = useMemo(() => ({
    data,
    color: d3.scaleOrdinal(d3.schemeCategory10)
  }), [data])
  
  useEffect(() => {
    d3.select(ref.current).call(myChart, chartConfig)
  }, [chartConfig])
  
  return <svg ref={ref} />
}
```

### Migration Strategy

```bash
# 1. Enable compiler in dev first
# 2. Run your test suite
# 3. Check for console warnings about "Rules of React" violations
# 4. Gradually remove manual memoization where safe
```

For existing code, either leave existing memoization in place (removing it can change compilation output) or carefully test before removing.

---

## Server Components by Default

Next.js 16 uses Server Components by default, dramatically reducing client-side JavaScript.

### Benefits

| Metric | Client Component | Server Component |
|--------|-----------------|------------------|
| Bundle Size | Included in JS bundle | Zero client JS |
| Initial Render | Requires hydration | Instant HTML |
| SEO | Needs SSR setup | Automatic |
| Data Access | Client-side fetching | Direct backend access |

### Pattern: Server-First Architecture

```typescript
// ✅ Good: Server Component (default)
// src/app/page.tsx - No 'use client' needed
import { db } from '@/lib/db'
import { ProductCard } from './ProductCard'

export default async function ProductPage() {
  // Direct database access - no API route needed
  const products = await db.query('SELECT * FROM products')
  
  return (
    <div>
      <h1>Products</h1>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

```typescript
// ✅ Good: Client Component only when needed
// src/app/ProductCard.tsx
'use client'

import { useState } from 'react'

export function ProductCard({ product }) {
  const [isLiked, setIsLiked] = useState(false)
  
  return (
    <div>
      <h2>{product.name}</h2>
      <button onClick={() => setIsLiked(!isLiked)}>
        {isLiked ? '❤️' : '🤍'}
      </button>
    </div>
  )
}
```

### Pattern: Granular Client Boundaries

```typescript
// ✅ Good: Keep client islands small
// src/app/page.tsx
import { ProductGrid } from './ProductGrid' // Server
import { LikeButton } from './LikeButton'   // Client
import { AddToCart } from './AddToCart'     // Client

export default async function Page() {
  const products = await fetchProducts()
  
  return (
    <ProductGrid products={products}>
      {/* Client components as small islands */}
      <LikeButton />
      <AddToCart />
    </ProductGrid>
  )
}
```

### Note: params is now a Promise

In Next.js 16+, `params` is passed as a Promise and must be awaited:

```typescript
// ✅ Good: await params (Next.js 16+)
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)
  return <div>{post.title}</div>
}
```

### Pattern: Context Provider Pattern

React context is not supported in Server Components. Create a Client Component provider that accepts children:

```typescript
// ThemeProvider.tsx - Client Component
'use client'
import { createContext } from 'react'

export const ThemeContext = createContext({})

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>
}
```

```typescript
// layout.tsx - Server Component
import ThemeProvider from './theme-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {/* Render provider as deep as possible for better optimization */}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

### Pattern: server-only and client-only packages

Use these packages to prevent accidental cross-environment usage:

```bash
pnpm add server-only client-only
```

```typescript
// lib/data.ts - Server-only code
import 'server-only'

export async function getData() {
  const res = await fetch('https://api.example.com/data', {
    headers: { authorization: process.env.API_KEY },
  })
  return res.json()
}
```

Now importing this into a Client Component will cause a build-time error.

### Pattern: Sharing Data with React.cache

Share fetched data across Server and Client Components:

```typescript
// lib/user.ts
import { cache } from 'react'

export const getUser = cache(async () => {
  const res = await fetch('https://api.example.com/user')
  return res.json()
})
```

```typescript
// UserProvider.tsx - Client Component
'use client'
import { createContext } from 'react'

export const UserContext = createContext<Promise<User> | null>(null)

export default function UserProvider({
  children,
  userPromise,
}: {
  children: React.ReactNode
  userPromise: Promise<User>
}) {
  return <UserContext.Provider value={userPromise}>{children}</UserContext.Provider>
}
```

```typescript
// layout.tsx - Server Component
import UserProvider from './user-provider'
import { getUser } from './lib/user'

export default function RootLayout({ children }) {
  const userPromise = getUser() // Don't await here
  return (
    <UserProvider userPromise={userPromise}>
      {children}
    </UserProvider>
  )
}
```

Client Components then use `use()` hook to resolve the promise.

---

## Streaming with Suspense

Streaming allows progressive rendering of content as it becomes ready.

### Basic Pattern

```typescript
// src/app/page.tsx
import { Suspense } from 'react'
import { ProductList } from './ProductList'
import { Reviews } from './Reviews'
import { Skeleton } from '@/components/ui/skeleton'

export default function Page() {
  return (
    <div>
      {/* Static content - renders immediately */}
      <header>
        <h1>Our Store</h1>
      </header>
      
      {/* Streamed content with fallback */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductList />
      </Suspense>
      
      <Suspense fallback={<ReviewSkeleton />}>
        <Reviews />
      </Suspense>
    </div>
  )
}
```

### Parallel Suspense

Multiple Suspense boundaries render in parallel, not sequentially:

```tsx
// ✅ Good: These three load in parallel, not sequentially
<Suspense fallback={<CategoriesSkeleton />}>
  <Categories />
</Suspense>
<Suspense fallback={<FeaturedSkeleton />}>
  <Featured />
</Suspense>
<Suspense fallback={<ProductsSkeleton />}>
  <ProductList />
</Suspense>
```

### Advanced: Parallel Data Fetching

```typescript
// ✅ Good: Parallel streaming
// src/app/page.tsx
import { Suspense } from 'react'

async function ProductList() {
  const products = await fetch('https://api.example.com/products')
    .then(r => r.json())
  return <ul>{/* render */}</ul>
}

async function Categories() {
  const categories = await fetch('https://api.example.com/categories')
    .then(r => r.json())
  return <nav>{/* render */}</nav>
}

async function Featured() {
  const featured = await fetch('https://api.example.com/featured')
    .then(r => r.json())
  return <section>{/* render */}</section>
}

export default function Page() {
  return (
    <>
      {/* All three fetch in parallel */}
      <Suspense fallback={<CategoriesSkeleton />}>
        <Categories />
      </Suspense>
      
      <Suspense fallback={<FeaturedSkeleton />}>
        <Featured />
      </Suspense>
      
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductList />
      </Suspense>
    </>
  )
}
```

### Pattern: Nested Suspense

```typescript
// ✅ Good: Granular loading states
// src/app/page.tsx
export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Layout>
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
        
        <main>
          <Suspense fallback={<ContentSkeleton />}>
            <Content />
          </Suspense>
        </main>
      </Layout>
    </Suspense>
  )
}
```

### loading.js Convention

Next.js has a special `loading.js` file convention that automatically creates Suspense boundaries:

```typescript
// app/blog/loading.tsx
export default function Loading() {
  return <div>Loading blog posts...</div>
}
```

This automatically wraps the `page.js` file and any children in a `<Suspense>` boundary. The loading state is shown immediately upon navigation.

### SEO with Streaming

Important SEO considerations for streaming:

- **Metadata**: `generateMetadata` is resolved before streaming, so metadata is placed in `<head>` of initial HTML
- **Status Codes**: When streaming, a `200` status is returned. Errors are communicated within streamed content
- **404 Handling**: For 404 pages, Next.js includes `<meta name="robots" content="noindex">` in streamed HTML to prevent indexing
- **Crawlers**: Next.js automatically detects user agents to choose between blocking and streaming behavior

If you need a specific status code (e.g., 404 for compliance/analytics), check resource existence before streaming starts.

### Navigation is Interruptible

With streaming:
- Fallback UI is prefetched for immediate navigation
- Navigation is interruptible - changing routes doesn't wait for content to fully load
- Shared layouts remain interactive while new route segments load

### Browser Buffering Note

Some browsers buffer streaming responses. You may not see streamed content until the response exceeds 1024 bytes. This typically only affects "hello world" apps, not real applications.

### Suspense Behavior Clarification

Components under the same Suspense boundary "pop in" together at once. Even if only one component suspends, all are replaced by fallback until all are ready. Use nested Suspense for progressive loading:

```tsx
// Biography and Albums pop in together
<Suspense fallback={<Loading />}>
  <Biography />
  <Albums />
</Suspense>

// Biography loads first, then Albums loads separately
<Suspense fallback={<BigSpinner />}>
  <Biography />
  <Suspense fallback={<AlbumsGlimmer />}>
    <Albums />
  </Suspense>
</Suspense>
```

---

## Partial Prerendering (PPR) with Cache Components

**Note:** PPR is enabled via `cacheComponents` flag in Next.js 16.

### What is PPR?

PPR combines static and dynamic content in a single route:
- **Static shell**: Prerendered at build time
- **Dynamic content**: Streams at request time

### Enabling Cache Components

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true, // Enables PPR/Cache Components
}

export default nextConfig
```

### Understanding "Uncached data" Error

Next.js requires you to explicitly handle components that can't complete during prerendering. If they aren't wrapped in `<Suspense>` or marked with `use cache`, you'll see an error:

```
Uncached data was accessed outside of <Suspense>
```

**Solution:** Wrap dynamic components in Suspense boundaries:
```tsx
// ✅ Good: Dynamic content wrapped in Suspense
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <DynamicContent />
    </Suspense>
  )
}
```

### Types of Dynamic Content

Three types of content require explicit handling during prerendering:

1. **Dynamic content** (network requests, async operations):
```tsx
async function DynamicContent() {
  const data = await fetch('https://api.example.com/data') // Network request
  return <div>{data}</div>
}
```

2. **Runtime data** (request-specific, CANNOT be cached with `use cache`):
   - `cookies()` - User's cookie data
   - `headers()` - Request headers  
   - `searchParams` - URL query parameters
   - `params` - Dynamic route parameters (unless generateStaticParams provided)
   - `connection()` - Explicitly defer to request time

```tsx
import { cookies } from 'next/headers'

async function UserPreferences() {
  const theme = (await cookies()).get('theme')?.value // Runtime data
  return <div>Theme: {theme}</div>
}
```

3. **Non-deterministic operations** (different values each execution):
   - `Math.random()`
   - `Date.now()`
   - `crypto.randomUUID()`

These must be called AFTER dynamic/runtime data access to run at request time.

### Pattern: Static Shell + Dynamic Content

```typescript
// src/app/page.tsx
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { cacheLife } from 'next/cache'

export default function Page() {
  return (
    <>
      {/* Static - prerendered automatically */}
      <header>
        <h1>Our Blog</h1>
        <nav>...</nav>
      </header>
      
      {/* Cached dynamic content - included in static shell */}
      <BlogPosts />
      
      {/* Runtime dynamic content - streams at request time */}
      <Suspense fallback={<p>Loading preferences...</p>}>
        <UserPreferences />
      </Suspense>
    </>
  )
}

// Cached component - part of static shell
async function BlogPosts() {
  'use cache'
  cacheLife('hours') // Revalidate every hour
  
  const posts = await fetch('https://api.example.com/posts')
    .then(r => r.json())
  
  return (
    <section>
      {posts.map(post => (
        <article key={post.id}>{post.title}</article>
      ))}
    </section>
  )
}

// Runtime component - streams per request
async function UserPreferences() {
  const theme = (await cookies()).get('theme')?.value || 'light'
  
  return <aside>Your theme: {theme}</aside>
}
```

### Pattern: Cache with Runtime Data

Runtime data CANNOT be cached, but you can extract values and pass them to cached functions:

```tsx
// ✅ Good: Extract runtime data, pass to cached function
import { cookies } from 'next/headers'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileWrapper />
    </Suspense>
  )
}

// Reads runtime data (NOT cached)
async function ProfileWrapper() {
  const session = (await cookies()).get('session')?.value
  return <CachedProfile sessionId={session} />
}

// Cached - sessionId becomes part of cache key
async function CachedProfile({ sessionId }: { sessionId: string }) {
  'use cache'
  const data = await fetchUserData(sessionId)
  return <div>{data.name}</div>
}
```

### Pattern: Revalidation

```typescript
// ✅ Good: Tag-based revalidation
import { cacheTag, updateTag, revalidateTag } from 'next/cache'

async function getPosts() {
  'use cache'
  cacheTag('posts')
  return fetch('https://api.example.com/posts').then(r => r.json())
}

// Immediate update (same request)
export async function createPost(formData: FormData) {
  'use server'
  await db.posts.create(formData)
  updateTag('posts') // Immediate refresh
}

// Stale-while-revalidate
export async function moderatePost(id: string) {
  'use server'
  await db.posts.update(id, { moderated: true })
  revalidateTag('posts', 'max') // Mark for revalidation
}
```

### Migration from Old Patterns

```typescript
// ❌ Before: force-dynamic
export const dynamic = 'force-dynamic'

// ✅ After: Suspense boundary
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <DynamicContent />
    </Suspense>
  )
}

// ❌ Before: revalidate export
export const revalidate = 3600

// ✅ After: cacheLife
async function Content() {
  'use cache'
  cacheLife('hours')
  // ...
}

// ❌ Before: fetchCache
export const fetchCache = 'force-cache'

// ✅ After: use cache directive
async function Content() {
  'use cache'
  // All fetches automatically cached
}
```

---

## Image Optimization with next/image

> ⚠️ **Next.js 16 Critical Changes**: Several `next/image` props have been deprecated. See sections below for migration guidance.

### Basic Usage

```typescript
import Image from 'next/image'

// Local image - automatic optimization
import localImage from './photo.jpg'

export default function Page() {
  return (
    <Image
      src={localImage}
      alt="Description"
      // width, height, and blurDataURL are automatically provided
      placeholder="blur" // Optional: enables blur-up effect
    />
  )
}
```

### Pattern: Hero Image (LCP Optimization)

```typescript
// ✅ Good: Prioritize LCP image (Next.js 16)
import Image from 'next/image'

export default function Hero() {
  return (
    <Image
      src="/hero-image.webp"
      alt="Hero"
      width={1200}
      height={630}
      preload={true}  // Use this instead of priority (deprecated)
      sizes="100vw"
    />
  )
}
```

### When to Use `preload` vs `loading`

Use `preload={true}` when:
- The image is the Largest Contentful Paint (LCP) element
- The image is above the fold (typically hero image)
- You want to begin loading the image in `<head>` before it's discovered in `<body>`

Do NOT use when:
- You have multiple potential LCP elements depending on viewport
- You're using `loading` property
- You're using `fetchPriority` property

### The `loading` Prop

- `lazy` (default): Defer loading until image is near viewport
- `eager`: Load immediately, regardless of position

Use `eager` only when you want to ensure the image is loaded immediately. In most cases, use `preload={true}` for LCP images instead.

```typescript
// Load immediately without preloading in <head>
<Image
  src="/image.webp"
  alt="Description"
  width={800}
  height={600}
  loading="eager"
/>
```

### Deprecated Props (Next.js 16)

#### 1. `priority` is DEPRECATED

Use `preload` instead:

```typescript
// ❌ OLD (Deprecated in Next.js 16)
<Image
  src="/hero-image.webp"
  alt="Hero"
  width={1200}
  height={630}
  priority        // DEPRECATED
  fetchpriority="high"  // DEPRECATED
/>

// ✅ NEW (Next.js 16)
<Image
  src="/hero-image.webp"
  alt="Hero"
  width={1200}
  height={630}
  preload={true}  // Use this instead
/>
```

#### 2. `onLoadingComplete` is DEPRECATED

Use `onLoad` instead:

```typescript
// ❌ OLD (Deprecated)
<Image
  src="/photo.jpg"
  alt="Photo"
  onLoadingComplete={(img) => console.log('loaded')}
/>

// ✅ NEW
<Image
  src="/photo.jpg"
  alt="Photo"
  onLoad={(event) => console.log('loaded')}
/>
```

### The `sizes` Prop

The `sizes` prop affects how Next.js generates the srcset:

- **Without `sizes`**: Next.js generates a limited srcset (e.g., 1x, 2x), suitable for fixed-size images
- **With `sizes`**: Next.js generates a full srcset (e.g., 640w, 750w, etc.), optimized for responsive layouts

```typescript
// Fixed size - limited srcset (1x, 2x)
<Image
  src="/photo.webp"
  alt="Photo"
  width={400}
  height={300}
/>

// Responsive - full srcset with sizes
<Image
  src="/photo.webp"
  alt="Photo"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### Pattern: Responsive Images

```typescript
// ✅ Good: Responsive with srcset
import Image from 'next/image'

export default function Gallery() {
  return (
    <Image
      src="/photo.webp"
      alt="Gallery photo"
      width={800}
      height={600}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
```

### Pattern: Remote Images

```typescript
// next.config.ts
const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/images/**',
      },
    ],
    formats: ['image/webp', 'image/avif'], // Modern formats
  },
}

// Component
import Image from 'next/image'

export default function ProductImage({ src }) {
  return (
    <Image
      src={src}
      alt="Product"
      width={500}
      height={500}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQ..." // Low-quality placeholder
    />
  )
}
```

### Pattern: Fill Mode

```typescript
// ✅ Good: Background images, unknown dimensions
import Image from 'next/image'

export default function CoverImage({ src }) {
  return (
    <div className="relative w-full h-96">
      <Image
        src={src}
        alt="Cover"
        fill
        className="object-cover"
        sizes="100vw"
      />
    </div>
  )
}
```

### Pattern: SEO with `overrideSrc`

Use `overrideSrc` when you need a different URL for SEO purposes or hotlinking:

```typescript
<Image
  src="/optimized-image.webp"
  alt="Description"
  overrideSrc="/original-image.jpg" // Used for SEO/hotlinking
  width={800}
  height={600}
/>
```

---

## Lazy Loading

### Pattern: next/dynamic for Client Components

```typescript
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// Load immediately but separate bundle
const HeavyChart = dynamic(() => import('@/components/Chart'))

// Load on demand
const Modal = dynamic(() => import('@/components/Modal'), {
  loading: () => <p>Loading modal...</p>,
})

// Client-side only (no SSR)
const BrowserMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
})

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false)
  
  return (
    <div>
      <HeavyChart /> {/* Loaded immediately, separate chunk */}
      
      <button onClick={() => setShowModal(true)}>
        Open Modal
      </button>
      {showModal && <Modal />} {/* Loaded on click */}
      
      <BrowserMap /> {/* Only loaded in browser */}
    </div>
  )
}
```

### Pattern: Dynamic Library Loading

```typescript
'use client'

import { useState } from 'react'

export default function Search() {
  const [results, setResults] = useState([])
  
  const handleSearch = async (query: string) => {
    // Load library only when needed
    const Fuse = (await import('fuse.js')).default
    const fuse = new Fuse(items, options)
    setResults(fuse.search(query))
  }
  
  return (
    <input
      type="text"
      onChange={(e) => handleSearch(e.target.value)}
    />
  )
}
```

### Pattern: Intersection Observer Lazy Loading

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'

export function LazyComponent({ children }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' } // Load 100px before visible
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <div ref={ref}>
      {isVisible ? children : <Placeholder />}
    </div>
  )
}
```

---

## Core Web Vitals Optimization

### Core Web Vitals Metrics

| Metric | Target | Measures |
|--------|--------|----------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | Loading performance |
| INP (Interaction to Next Paint) | ≤ 200ms | Interactivity (replaced FID) |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Visual stability |

> **Measurement Threshold:** To ensure hitting recommended targets for most users, measure at the **75th percentile** of page loads, segmented across mobile and desktop devices.

### Lifecycle of Core Web Vitals

Core Web Vitals metrics follow a defined lifecycle:

| Phase | Description | Current Status |
|-------|-------------|----------------|
| **Experimental** | Prospective metrics undergoing testing with web developers to address gaps in current metrics | - |
| **Pending** | Metrics that have passed testing and are on track to become Core Web Vitals. Minimum 6 months as pending before stable status | - |
| **Stable** | The current set of Core Web Vitals used for measuring page experience | **LCP, INP, CLS** |

### Measuring Core Web Vitals in JavaScript

Use the `web-vitals` library to measure and report Core Web Vitals from real users:

```typescript
import { onCLS, onINP, onLCP } from 'web-vitals'

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric)
  // Use navigator.sendBeacon() if available, fallback to fetch
  ;(navigator.sendBeacon && navigator.sendBeacon('/analytics', body)) ||
    fetch('/analytics', { body, method: 'POST', keepalive: true })
}

onCLS(sendToAnalytics)
onINP(sendToAnalytics)
onLCP(sendToAnalytics)
```

### LCP (Largest Contentful Paint) - Loading

**Target:** ≤ 2.5 seconds

```typescript
// ✅ Good: Preload critical resources
export const metadata = {
  other: {
    link: [
      {
        rel: 'preload',
        href: '/hero-image.webp',
        as: 'image',
        fetchpriority: 'high',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'dns-prefetch',
        href: 'https://cdn.example.com',
      },
    ],
  },
}

// Image with priority
<Image
  src="/hero-image.webp"
  alt="Hero"
  priority
  fetchpriority="high"
  width={1200}
  height={630}
/>
```

### INP (Interaction to Next Paint) - Responsiveness

**Target:** ≤ 200 milliseconds

> **Note:** INP replaced FID (First Input Delay) as a Core Web Vital in 2024. While FID only measured the delay of the first interaction, INP measures **all interactions** throughout the page lifecycle, capturing the worst (or near-worst) interaction latency to better represent overall responsiveness.

> **TBT (Total Blocking Time):** TBT is a lab metric useful for diagnosing INP issues, but it is not a Core Web Vital because it's not field-measurable.

```typescript
// ✅ Good: Break up long tasks
async function processItems(items: Item[]) {
  const results = []
  const CHUNK_SIZE = 50
  
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE)
    results.push(...chunk.map(processItem))
    
    // Yield to main thread
    await new Promise(resolve => setTimeout(resolve, 0))
  }
  
  return results
}

// ✅ Good: Debounce expensive operations
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Usage
const debouncedSearch = debounce((query: string) => {
  performSearch(query)
}, 300)

// ✅ Good: Use transitions for non-urgent updates
import { useTransition } from 'react'

function FilterList({ items }) {
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState('')
  
  const handleChange = (value: string) => {
    // Urgent update
    setFilter(value)
    
    // Non-urgent update
    startTransition(() => {
      setFilteredItems(items.filter(i => i.name.includes(value)))
    })
  }
  
  return (
    <>
      <input onChange={e => handleChange(e.target.value)} />
      {isPending && <Spinner />}
      <List items={filteredItems} />
    </>
  )
}
```

### CLS (Cumulative Layout Shift) - Visual Stability

**Target:** ≤ 0.1

```typescript
// ✅ Good: Set explicit dimensions
<Image
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
/>

// ✅ Good: Reserve space for dynamic content
<div className="min-h-[250px]">
  {/* Ad or dynamic content */}
</div>

// ✅ Good: CSS aspect-ratio for responsive containers
<div className="aspect-video relative">
  <Image
    src="/video-thumbnail.jpg"
    alt="Video"
    fill
    className="object-cover"
  />
</div>

// ✅ Good: Font display strategy
// globals.css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* or 'optional' for zero CLS */
}
```

---

## Code Splitting Strategies

### Route-Based Splitting (Automatic)

```typescript
// Next.js automatically code-splits by route
// Each page is a separate chunk

// src/app/page.tsx - Homepage chunk
export default function HomePage() { }

// src/app/dashboard/page.tsx - Dashboard chunk
export default function DashboardPage() { }

// src/app/settings/page.tsx - Settings chunk
export default function SettingsPage() { }
```

### Component-Based Splitting

```typescript
// ✅ Good: Split heavy components
'use client'

import dynamic from 'next/dynamic'

const HeavyEditor = dynamic(() => import('@/components/Editor'), {
  loading: () => <EditorSkeleton />,
})

const DataVisualization = dynamic(
  () => import('@/components/Charts'),
  { ssr: false } // Browser-only
)
```

### Library-Based Splitting

```typescript
// ✅ Good: Load libraries on interaction
'use client'

export function ExportButton({ data }) {
  const handleExport = async () => {
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    // ... export logic
  }
  
  return <button onClick={handleExport}>Export to Excel</button>
}
```

---

## Performance Budgets

### Configuration

```typescript
// next.config.ts
const nextConfig = {
  // Bundle analyzer
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      )
    }
    return config
  },
}
```

### Lighthouse CI

```json
// .lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }]
      }
    }
  }
}
```

---

## Common Pitfalls

### ❌ Anti-Pattern: Large Client Components

```typescript
// ❌ Bad: Entire page as client component
'use client'

export default function Page() {
  // All JS sent to client
  return <div>...</div>
}

// ✅ Good: Granular client boundaries
// Page is Server Component
export default async function Page() {
  const data = await fetchData()
  return (
    <>
      <StaticHeader />
      <Suspense fallback={<Loading />}>
        <DynamicContent data={data} />
      </Suspense>
      <InteractiveWidget /> {/* Only this is client */}
    </>
  )
}
```

### ❌ Anti-Pattern: Missing Suspense Boundaries

```typescript
// ❌ Bad: Uncached async without Suspense
export default async function Page() {
  const data = await fetch('https://api.example.com/data') // Blocks render
  return <div>{data}</div>
}

// ✅ Good: Wrap in Suspense
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <DataComponent />
    </Suspense>
  )
}

async function DataComponent() {
  const data = await fetch('https://api.example.com/data')
  return <div>{data}</div>
}
```

### ❌ Anti-Pattern: Unoptimized Images

```typescript
// ❌ Bad: Native img tag
<img src="/large-photo.jpg" alt="Photo" />

// ✅ Good: next/image with optimization
<Image
  src="/large-photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 800px"
/>
```

### ❌ Anti-Pattern: Synchronous Large Data Processing

```typescript
// ❌ Bad: Blocks main thread
function processData(items) {
  return items.map(heavyComputation)
}

// ✅ Good: Chunked processing
async function processData(items) {
  const results = []
  for (let i = 0; i < items.length; i += 100) {
    const chunk = items.slice(i, i + 100)
    results.push(...chunk.map(heavyComputation))
    await new Promise(resolve => setTimeout(resolve, 0))
  }
  return results
}
```

---

## Validation Checklist

Before deploying, verify:

### Build & Bundle
- [ ] Run `ANALYZE=true npm run build` - check bundle sizes
- [ ] No duplicate dependencies in bundle
- [ ] Client components are minimal

### Core Web Vitals
- [ ] LCP < 2.5s on mobile (PageSpeed Insights)
- [ ] INP < 200ms (Chrome DevTools)
- [ ] CLS < 0.1 (no layout shifts)
- [ ] TTFB < 800ms

### React Compiler
- [ ] No "Rules of React" warnings in console
- [ ] Manual memoization only where necessary

### PPR (if enabled)
- [ ] No "Uncached data" errors
- [ ] Suspense boundaries around dynamic content
- [ ] Proper `cacheLife` configurations

### Images
- [ ] All images use `next/image`
- [ ] Hero images have `priority` prop
- [ ] Remote images configured in `next.config.ts`

### Lazy Loading
- [ ] Heavy components below fold use `next/dynamic`
- [ ] External libraries loaded on-demand
- [ ] No unused JavaScript in initial bundle

---

## Resources

- [Next.js Performance Docs](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Compiler Docs](https://react.dev/learn/react-compiler)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Core Web Vitals - Google Search](https://developers.google.com/search/docs/appearance/core-web-vitals)

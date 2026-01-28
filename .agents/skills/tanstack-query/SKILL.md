---
name: tanstack-query
description: TanStack Query (React Query) for data fetching, caching, and server state management in Next.js 16 - UPDATED with lessons learned
license: MIT
compatibility: React >=19.0.0, Next.js >=16.0.0, TanStack Query >=5.0.0
---

# TanStack Query Skill

Powerful asynchronous state management for React 19 and Next.js 16. TanStack Query handles caching, background updates, and stale data while you focus on building UI.

---

## ⚠️ CRITICAL LESSONS LEARNED (Read First!)

Based on real implementation experience, here are the critical fixes for common issues:

### 1. Optimistic Updates with React 19

**❌ WRONG - Will cause warning:**
```tsx
addOptimisticUpdate({ transactionId, newStatus });
```

**✅ CORRECT - Must be wrapped in transition:**
```tsx
const [, startOptimisticUpdate] = useTransition();

startOptimisticUpdate(() => {
  addOptimisticUpdate({ transactionId, newStatus });
});
```

**Why:** React 19 requires optimistic state updates to occur within a transition for proper error handling and automatic rollback.

### 2. Pagination Loading Animation

**❌ WRONG - Animation disappears too fast:**
```tsx
const [isPending, startTransition] = useTransition();
// isPending only lasts during the render, not the actual fetch
```

**✅ CORRECT - Use state with minimum delay:**
```tsx
const [isNavigating, setIsNavigating] = useState(false);

// Set navigation state when changing page
const handleNextPage = () => {
  setIsNavigating(true);
  setCurrentPage(prev => prev + 1);
};

// Reset when data is fetched (with minimum UX delay)
useEffect(() => {
  if (!isFetching && isNavigating) {
    const timeout = setTimeout(() => {
      setIsNavigating(false);
    }, 300); // Minimum 300ms to show loading state
    return () => clearTimeout(timeout);
  }
}, [isFetching, isNavigating]);
```

**Why:** `placeholderData` makes `isFetching` false immediately when cached data is available.

### 3. Parallel Mutations (Individual Button States)

**❌ WRONG - All buttons disabled during any mutation:**
```tsx
disabled={isPending || isFetching} // All buttons disabled!
```

**✅ CORRECT - Track individual mutation states:**
```tsx
const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

const handleUpdate = async (id: string) => {
  if (pendingIds.has(id)) return;
  
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
disabled={pendingIds.has(item.id)} // Only this button disabled
```

### 4. Table Animations with Motion

**❌ WRONG - Hydration error:**
```tsx
<tbody>
  <motion.div> {/* ❌ div in tbody */}
    {rows.map(row => (
      <motion.tr key={row.id}>...</motion.tr>
    ))}
  </motion.div>
</tbody>
```

**✅ CORRECT - Animate rows directly:**
```tsx
<tbody>
  {rows.map((row, index) => (
    <motion.tr
      key={row.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      ...
    </motion.tr>
  ))}
</tbody>
```

**Why:** HTML table structure must remain valid. `motion.tr` works but `motion.div` inside `tbody` breaks hydration.

---

## Installation

```bash
pnpm add @tanstack/react-query
pnpm add -D @tanstack/react-query-devtools
```

---

## Setup

### 1. Create Query Client Provider

```typescript
// src/lib/query-client.ts
import { isServer, QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// For SSR safety, check if running on server
if (isServer) {
  // Server-specific configuration
}
```

### 2. Create Provider Component

```typescript
// src/components/providers/query-provider.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 3. Wrap App with Provider

```tsx
// src/app/layout.tsx
import { QueryProvider } from "@/components/providers/query-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

## Core Concepts

### Query Keys

Query keys uniquely identify and cache your data:

```typescript
// Simple key
['users']

// With ID
['users', userId]

// With filters
['users', { page: 1, search: 'john' }]

// Nested resources
['posts', postId, 'comments']

// Current user (always refetch)
['me']
```

### Query Functions

```typescript
// Simple fetch
const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

// With parameters
const fetchUser = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};
```

---

## useQuery Hook

### Basic Usage

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

export function UserList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Query States

```tsx
const {
  data,           // undefined until first successful fetch
  isLoading,      // true if no cached data and fetching
  isFetching,     // true if fetching (regardless of cache)
  isError,        // true if error occurred
  error,          // Error object if failed
  isSuccess,      // true if data available
  status,         // 'pending' | 'error' | 'success'
  fetchStatus,    // 'fetching' | 'paused' | 'idle'
  refetch,        // Function to manually refetch
} = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});
```

### Dynamic Query Keys

```tsx
export function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useQuery({
    queryKey: ['users', userId], // Key changes when userId changes
    queryFn: () => fetchUser(userId),
    enabled: !!userId, // Only fetch if userId exists
  });

  return <div>{user?.name}</div>;
}
```

### Query Options

```tsx
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  
  // Timing
  staleTime: 5 * 60 * 1000,      // Consider fresh for 5 minutes
  gcTime: 10 * 60 * 1000,        // Keep in cache for 10 minutes (formerly cacheTime)
  refetchInterval: 30 * 1000,    // Auto-refetch every 30s
  
  // Behavior
  enabled: true,                  // Auto-fetch on mount
  retry: 3,                       // Retry 3 times on failure
  retryDelay: 1000,               // Wait 1s between retries
  refetchOnWindowFocus: true,     // Refetch when tab regains focus
  refetchOnReconnect: true,       // Refetch when network reconnects
});
```

---

## useMutation Hook

### Basic Mutation

```tsx
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

const createUser = async (newUser: NewUser): Promise<User> => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
};

export function CreateUserForm() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    mutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create User'}
      </button>
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
      {mutation.isSuccess && <div>User created!</div>}
    </form>
  );
}
```

### Mutation States

```tsx
const mutation = useMutation({
  mutationFn: createUser,
});

// mutation.status: 'idle' | 'pending' | 'error' | 'success'
// mutation.isPending: true during mutation
// mutation.isError: true if error
// mutation.isSuccess: true if success
// mutation.data: returned data on success
// mutation.error: error on failure
// mutation.reset(): reset to idle state
```

---

## Cache Invalidation

### Automatic Refetching

```tsx
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    // Invalidate all queries with key starting with ['users']
    queryClient.invalidateQueries({ queryKey: ['users'] });
    
    // Or invalidate specific query
    queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
  },
});
```

### Optimistic Updates

**Approach 1: UI-based (Simpler, Component-scoped)**
```tsx
const addTodoMutation = useMutation({
  mutationFn: addTodo,
});

// In component
const { isPending, variables, mutate } = addTodoMutation;

<ul>
  {todos.map(todo => <li key={todo.id}>{todo.text}</li>)}
  {/* Temporary item with reduced opacity during mutation */}
  {isPending && <li style={{ opacity: 0.5 }}>{variables}</li>}
</ul>
```

**Approach 2: Cache-based (Multi-component, Rollback support)**
```tsx
const queryClient = useQueryClient();

useMutation({
  mutationFn: updateTodo,
  
  // 1. Before mutation: cancel queries + snapshot + optimistic update
  onMutate: async (newTodo) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['todos'] });
    
    // Snapshot previous value
    const previousTodos = queryClient.getQueryData(['todos']);
    
    // Optimistically update cache
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo]);
    
    // Return context for rollback
    return { previousTodos };
  },
  
  // 2. On error, rollback
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previousTodos);
  },
  
  // 3. Always refetch after error or success
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

### Manual Cache Updates

```tsx
// Set data directly
queryClient.setQueryData(['users', id], updatedUser);

// Update with function
queryClient.setQueryData(['users'], (old: User[] | undefined) => 
  old?.map(u => u.id === id ? updatedUser : u)
);

// Remove from cache
queryClient.removeQueries({ queryKey: ['users', id] });

// Reset all cache
queryClient.clear();
```

---

## Infinite Queries (Pagination)

### Cursor-based Pagination

```tsx
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

const fetchProjects = async ({ pageParam }: { pageParam?: string }) => {
  const url = pageParam 
    ? `/api/projects?cursor=${pageParam}` 
    : '/api/projects';
  const response = await fetch(url);
  return response.json();
};

export function ProjectList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  if (status === 'pending') return <div>Loading...</div>;

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.projects.map((project) => (
            <div key={project.id}>{project.name}</div>
          ))}
        </div>
      ))}
      
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
      </button>
    </div>
  );
}
```

### Memory Management with maxPages

Limit the number of pages kept in memory to prevent memory leaks in long-running infinite queries:

```tsx
useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  maxPages: 10, // Keep only 10 pages in cache
  // Required when maxPages is set:
  getPreviousPageParam: (firstPage) => firstPage.prevCursor,
})
```

**Note**: When `maxPages` is set, you must also provide `getPreviousPageParam` to enable bi-directional pagination.

### Page Number Pagination with Loading State

```tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function PaginatedList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['items', currentPage],
    queryFn: () => fetchItems(currentPage),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });

  // Keep loading state visible for minimum UX duration
  useEffect(() => {
    if (!isFetching && isNavigating) {
      const timeout = setTimeout(() => setIsNavigating(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isFetching, isNavigating]);

  const handlePageChange = (newPage: number) => {
    setIsNavigating(true);
    setCurrentPage(newPage);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {/* Items */}
      {data?.items.map(item => <div key={item.id}>{item.name}</div>)}
      
      {/* Pagination with loading state */}
      <div className="flex gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isNavigating}
        >
          {isNavigating ? <LoadingSpinner /> : 'Previous'}
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!data?.hasMore || isNavigating}
        >
          {isNavigating ? <LoadingSpinner /> : 'Next'}
        </button>
      </div>
    </div>
  );
}
```

---

## Next.js 16 Integration

### Server Components + TanStack Query

```tsx
// Server Component fetches initial data
// src/app/users/page.tsx (Server Component)
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { UserList } from "./user-list";

async function getUsers() {
  const res = await fetch('https://api.example.com/users');
  return res.json();
}

export default async function UsersPage() {
  // Prefetch on server
  await queryClient.prefetchQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserList />
    </HydrationBoundary>
  );
}
```

```tsx
// Client Component uses cached data
// src/app/users/user-list.tsx
"use client";

import { useQuery } from "@tanstack/react-query";

const fetchUsers = async () => {
  const res = await fetch('https://api.example.com/users');
  return res.json();
};

export function UserList() {
  // Uses server-fetched data immediately, no loading state
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  return (
    <ul>
      {data?.map((user) => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### When to use TanStack Query vs Server Components

| Use Case | Solution | Why |
|----------|----------|-----|
| Initial page data | **Server Component** | SEO, instant render, no JS |
| User interactions | **TanStack Query** | Caching, background updates |
| Real-time data | **TanStack Query** | Polling, refetch intervals |
| Mutations | **TanStack Query** | Optimistic updates, cache invalidation |
| Search/filters | **TanStack Query** | Keep URL state, cache results |
| Dashboard widgets | **TanStack Query** | Independent loading, retries |

### Streaming SSR with Pending Queries (v5.40+)

Starting with v5.40, TanStack Query supports streaming SSR with pending queries. This allows components to start fetching without blocking rendering.

**Server Component:**
```tsx
// app/posts/page.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import { Posts } from './posts'

async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  return res.json()
}

export default async function PostsPage() {
  const queryClient = getQueryClient()
  
  // No await! Query starts but doesn't block rendering
  queryClient.prefetchQuery({ queryKey: ['posts'], queryFn: getPosts })
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Posts />
    </HydrationBoundary>
  )
}
```

**Client Component with useSuspenseQuery:**
```tsx
// app/posts/posts.tsx
'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  return res.json()
}

export function Posts() {
  // data is never undefined - no isPending needed!
  const { data } = useSuspenseQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  return (
    <ul>
      {data.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

**Enable in QueryClient:**
```tsx
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
})
```

---

## Prefetching Patterns

### Prefetch on Hover

```tsx
"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export function UserLink({ userId, name }: { userId: string; name: string }) {
  const queryClient = useQueryClient();

  return (
    <Link
      href={`/users/${userId}`}
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: ['users', userId],
          queryFn: () => fetchUser(userId),
          staleTime: 60 * 1000,
        });
      }}
    >
      {name}
    </Link>
  );
}
```

### Parallel Queries

```tsx
"use client";

import { useQueries } from "@tanstack/react-query";

export function Dashboard() {
  const results = useQueries({
    queries: [
      { queryKey: ['stats'], queryFn: fetchStats },
      { queryKey: ['notifications'], queryFn: fetchNotifications },
      { queryKey: ['activities'], queryFn: fetchActivities },
    ],
  });

  const [stats, notifications, activities] = results;

  if (stats.isLoading || notifications.isLoading || activities.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <StatsCard data={stats.data} />
      <Notifications data={notifications.data} />
      <ActivityFeed data={activities.data} />
    </div>
  );
}
```

---

## Error Handling

### Global Error Handler

```tsx
// src/lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  queryCache: {
    onError: (error) => {
      console.error('Query error:', error);
      // Send to error tracking service
    },
  },
  mutationCache: {
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  },
});
```

### Error Boundaries with TanStack Query

```tsx
"use client";

import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

export function UserListWithErrorBoundary() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => (
            <div>
              <p>There was an error!</p>
              <button onClick={resetErrorBoundary}>Try again</button>
            </div>
          )}
        >
          <UserList />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

---

## Best Practices

### 1. Keep Query Keys Consistent

```typescript
// Create a centralized key factory
export const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Filter) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  posts: {
    all: ['posts'] as const,
    // ...
  },
};

// Usage
useQuery({
  queryKey: queryKeys.users.detail(userId),
  queryFn: () => fetchUser(userId),
});
```

### 2. Extract Query Options

The `queryOptions` helper provides better type inference and reusability:

```typescript
// src/lib/queries/users.ts
import { queryOptions } from '@tanstack/react-query'

export const userQueries = {
  all: () =>
    queryOptions({
      queryKey: ['users'],
      queryFn: fetchUsers,
    }),
  
  byId: (id: string) =>
    queryOptions({
      queryKey: ['users', id],
      queryFn: () => fetchUser(id),
      enabled: !!id,
    }),
  
  lists: () =>
    queryOptions({
      queryKey: ['users', 'list'],
      queryFn: fetchUserLists,
      staleTime: 5 * 60 * 1000,
    }),
}
```

**Usage in Components:**
```tsx
// Automatic type inference!
const { data } = useQuery(userQueries.byId(userId))
```

**Usage for Prefetching:**
```tsx
// Same options work for prefetching
await queryClient.prefetchQuery(userQueries.byId(userId))
```

**Benefits:**
- Full type inference without explicit generics
- Centralized query configuration
- Reusable across components and prefetching
- Refactoring is easier (change in one place)

### 3. Use Suspense (Optional)

```tsx
import { useSuspenseQuery } from "@tanstack/react-query";

// Throws promise while loading, works with React Suspense
function UserDetails({ userId }: { userId: string }) {
  const { data } = useSuspenseQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
  });

  return <div>{data.name}</div>;
}

// With Suspense boundary
<Suspense fallback={<Skeleton />}>
  <UserDetails userId={id} />
</Suspense>
```

### 4. Mutations with Zustand

```tsx
"use client";

import { useMutation } from "@tanstack/react-query";
import { useCartStore } from "@/lib/store/cart";

export function AddToCartButton({ product }) {
  const addItem = useCartStore((state) => state.addItem);
  
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Update Zustand store with server response
      addItem(data.item);
    },
  });

  return (
    <button onClick={() => mutation.mutate()}>
      Add to Cart
    </button>
  );
}
```

---

## Quick Command Reference

```bash
# DevTools
# Press Cmd+Shift+K (Mac) or Ctrl+Shift+K (Windows) to toggle
```

### Essential Hooks

| Hook | Purpose |
|------|---------|
| `useQuery` | Fetch and cache data |
| `useMutation` | Create/update/delete data |
| `useInfiniteQuery` | Paginated/infinite lists |
| `useQueries` | Parallel queries |
| `useQueryClient` | Access cache, invalidate, prefetch |
| `useSuspenseQuery` | Suspense-compatible query |

### Query Client Methods

```typescript
// Invalidation
queryClient.invalidateQueries({ queryKey: ['users'] });

// Manual update
queryClient.setQueryData(['users', id], updatedUser);

// Prefetch
queryClient.prefetchQuery({ queryKey: ['users'], queryFn: fetchUsers });

// Reset
queryClient.resetQueries({ queryKey: ['users'] });

// Remove
queryClient.removeQueries({ queryKey: ['users', id] });
```

---

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [React Query Devtools](https://tanstack.com/query/latest/docs/framework/react/devtools)
- [Query Key Factory Pattern](https://tkdodo.eu/blog/effective-react-query-keys)
- [Optimistic Updates Guide](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

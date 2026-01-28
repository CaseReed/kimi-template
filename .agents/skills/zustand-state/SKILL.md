---
name: zustand-state
description: Zustand state management patterns for React 19 + Next.js 16
license: MIT
compatibility: React >=19.0.0, Next.js >=16.0.0, Zustand >=5.0.0
---

# Zustand State Management Skill

Lightweight, powerful state management for React 19 and Next.js 16.

## Installation

```bash
pnpm add zustand
```

## Basic Store

```typescript
// src/lib/store/counter.ts
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

```tsx
// Component usage
import { useCounterStore } from '@/lib/store/counter';

export function Counter() {
  const { count, increment, decrement } = useCounterStore();
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

## Async Actions

```typescript
// src/lib/store/user.ts
import { create } from 'zustand';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: (id: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  
  fetchUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const user = await fetch(`/api/users/${id}`).then(r => r.json());
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch user', isLoading: false });
    }
  },
  
  updateUser: async (data) => {
    set({ isLoading: true });
    try {
      const updated = await fetch('/api/users', {
        method: 'PUT',
        body: JSON.stringify(data),
      }).then(r => r.json());
      set({ user: updated, isLoading: false });
    } catch (error) {
      set({ error: 'Update failed', isLoading: false });
    }
  },
}));
```

## Persistence (localStorage)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
    }),
    {
      name: 'theme-storage', // localStorage key
    }
  )
);
```

## Handling Hydration with Persist Middleware

When using persist middleware in Next.js, you may encounter hydration mismatches. Use `skipHydration` to prevent this:

```tsx
// stores/user-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  name: string
  setName: (name: string) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: '',
      setName: (name) => set({ name }),
    }),
    {
      name: 'user-storage',
      skipHydration: true, // Prevents hydration mismatch
    },
  ),
)
```

Then rehydrate in your component:

```tsx
// components/user-profile.tsx
'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/stores/user-store'

export function UserProfile() {
  useEffect(() => {
    useUserStore.persist.rehydrate()
  }, [])

  const name = useUserStore((state) => state.name)

  if (!useUserStore.persist.hasHydrated()) {
    return <div>Loading...</div>
  }

  return <div>Hello, {name}</div>
}
```

Or use a provider-based approach:

```tsx
// providers/user-store-provider.tsx
'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/stores/user-store'

export function UserStoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    useUserStore.persist.rehydrate()
  }, [])

  return <>{children}</>
}
```

## Next.js App Router Integration

**⚠️ IMPORTANT**: For Next.js App Router, use the Context-based provider pattern to avoid:
- Store sharing between requests on the server
- Hydration mismatches
- State leakage between users

### Step 1: Create Vanilla Store

```tsx
// src/stores/counter-store.ts
import { createStore } from 'zustand/vanilla'

export type CounterState = {
  count: number
}

export type CounterActions = {
  increment: () => void
  decrement: () => void
}

export type CounterStore = CounterState & CounterActions

export const defaultInitState: CounterState = {
  count: 0,
}

export const createCounterStore = (
  initState: CounterState = defaultInitState,
) => {
  return createStore<CounterStore>()((set) => ({
    ...initState,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }))
}
```

### Step 2: Create React Provider

```tsx
// src/providers/counter-store-provider.tsx
'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'
import { type CounterStore, createCounterStore } from '@/stores/counter-store'

export type CounterStoreApi = ReturnType<typeof createCounterStore>

export const CounterStoreContext = createContext<CounterStoreApi | undefined>(
  undefined,
)

export interface CounterStoreProviderProps {
  children: ReactNode
  initialState?: CounterState
}

export const CounterStoreProvider = ({
  children,
  initialState,
}: CounterStoreProviderProps) => {
  const storeRef = useRef<CounterStoreApi>()
  if (!storeRef.current) {
    storeRef.current = createCounterStore(initialState)
  }

  return (
    <CounterStoreContext.Provider value={storeRef.current}>
      {children}
    </CounterStoreContext.Provider>
  )
}

export const useCounterStore = <T,>(
  selector: (store: CounterStore) => T,
): T => {
  const counterStoreContext = useContext(CounterStoreContext)

  if (!counterStoreContext) {
    throw new Error(
      `useCounterStore must be used within CounterStoreProvider`,
    )
  }

  return useStore(counterStoreContext, selector)
}
```

### Step 3: Wrap Your App

```tsx
// app/layout.tsx
import { CounterStoreProvider } from '@/providers/counter-store-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CounterStoreProvider>
      {children}
    </CounterStoreProvider>
  )
}
```

### Step 4: Use in Components

```tsx
// components/counter.tsx
'use client'

import { useShallow } from 'zustand/shallow'
import { useCounterStore } from '@/providers/counter-store-provider'

export function Counter() {
  const { count, increment } = useCounterStore(
    useShallow((state) => ({ count: state.count, increment: state.increment })),
  )

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  )
}
```

### Alternative: Simple Global Store

If you have a simple global store that doesn't contain user-specific data:

```tsx
// stores/global-store.ts
import { create } from 'zustand'

interface GlobalState {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useGlobalStore = create<GlobalState>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
```

> **Note**: Only use this pattern for truly global UI state that doesn't contain user-specific data.

## Selectors (Performance)

```typescript
// ❌ Bad: Re-renders on any state change
const state = useCartStore();

// ✅ Good: Only re-renders when items change
const items = useCartStore((state) => state.items);

// ✅ Good: Only re-renders when specific derived value changes
const totalPrice = useCartStore((state) => state.getTotalPrice());
```

## Selecting Multiple State Slices with useShallow

**⚠️ CRITICAL for Zustand v5**: When selecting multiple properties from the store, you MUST use `useShallow` to prevent unnecessary re-renders and infinite loops.

**❌ WRONG - Causes infinite loop in v5:**
```tsx
// v4 pattern - BREAKS in v5
import { shallow } from 'zustand/shallow'

const { count, text } = useBearStore(
  (state) => ({ count: state.count, text: state.text }),
  shallow, // v4 second argument - no longer works in v5
)
```

**✅ CORRECT - v5 pattern with useShallow:**
```tsx
import { useShallow } from 'zustand/shallow'

// Object pick - only re-renders when nuts or honey change
const { nuts, honey } = useBearStore(
  useShallow((state) => ({ nuts: state.nuts, honey: state.honey })),
)

// Array pick
const [nuts, honey] = useBearStore(
  useShallow((state) => [state.nuts, state.honey]),
)

// Map/Set pick
const ids = useBearStore(useShallow((state) => Object.keys(state.items)))
```

**Why this matters:**
In v5, `create` no longer supports custom equality functions as a second argument. `useShallow` uses the `use-sync-external-store` shim internally to provide efficient shallow comparison.

**Installation:**
`useShallow` is included in zustand v5, no additional package needed.

## Multiple Slices Pattern

```typescript
// src/lib/store/index.ts
import { create } from 'zustand';

// Auth Slice
interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

// UI Slice  
interface UISlice {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

// Combined Store
interface AppStore extends AuthSlice, UISlice {}

export const useAppStore = create<AppStore>((set) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  
  // UI
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
}));
```

## DevTools

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create<StoreState>()(
  devtools(
    (set) => ({
      // your state
    }),
    { name: 'MyStore' } // Name appears in Redux DevTools
  )
);
```

## Immer Middleware

For immutable updates with mutable syntax:

**Installation:**
```bash
pnpm add zustand immer  # immer is required for immer middleware
```

**Usage:**
```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface State {
  user: {
    name: string
    settings: {
      theme: 'light' | 'dark'
    }
  }
  updateTheme: (theme: 'light' | 'dark') => void
}

export const useStore = create<State>()(
  immer((set) => ({
    user: {
      name: 'John',
      settings: {
        theme: 'light',
      },
    },
    updateTheme: (theme) =>
      set((state) => {
        state.user.settings.theme = theme // Mutable syntax!
      }),
  })),
)
```

## When to Use What?

| State Type | Solution | Example |
|------------|----------|---------|
| Global UI State | Zustand | Theme, sidebar, modals |
| User Data | Zustand + Persistence | Auth, preferences |
| Shopping Cart | Zustand + Persistence | Cart items |
| Server Data | React 19 + Server Components | Product lists, user profiles |
| Form State | React 19 native or RHF | Form inputs |
| URL State | nuqs or native | Filters, pagination |

## Best Practices

1. **Keep stores focused** - One store per domain (cart, user, theme)
2. **Use selectors** - Always select specific state to avoid re-renders
3. **Separate server/client** - Server data in Server Components, UI state in Zustand
4. **Persist wisely** - Only persist necessary state (not loading states)
5. **Type everything** - Use TypeScript for full type safety

## Quick Reference

```typescript
// Create store
const useStore = create<State>((set, get) => ({
  // State
  value: 0,
  
  // Simple setter
  setValue: (value) => set({ value }),
  
  // Based on previous state
  increment: () => set((state) => ({ value: state.value + 1 })),
  
  // Using get() to access current state
  logValue: () => console.log(get().value),
}));

// Use in component
const value = useStore((state) => state.value);
const increment = useStore((state) => state.increment);
```

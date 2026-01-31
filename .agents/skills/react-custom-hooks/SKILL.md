---
name: react-custom-hooks
description: Best practices for creating custom React hooks with TypeScript. Use when building custom hooks for React 19, implementing reusable stateful logic, creating data fetching hooks, form handling hooks, or browser API integration hooks.
license: MIT
compatibility: React >=19, TypeScript >=5
---

# React Custom Hooks

Guide for creating robust, reusable, and type-safe custom hooks in React 19.

## Rules of Hooks

### Only Call Hooks at Top Level

Never call hooks inside loops, conditions, or nested functions:

```typescript
// ❌ Bad: Conditional hook call
function useConditionalData(condition: boolean) {
  if (condition) {
    const [data, setData] = useState(null); // Error!
  }
}

// ✅ Good: Hooks at top level
function useConditionalData(condition: boolean) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    if (condition) {
      fetchData().then(setData);
    }
  }, [condition]);
  
  return data;
}
```

### Only Call Hooks from React Functions

Valid contexts for hooks:
- React function components
- Custom hooks (functions starting with `use`)

```typescript
// ❌ Bad: Hook in regular function
function calculateValue() {
  const [value, setValue] = useState(0); // Error!
  return value * 2;
}

// ✅ Good: Custom hook
function useCalculatedValue() {
  const [value, setValue] = useState(0);
  return value * 2;
}
```

### Naming Convention

All custom hooks must start with `use`:

```typescript
// ✅ Good
function useLocalStorage<T>(key: string, initialValue: T) { }
function useDebounce<T>(value: T, delay: number) { }
function useWindowSize() { }

// ❌ Bad
function localStorageHook(key: string) { }
function getWindowSize() { }
```

### ESLint Configuration

Use the official ESLint plugin to enforce rules:

```bash
npm install eslint-plugin-react-hooks --save-dev
```

```typescript
// eslint.config.mjs (Flat Config - ESLint 9+)
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import hooksPlugin from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      "react-hooks": hooksPlugin,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
```

## Hook Patterns

### useState + useEffect Pattern

Standard pattern for side effects with state:

```typescript
import { useState, useEffect, useRef } from 'react';

function useFetchData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use ref to track if component is mounted
  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    setIsLoading(true);
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (isMounted.current) {
          setData(data);
          setIsLoading(false);
        }
      })
      .catch(error => {
        if (isMounted.current) {
          setError(error);
          setIsLoading(false);
        }
      });
    
    return () => {
      isMounted.current = false;
    };
  }, [url]);
  
  return { data, error, isLoading };
}
```

### useCallback + useMemo for Optimization

Prevent unnecessary re-renders and recalculations:

```typescript
import { useState, useCallback, useMemo } from 'react';

interface UseSearchOptions<T> {
  items: T[];
  searchFields: (keyof T)[];
}

function useSearch<T extends Record<string, unknown>>({
  items,
  searchFields
}: UseSearchOptions<T>) {
  const [query, setQuery] = useState('');
  
  // Memoize the filter function reference
  const filterItems = useCallback((item: T, searchQuery: string) => {
    const lowerQuery = searchQuery.toLowerCase();
    return searchFields.some(field => {
      const value = item[field];
      return String(value).toLowerCase().includes(lowerQuery);
    });
  }, [searchFields]);
  
  // Memoize the filtered results
  const filteredItems = useMemo(() => {
    if (!query) return items;
    return items.filter(item => filterItems(item, query));
  }, [items, query, filterItems]);
  
  // Memoize callback for updating query
  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);
  
  return {
    query,
    setQuery: handleSearch,
    filteredItems
  };
}
```

### useRef for Mutable Values

Use refs for values that don't trigger re-renders:

```typescript
import { useRef, useEffect } from 'react';

function usePrevious<T>(value: T): T | undefined {
  const prevRef = useRef<T>();
  const currentRef = useRef<T>(value);
  
  useEffect(() => {
    prevRef.current = currentRef.current;
    currentRef.current = value;
  }, [value]);
  
  return prevRef.current;
}

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();
  
  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
```

### useSyncExternalStore for External State

Subscribe to external data sources:

```typescript
import { useSyncExternalStore } from 'react';

function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    // Subscribe function
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    // Get snapshot
    () => navigator.onLine,
    // Get server snapshot (SSR)
    () => true
  );
}

// Usage with external store
interface Store<T> {
  subscribe(callback: () => void): () => void;
  getSnapshot(): T;
  getServerSnapshot?(): T;
}

function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(
    store.subscribe.bind(store),
    store.getSnapshot.bind(store),
    store.getServerSnapshot?.bind(store) ?? store.getSnapshot.bind(store)
  );
}
```

## Common Hook Examples

### useLocalStorage (with SSR support)

```typescript
import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get stored value or initial value
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);
  
  const [storedValue, setStoredValue] = useState<T>(readValue);
  
  // Update localStorage when state changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch custom event for cross-tab sync
        window.dispatchEvent(new StorageEvent('storage', { key }));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);
  
  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        setStoredValue(JSON.parse(event.newValue) as T);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);
  
  return [storedValue, setValue, removeValue];
}
```

### useDebounce

```typescript
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage with callback
import { useCallback, useRef } from 'react';

function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}
```

### useThrottle

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';

function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));
    
    return () => clearTimeout(handler);
  }, [value, limit]);
  
  return throttledValue;
}

// Throttled callback
function useThrottledCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const lastRan = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastRan.current >= limit) {
      callback(...args);
      lastRan.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRan.current = Date.now();
      }, limit - (now - lastRan.current));
    }
  }, [callback, limit]);
}
```

### useFetch (with React 19 use())

```typescript
import { use, useState, useCallback, useTransition } from 'react';

interface FetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

function useFetch<T>(url: string | null) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: false
  });
  const [isPending, startTransition] = useTransition();
  
  const execute = useCallback(async (options?: RequestInit) => {
    if (!url) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      startTransition(() => {
        setState({ data, error: null, isLoading: false });
      });
      
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({ data: null, error: err, isLoading: false });
      throw err;
    }
  }, [url]);
  
  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);
  
  return {
    ...state,
    execute,
    reset,
    isPending
  };
}

// For use with React 19's use() - create a resource wrapper
interface Resource<T> {
  read(): T;
}

function createResource<T>(promise: Promise<T>): Resource<T> {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: T;
  let error: Error;
  
  const suspender = promise.then(
    (data) => {
      status = 'success';
      result = data;
    },
    (err) => {
      status = 'error';
      error = err instanceof Error ? err : new Error(String(err));
    }
  );
  
  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw error;
      }
      return result;
    }
  };
}

function useDataResource<T>(url: string): Resource<T> {
  const [resource] = useState(() => 
    createResource(
      fetch(url).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
    )
  );
  return resource;
}
```

### useWindowSize

```typescript
import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}
```

### useMediaQuery

```typescript
import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Legacy API
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);
  
  return matches;
}

// Common breakpoints
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
```

### useOnClickOutside

```typescript
import { useEffect, RefObject } from 'react';

function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;
      
      // Do nothing if clicking ref's element or descendent elements
      if (!element || element.contains(event.target as Node)) {
        return;
      }
      
      handler(event);
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Usage example
// function Dropdown() {
//   const ref = useRef<HTMLDivElement>(null);
//   const [isOpen, setIsOpen] = useState(false);
//   
//   useOnClickOutside(ref, () => setIsOpen(false));
//   
//   return (
//     <div ref={ref}>
//       <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
//       {isOpen && <div className="dropdown-menu">...</div>}
//     </div>
//   );
// }
```

### useKeyboard

```typescript
import { useEffect, useCallback } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface KeyBinding {
  key: string;
  handler: KeyHandler;
  modifier?: 'ctrl' | 'alt' | 'shift' | 'meta';
}

function useKeyboard(bindings: KeyBinding[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const binding of bindings) {
      const keyMatches = event.key.toLowerCase() === binding.key.toLowerCase();
      
      const modifierMatches = binding.modifier
        ? event[`${binding.modifier}Key`]
        : !event.ctrlKey && !event.altKey && !event.metaKey;
      
      if (keyMatches && modifierMatches) {
        event.preventDefault();
        binding.handler(event);
        break;
      }
    }
  }, [bindings]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Simple hook for single key
function useKeyPress(
  targetKey: string,
  callback: () => void,
  options?: { preventDefault?: boolean }
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        if (options?.preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [targetKey, callback, options?.preventDefault]);
}

// Hook for keyboard shortcuts
function useHotkey(
  keys: string,
  callback: (event: KeyboardEvent) => void
) {
  useEffect(() => {
    const parts = keys.toLowerCase().split('+');
    const key = parts[parts.length - 1];
    const modifiers = parts.slice(0, -1);
    
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyMatch = event.key.toLowerCase() === key;
      const ctrlMatch = modifiers.includes('ctrl') === event.ctrlKey;
      const altMatch = modifiers.includes('alt') === event.altKey;
      const shiftMatch = modifiers.includes('shift') === event.shiftKey;
      const metaMatch = modifiers.includes('meta') === event.metaKey;
      
      if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
        event.preventDefault();
        callback(event);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keys, callback]);
}
```

## React 19 New Features

### Using use() in Custom Hooks

React 19 introduces the `use()` hook for unwrapping promises and context:

```typescript
import { use, useState, Suspense } from 'react';

// Usage with promises
function useUserData(userId: string) {
  // Can be called conditionally! (unlike other hooks)
  if (!userId) return null;
  
  const userPromise = fetchUser(userId); // Returns Promise<User>
  const user = use(userPromise);
  
  return user;
}

// Usage with Context
import { createContext } from 'react';

const ThemeContext = createContext<'light' | 'dark'>('light');

function useTheme() {
  // use() can be called conditionally
  const theme = use(ThemeContext);
  return theme;
}

// Data fetching with Suspense
function usePost(postId: string) {
  const [resource] = useState(() => 
    wrapPromise(fetchPost(postId))
  );
  
  return use(resource);
}

// Helper to wrap promises for Suspense
function wrapPromise<T>(promise: Promise<T>) {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: T;
  let error: Error;
  
  const suspender = promise.then(
    (data) => { status = 'success'; result = data; },
    (err) => { status = 'error'; error = err; }
  );
  
  return {
    read() {
      if (status === 'pending') throw suspender;
      if (status === 'error') throw error;
      return result;
    }
  };
}
```

### useFormStatus for Form Actions

```typescript
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

// Custom hook wrapping form status
function useFormState<T>() {
  const status = useFormStatus();
  
  return {
    isSubmitting: status.pending,
    formData: status.data ? Object.fromEntries(status.data) as T : null,
    isIdle: !status.pending && !status.data
  };
}

// Usage in a form component
function ContactForm() {
  return (
    <form action={submitAction}>
      <input name="email" type="email" required />
      <textarea name="message" required />
      <SubmitButton />
    </form>
  );
}

async function submitAction(formData: FormData) {
  'use server';
  // Server action
}
```

### useOptimistic for Optimistic Updates

```typescript
import { useOptimistic, useState, useTransition } from 'react';

interface Comment {
  id: string;
  text: string;
  optimistic?: boolean;
}

function useOptimisticComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isPending, startTransition] = useTransition();
  
  const [optimisticComments, addOptimisticComment] = useOptimistic<
    Comment[],
    string
  >(
    comments,
    (state, newText) => [
      ...state,
      { id: `optimistic-${Date.now()}`, text: newText, optimistic: true }
    ]
  );
  
  const addComment = async (text: string) => {
    // Immediately show optimistic update
    startTransition(() => {
      addOptimisticComment(text);
    });
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      
      const newComment = await response.json();
      
      // Replace optimistic comment with real one
      setComments(prev => [
        ...prev.filter(c => !c.optimistic),
        newComment
      ]);
    } catch (error) {
      // Revert: remove optimistic comment on error
      setComments(prev => prev.filter(c => !c.optimistic));
      throw error;
    }
  };
  
  return {
    comments: optimisticComments,
    addComment,
    isPending
  };
}

// Usage with multiple optimistic states
function useOptimisticTodoList() {
  type Todo = { id: string; text: string; completed: boolean };
  type OptimisticAction = 
    | { type: 'add'; text: string }
    | { type: 'toggle'; id: string }
    | { type: 'delete'; id: string };
  
  const [todos, setTodos] = useState<Todo[]>([]);
  
  const [optimisticTodos, updateOptimistic] = useOptimistic<
    Todo[],
    OptimisticAction
  >(
    todos,
    (state, action) => {
      switch (action.type) {
        case 'add':
          return [...state, { id: 'temp', text: action.text, completed: false }];
        case 'toggle':
          return state.map(t =>
            t.id === action.id ? { ...t, completed: !t.completed } : t
          );
        case 'delete':
          return state.filter(t => t.id !== action.id);
        default:
          return state;
      }
    }
  );
  
  return {
    todos: optimisticTodos,
    addTodo: (text: string) => updateOptimistic({ type: 'add', text }),
    toggleTodo: (id: string) => updateOptimistic({ type: 'toggle', id }),
    deleteTodo: (id: string) => updateOptimistic({ type: 'delete', id })
  };
}
```

## TypeScript Best Practices

### Generic Hooks

```typescript
import { useState, useCallback } from 'react';

// Basic generic hook
function useList<T>(initialValue: T[] = []) {
  const [items, setItems] = useState<T[]>(initialValue);
  
  const add = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);
  
  const remove = useCallback((predicate: (item: T) => boolean) => {
    setItems(prev => prev.filter(item => !predicate(item)));
  }, []);
  
  const update = useCallback((
    predicate: (item: T) => boolean,
    updater: (item: T) => T
  ) => {
    setItems(prev =>
      prev.map(item => (predicate(item) ? updater(item) : item))
    );
  }, []);
  
  return { items, add, remove, update, setItems };
}

// Generic with constraints
interface Identifiable {
  id: string;
}

function useEntityList<T extends Identifiable>() {
  const [entities, setEntities] = useState<T[]>([]);
  
  const add = useCallback((entity: T) => {
    setEntities(prev => [...prev, entity]);
  }, []);
  
  const remove = useCallback((id: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
  }, []);
  
  const update = useCallback((id: string, updates: Partial<T>) => {
    setEntities(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);
  
  const getById = useCallback((id: string) => {
    return entities.find(e => e.id === id);
  }, [entities]);
  
  return { entities, add, remove, update, getById };
}

// Generic with multiple type parameters
function useMap<K, V>(entries?: Iterable<[K, V]>) {
  const [map, setMap] = useState<Map<K, V>>(
    () => new Map(entries)
  );
  
  const set = useCallback((key: K, value: V) => {
    setMap(prev => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  }, []);
  
  const remove = useCallback((key: K) => {
    setMap(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);
  
  const clear = useCallback(() => {
    setMap(new Map());
  }, []);
  
  return { map, set, remove, clear, get: map.get.bind(map) };
}
```

### Return Type Tuples

```typescript
import { useState, useCallback } from 'react';

// Named tuple for clarity
type UseToggleReturn = [
  boolean,           // value
  () => void,        // toggle
  (value: boolean) => void  // set
];

function useToggle(initialValue = false): UseToggleReturn {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);
  
  return [value, toggle, setValue];
}

// Object return for named properties
interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (count: number) => void;
}

function useCounter(initialValue = 0, step = 1): UseCounterReturn {
  const [count, setCount] = useState(initialValue);
  
  return {
    count,
    increment: useCallback(() => setCount(c => c + step), [step]),
    decrement: useCallback(() => setCount(c => c - step), [step]),
    reset: useCallback(() => setCount(initialValue), [initialValue]),
    setCount
  };
}

// Discriminated union for loading states
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function useAsyncState<T>(): [
  AsyncState<T>,
  (promise: Promise<T>) => Promise<void>
] {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });
  
  const run = useCallback(async (promise: Promise<T>) => {
    setState({ status: 'loading' });
    
    try {
      const data = await promise;
      setState({ status: 'success', data });
    } catch (error) {
      setState({ 
        status: 'error', 
        error: error instanceof Error ? error : new Error(String(error)) 
      });
    }
  }, []);
  
  return [state, run];
}
```

### Overloads for Flexibility

```typescript
import { useState, useEffect } from 'react';

// Function overloads for different use cases
interface UseStorageOptions {
  serializer?: <T>(value: T) => string;
  deserializer?: <T>(value: string) => T;
}

// Overload 1: With initial value
function useStorage<T>(
  key: string,
  initialValue: T,
  storage?: Storage,
  options?: UseStorageOptions
): [T, (value: T | ((prev: T) => T)) => void, () => void];

// Overload 2: Without initial value (possibly undefined)
function useStorage<T>(
  key: string,
  initialValue?: undefined,
  storage?: Storage,
  options?: UseStorageOptions
): [T | undefined, (value: T | ((prev: T | undefined) => T | undefined)) => void, () => void];

// Implementation
function useStorage<T>(
  key: string,
  initialValue?: T,
  storage: Storage = localStorage,
  options: UseStorageOptions = {}
): [T | undefined, (value: T | ((prev: T | undefined) => T | undefined)) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse
  } = options;
  
  const [storedValue, setStoredValue] = useState<T | undefined>(() => {
    try {
      const item = storage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((prev: T | undefined) => T | undefined)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (valueToStore === undefined) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, serializer(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const removeValue = () => {
    storage.removeItem(key);
    setStoredValue(undefined);
  };
  
  return [storedValue, setValue, removeValue];
}
```

### Type Inference

```typescript
import { useState, useCallback } from 'react';

// Infer types from initial value
function useSet<T>(initialValue?: Iterable<T>) {
  const [set, setSet] = useState<Set<T>>(new Set(initialValue));
  
  const add = useCallback((value: T) => {
    setSet(prev => new Set([...prev, value]));
  }, []);
  
  const remove = useCallback((value: T) => {
    setSet(prev => {
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
  }, []);
  
  const has = useCallback((value: T) => set.has(value), [set]);
  
  const toggle = useCallback((value: T) => {
    setSet(prev => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);
  
  return { values: set, add, remove, has, toggle, size: set.size };
}

// Infer from fetcher return type
function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    isLoading: boolean;
  }>({
    data: null,
    error: null,
    isLoading: true
  });
  
  useEffect(() => {
    let cancelled = false;
    
    fetcher()
      .then(data => {
        if (!cancelled) {
          setState({ data, error: null, isLoading: false });
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState({ data: null, error, isLoading: false });
        }
      });
    
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  
  return state;
}

// Usage: T is inferred from fetchUser return type
// const { data: user } = useAsyncData(() => fetchUser(userId), [userId]);
```

## Testing Hooks

### renderHook from @testing-library/react

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCounter } from './useCounter';
import { useDebounce } from './useDebounce';
import { useLocalStorage } from './useLocalStorage';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    
    expect(result.current.count).toBe(0);
  });
  
  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    expect(result.current.count).toBe(10);
  });
  
  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
  
  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });
  
  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(10);
  });
});
```

### Testing Async Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from './useFetch';

describe('useFetch', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  
  afterEach(() => {
    jest.resetAllMocks();
  });
  
  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });
    
    const { result } = renderHook(() => useFetch('/api/test'));
    
    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    
    // Wait for data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });
  
  it('should handle fetch errors', async () => {
    const error = new Error('Network error');
    (fetch as jest.Mock).mockRejectedValueOnce(error);
    
    const { result } = renderHook(() => useFetch('/api/test'));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.error).toEqual(error);
    expect(result.current.data).toBeNull();
  });
  
  it('should refetch when url changes', async () => {
    const mockData1 = { id: 1 };
    const mockData2 = { id: 2 };
    
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockData1 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockData2 });
    
    const { result, rerender } = renderHook(
      ({ url }) => useFetch(url),
      { initialProps: { url: '/api/1' } }
    );
    
    await waitFor(() => expect(result.current.data).toEqual(mockData1));
    
    rerender({ url: '/api/2' });
    
    await waitFor(() => expect(result.current.data).toEqual(mockData2));
  });
});
```

### Mocking Dependencies

```typescript
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });
  
  it('should read from localStorage', () => {
    mockLocalStorage.setItem('key', JSON.stringify('stored value'));
    
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    
    expect(result.current[0]).toBe('stored value');
  });
  
  it('should use initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    
    expect(result.current[0]).toBe('default');
  });
  
  it('should write to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    
    act(() => {
      result.current[1]('new value');
    });
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'key',
      JSON.stringify('new value')
    );
    expect(result.current[0]).toBe('new value');
  });
  
  it('should support functional updates', () => {
    mockLocalStorage.setItem('counter', JSON.stringify(5));
    
    const { result } = renderHook(() => useLocalStorage<number>('counter', 0));
    
    act(() => {
      result.current[1]((prev) => (prev ?? 0) + 1);
    });
    
    expect(result.current[0]).toBe(6);
  });
  
  it('should remove item from localStorage', () => {
    mockLocalStorage.setItem('key', JSON.stringify('value'));
    
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    
    act(() => {
      result.current[2]();
    });
    
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('key');
    expect(result.current[0]).toBe('default');
  });
});

// Mocking timers for debounce/throttle tests
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );
    
    expect(result.current).toBe('initial');
    
    rerender({ value: 'updated' });
    
    // Value should not update immediately
    expect(result.current).toBe('initial');
    
    // Fast-forward past delay
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe('updated');
  });
  
  it('should reset timer on rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );
    
    rerender({ value: 'update 1' });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Update again before timer expires
    rerender({ value: 'update 2' });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Still should be initial (timer was reset)
    expect(result.current).toBe('initial');
    
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    expect(result.current).toBe('update 2');
  });
});
```

## Performance

### When to use useCallback

Use `useCallback` when:
1. Passing callbacks to optimized child components
2. The callback is a dependency of other hooks (useEffect)
3. The callback is expensive to create

```typescript
import { useCallback, memo } from 'react';

// ✅ Good: Child component is memoized
const ExpensiveList = memo(function ExpensiveList({
  items,
  onItemClick
}: {
  items: string[];
  onItemClick: (item: string) => void;
}) {
  return (
    <ul>
      {items.map(item => (
        <li key={item} onClick={() => onItemClick(item)}>
          {item}
        </li>
      ))}
    </ul>
  );
});

function ParentComponent() {
  const [items, setItems] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  
  // ✅ Good: Memoized callback prevents ExpensiveList re-render
  const handleItemClick = useCallback((item: string) => {
    console.log('Clicked:', item);
  }, []);
  
  // ❌ Unnecessary: No children to optimize
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };
  
  return (
    <>
      <input value={filter} onChange={handleFilterChange} />
      <ExpensiveList items={items} onItemClick={handleItemClick} />
    </>
  );
}
```

### When to use useMemo

Use `useMemo` when:
1. Computing expensive derived data
2. Creating objects/arrays passed to optimized children
3. Preventing unnecessary effect re-runs

```typescript
import { useMemo, useEffect } from 'react';

function DataTable({ rows, columns, sortKey }: DataTableProps) {
  // ✅ Good: Expensive computation
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      return String(a[sortKey]).localeCompare(String(b[sortKey]));
    });
  }, [rows, sortKey]);
  
  // ✅ Good: Object reference stability for useEffect
  const config = useMemo(() => ({
    pageSize: 50,
    sortKey,
    columns
  }), [sortKey, columns]);
  
  useEffect(() => {
    // This only runs when config actually changes
    updateTableConfig(config);
  }, [config]);
  
  // ❌ Unnecessary: Simple mapping
  const cellValues = rows.map(row => row.value);
  
  return <table>...</table>;
}
```

### Custom Hooks Composition

Compose small hooks into larger ones for reusability:

```typescript
import { useState, useEffect, useCallback, useMemo } from 'react';

// Base hook: simple counter
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initial), [initial]);
  
  return { count, increment, decrement, reset, setCount };
}

// Base hook: keyboard events
function useKeyDown(key: string, callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === key) callback();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback]);
}

// Composed hook: keyboard-controlled counter
function useKeyboardCounter(initial = 0) {
  const { count, increment, decrement, reset } = useCounter(initial);
  
  // Keyboard controls
  useKeyDown('ArrowUp', increment);
  useKeyDown('ArrowDown', decrement);
  useKeyDown('r', reset);
  
  return {
    count,
    controls: {
      increment,
      decrement,
      reset
    }
  };
}

// Composed hook: paginated data
interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
}

function usePagination<T>(
  items: T[],
  options: { pageSize?: number; initialPage?: number } = {}
) {
  const { pageSize = 10, initialPage = 1 } = options;
  const { count: page, increment, decrement, setCount: setPage } = useCounter(initialPage);
  
  const totalPages = useMemo(
    () => Math.ceil(items.length / pageSize),
    [items.length, pageSize]
  );
  
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);
  
  const nextPage = useCallback(() => {
    if (page < totalPages) increment();
  }, [page, totalPages, increment]);
  
  const prevPage = useCallback(() => {
    if (page > 1) decrement();
  }, [page, decrement]);
  
  const goToPage = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }, [totalPages, setPage]);
  
  return {
    items: paginatedItems,
    page,
    totalPages,
    pageSize,
    nextPage,
    prevPage,
    goToPage,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

// Composed hook: search with pagination
function useSearchablePagination<T>(
  items: T[],
  searchFields: (keyof T)[],
  options?: { pageSize?: number }
) {
  const [query, setQuery] = useState('');
  
  const filteredItems = useMemo(() => {
    if (!query) return items;
    const lowerQuery = query.toLowerCase();
    return items.filter(item =>
      searchFields.some(field =>
        String(item[field]).toLowerCase().includes(lowerQuery)
      )
    );
  }, [items, query, searchFields]);
  
  const pagination = usePagination(filteredItems, options);
  
  return {
    ...pagination,
    query,
    setQuery,
    totalFilteredItems: filteredItems.length
  };
}
```

### Preventing Unnecessary Re-renders

```typescript
import { useRef, useEffect, useMemo, memo } from 'react';

// Use refs for values that shouldn't trigger re-renders
function useEventCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T
) {
  const ref = useRef(callback);
  
  useEffect(() => {
    ref.current = callback;
  }, [callback]);
  
  return useMemo(
    () => ((...args: Parameters<T>) => ref.current(...args)) as T,
    []
  );
}

// Stable reference for callbacks
function useStableCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T
): T {
  const ref = useRef(callback);
  ref.current = callback;
  
  return useCallback(((...args) => ref.current(...args)) as T, []);
}

// Prevent prop-drilling with context + custom hook
import { createContext, useContext } from 'react';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Split context to prevent unnecessary re-renders
const ThemeStateContext = createContext<'light' | 'dark'>('light');
const ThemeActionsContext = createContext<{
  toggleTheme: () => void;
} | null>(null);

function useThemeState() {
  const theme = useContext(ThemeStateContext);
  if (theme === null) throw new Error('ThemeStateContext not found');
  return theme;
}

function useThemeActions() {
  const actions = useContext(ThemeActionsContext);
  if (actions === null) throw new Error('ThemeActionsContext not found');
  return actions;
}

// Components using only state won't re-render when actions change
const ThemeDisplay = memo(function ThemeDisplay() {
  const theme = useThemeState();
  return <span>Current theme: {theme}</span>;
});

// Components using only actions won't re-render when state changes
const ThemeToggle = memo(function ThemeToggle() {
  const { toggleTheme } = useThemeActions();
  return <button onClick={toggleTheme}>Toggle Theme</button>;
});
```

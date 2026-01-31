---
name: testing-vitest
description: Testing with Vitest + React Testing Library for Next.js 16 + React 19. Use when writing, reviewing, or refactoring tests for React components and hooks. Triggers on tasks involving unit tests, integration tests, component testing, hook testing, test configuration, or setting up Vitest in a Next.js project.
license: MIT
compatibility: Vitest >=1.0, React >=19, Next.js >=16
---

# Testing with Vitest + React Testing Library

> ⚠️ **IMPORTANT**: This skill requires Vitest and testing dependencies to be installed. They are not included in the default template.

Comprehensive testing guide for Next.js 16 + React 19 projects using Vitest and React Testing Library.

## Setup & Configuration

### Installing Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
# or
yarn add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
# or
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Vitest Configuration

Create `vitest.config.ts` at project root:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create `vitest.setup.ts` for test setup:

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Clean up after each test
afterEach(() => {
  cleanup()
})
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### TypeScript Types

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

## Testing React 19 Components

### Server Components

Server Components run async. Mock data fetching and verify rendered output:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { UserProfile } from './UserProfile'

// Mock the data fetching module
vi.mock('@/lib/api', () => ({
  getUser: vi.fn().mockResolvedValue({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  }),
}))

describe('UserProfile', () => {
  it('renders user data', async () => {
    const { container } = render(await UserProfile({ userId: '1' }))
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })
})
```

### Client Components

Test Client Components with user interactions:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Counter } from './Counter'

describe('Counter', () => {
  it('increments on button click', async () => {
    const user = userEvent.setup()
    render(<Counter initial={0} />)
    
    const button = screen.getByRole('button', { name: /increment/i })
    await user.click(button)
    
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
```

### React 19 `use()` Hook

Test components using the new `use()` hook:

```typescript
import { use } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Component using use()
function UserCard({ userPromise }: { userPromise: Promise<{ name: string }> }) {
  const user = use(userPromise)
  return <div>{user.name}</div>
}

describe('UserCard with use()', () => {
  it('renders resolved data', async () => {
    const userPromise = Promise.resolve({ name: 'Jane Doe' })
    
    render(<UserCard userPromise={userPromise} />)
    
    // Wait for promise to resolve
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument()
  })
})
```

### React 19 Actions

Test form actions and useFormStatus:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SubmitButton } from './SubmitButton'

describe('SubmitButton', () => {
  it('shows pending state during action', async () => {
    const user = userEvent.setup()
    const slowAction = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(
      <form action={slowAction}>
        <SubmitButton />
      </form>
    )
    
    const button = screen.getByRole('button', { name: /submit/i })
    await user.click(button)
    
    // Check pending state
    expect(screen.getByText(/submitting/i)).toBeInTheDocument()
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/submit/i)).toBeInTheDocument()
    })
  })
})
```

## Test Patterns

### Core Query Methods

Prefer queries in this order for accessibility:

```typescript
import { render, screen } from '@testing-library/react'

// 1. getByRole - most preferred
screen.getByRole('button', { name: /submit/i })
screen.getByRole('heading', { level: 1 })
screen.getByRole('textbox', { name: /email/i })

// 2. getByLabelText
screen.getByLabelText(/password/i)

// 3. getByPlaceholderText
screen.getByPlaceholderText(/search/i)

// 4. getByText
screen.getByText(/welcome/i)

// 5. getByTestId - use sparingly
screen.getByTestId('user-avatar')
```

### Async Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('AsyncComponent', () => {
  it('loads and displays data', async () => {
    render(<AsyncComponent />)
    
    // Initial loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    
    // Wait for element to appear (findBy* returns a Promise)
    const element = await screen.findByText(/loaded data/i)
    expect(element).toBeInTheDocument()
    
    // Or use waitFor for custom conditions
    await waitFor(() => {
      expect(screen.getByTestId('data-container')).toHaveTextContent('complete')
    }, { timeout: 3000 })
  })
})
```

### User Events vs FireEvent

Prefer `userEvent` for realistic interactions:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Form', () => {
  it('handles user input with userEvent', async () => {
    const user = userEvent.setup()
    render(<Form />)
    
    const input = screen.getByRole('textbox', { name: /username/i })
    
    // userEvent simulates realistic user behavior
    await user.type(input, 'john_doe')
    expect(input).toHaveValue('john_doe')
    
    // Clear and retype
    await user.clear(input)
    await user.type(input, 'jane_doe')
  })
  
  it('uses fireEvent for direct events', () => {
    render(<Form />)
    const input = screen.getByRole('textbox')
    
    // fireEvent for direct event triggering
    fireEvent.change(input, { target: { value: 'direct' } })
    fireEvent.click(screen.getByRole('button'))
  })
})
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('increments count', () => {
    const { result } = renderHook(() => useCounter(0))
    
    expect(result.current.count).toBe(0)
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
  
  it('accepts initial value', () => {
    const { result } = renderHook(() => useCounter(10))
    expect(result.current.count).toBe(10)
  })
})
```

## Mocks & Spies

### Function Mocks

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('Mocks', () => {
  it('creates spy functions', () => {
    const fn = vi.fn()
    fn('arg1', 'arg2')
    
    expect(fn).toHaveBeenCalled()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    expect(fn).toHaveReturnedWith(undefined)
  })
  
  it('mocks return values', () => {
    const fn = vi.fn()
      .mockReturnValue('default')
      .mockReturnValueOnce('first')
      .mockReturnValueOnce('second')
    
    expect(fn()).toBe('first')
    expect(fn()).toBe('second')
    expect(fn()).toBe('default')
  })
  
  it('mocks async functions', async () => {
    const fn = vi.fn().mockResolvedValue({ data: [] })
    
    const result = await fn()
    expect(result).toEqual({ data: [] })
  })
})
```

### Module Mocks

```typescript
import { describe, it, expect, vi } from 'vitest'
import { getUser } from '@/lib/api'

// Mock entire module
vi.mock('@/lib/api', () => ({
  getUser: vi.fn(),
  updateUser: vi.fn(),
}))

describe('API Module', () => {
  it('uses mocked functions', async () => {
    vi.mocked(getUser).mockResolvedValue({ id: '1', name: 'Test' })
    
    const user = await getUser('1')
    expect(user.name).toBe('Test')
  })
})
```

### Mocking Next.js Router

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRouter } from 'next/navigation'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn().mockReturnValue('/'),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}))

describe('Navigation', () => {
  const mockPush = vi.fn()
  const mockRefresh = vi.fn()
  
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: vi.fn(),
      forward: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as any)
  })
  
  it('navigates on button click', () => {
    render(<NavigationComponent />)
    // Test navigation behavior
  })
})
```

### Mocking fetch

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('API Calls', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })
  
  it('fetches data successfully', async () => {
    const mockData = { users: [{ id: 1, name: 'John' }] }
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response)
    
    const result = await fetchUsers()
    expect(result).toEqual(mockData.users)
  })
  
  it('handles fetch errors', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))
    
    await expect(fetchUsers()).rejects.toThrow('Network error')
  })
})
```

## Best Practices

### Arrange-Act-Assert Pattern

```typescript
describe('Component', () => {
  it('follows AAA pattern', async () => {
    // Arrange: Set up test data and conditions
    const user = userEvent.setup()
    const props = { initialCount: 5 }
    
    // Act: Execute the code being tested
    render(<Counter {...props} />)
    const button = screen.getByRole('button', { name: /increment/i })
    await user.click(button)
    
    // Assert: Verify expected outcomes
    expect(screen.getByText('6')).toBeInTheDocument()
  })
})
```

### Test Behavior, Not Implementation

```typescript
// ❌ Bad: Testing implementation details
describe('Bad', () => {
  it('calls setState with correct value', () => {
    const setState = vi.fn()
    render(<Counter setState={setState} />)
    // Don't test that setState was called
  })
})

// ✅ Good: Testing user-visible behavior
describe('Good', () => {
  it('displays updated count when button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    
    await user.click(screen.getByRole('button', { name: /increment/i }))
    
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
```

### Accessibility-First Queries

```typescript
describe('Accessibility', () => {
  it('uses semantic queries', () => {
    render(<Form />)
    
    // ✅ Preferred: Query by accessible role
    screen.getByRole('button', { name: /submit/i })
    screen.getByRole('textbox', { name: /email/i })
    screen.getByRole('heading', { level: 1 })
    
    // ✅ Good: Query by label
    screen.getByLabelText(/password/i)
    
    // ⚠️ Acceptable: Query by text content
    screen.getByText(/welcome message/i)
    
    // ❌ Avoid: Query by test ID when semantic options exist
    // screen.getByTestId('submit-button')
  })
})
```

### Cleanup and Isolation

```typescript
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, it } from 'vitest'

describe('Isolated Tests', () => {
  // Automatic cleanup configured in setup file
  // Manual cleanup if needed:
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })
  
  beforeEach(() => {
    // Reset any global state
    localStorage.clear()
  })
})
```

## Example Tests

### Component Test Example

```typescript
// components/TodoItem.tsx
'use client'

import { useState } from 'react'

interface TodoItemProps {
  id: string
  text: string
  completed: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ id, text, completed, onToggle, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  
  return (
    <li className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(id)}
        aria-label={`Mark "${text}" as ${completed ? 'incomplete' : 'complete'}`}
      />
      <span className={completed ? 'line-through' : ''}>{text}</span>
      <button
        onClick={() => onDelete(id)}
        aria-label={`Delete "${text}"`}
      >
        Delete
      </button>
    </li>
  )
}

// components/__tests__/TodoItem.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TodoItem } from '../TodoItem'

describe('TodoItem', () => {
  const defaultProps = {
    id: '1',
    text: 'Test todo',
    completed: false,
    onToggle: vi.fn(),
    onDelete: vi.fn(),
  }
  
  it('renders todo text', () => {
    render(<TodoItem {...defaultProps} />)
    
    expect(screen.getByText('Test todo')).toBeInTheDocument()
  })
  
  it('displays completed state', () => {
    render(<TodoItem {...defaultProps} completed />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
    
    const text = screen.getByText('Test todo')
    expect(text).toHaveClass('line-through')
  })
  
  it('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    
    render(<TodoItem {...defaultProps} onToggle={onToggle} />)
    
    await user.click(screen.getByRole('checkbox'))
    
    expect(onToggle).toHaveBeenCalledWith('1')
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
  
  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    
    render(<TodoItem {...defaultProps} onDelete={onDelete} />)
    
    await user.click(screen.getByRole('button', { name: /delete/i }))
    
    expect(onDelete).toHaveBeenCalledWith('1')
  })
  
  it('has accessible label for checkbox', () => {
    render(<TodoItem {...defaultProps} />)
    
    expect(screen.getByLabelText(/mark "test todo" as complete/i)).toBeInTheDocument()
  })
})
```

### Hook Test Example

```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])
  
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])
  
  return [storedValue, setValue, removeValue] as const
}

// hooks/__tests__/useLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  
  afterEach(() => {
    localStorage.clear()
  })
  
  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'default'))
    
    expect(result.current[0]).toBe('default')
  })
  
  it('reads existing value from localStorage', () => {
    localStorage.setItem('key', JSON.stringify('stored'))
    
    const { result } = renderHook(() => useLocalStorage('key', 'default'))
    
    expect(result.current[0]).toBe('stored')
  })
  
  it('updates value and localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'))
    
    act(() => {
      result.current[1]('updated')
    })
    
    expect(result.current[0]).toBe('updated')
    expect(localStorage.getItem('key')).toBe('"updated"')
  })
  
  it('accepts function updater', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0))
    
    act(() => {
      result.current[1]((prev) => prev + 1)
    })
    
    expect(result.current[0]).toBe(1)
  })
  
  it('removes value from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'))
    
    act(() => {
      result.current[1]('updated')
    })
    
    act(() => {
      result.current[2]()
    })
    
    expect(result.current[0]).toBe('initial')
    expect(localStorage.getItem('key')).toBeNull()
  })
})
```

### Async Server Component Test Example

```typescript
// app/users/page.tsx
import { getUsers } from '@/lib/api'

export default async function UsersPage() {
  const users = await getUsers()
  
  return (
    <main>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </main>
  )
}

// app/users/__tests__/page.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import UsersPage from '../page'

// Mock the API module
vi.mock('@/lib/api', () => ({
  getUsers: vi.fn(),
}))

const { getUsers } = await import('@/lib/api')

describe('UsersPage', () => {
  it('renders list of users', async () => {
    const mockUsers = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ]
    
    vi.mocked(getUsers).mockResolvedValue(mockUsers)
    
    const Page = await UsersPage()
    render(Page)
    
    expect(screen.getByRole('heading', { name: /users/i })).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })
  
  it('renders empty state when no users', async () => {
    vi.mocked(getUsers).mockResolvedValue([])
    
    const Page = await UsersPage()
    render(Page)
    
    expect(screen.getByRole('list')).toBeEmptyDOMElement()
  })
})
```

## Troubleshooting

### Common Issues

**Module resolution errors**: Ensure `resolve.alias` is configured in `vitest.config.ts` to match your `tsconfig.json` paths.

**CSS/Asset imports**: Mock static assets:

```typescript
// vitest.setup.ts
vi.mock('*.css', () => ({}))
vi.mock('*.svg', () => ({ default: 'svg-mock' }))
```

**Next.js Image component**: Mock next/image:

```typescript
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />
  },
}))
```

**Environment variables**: Set in test setup:

```typescript
// vitest.setup.ts
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
```

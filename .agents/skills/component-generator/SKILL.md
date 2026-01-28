---
name: component-generator
description: Generate React components with TypeScript, tests, and stories boilerplate
license: MIT
compatibility: React >=19, TypeScript >=5, Next.js >=16
---

# Component Generator

Generate production-ready React components with TypeScript, tests, and Storybook stories boilerplate.

## Component Types

### 1. Server Component (Default)

Use for static UI components that don't need client-side interactivity.

```tsx
// ServerComponent.tsx
interface ServerComponentProps {
  /** Component description */
  title: string;
  /** Optional description */
  description?: string;
}

export function ServerComponent({
  title,
  description,
}: ServerComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
```

### 2. Client Component ('use client')

Use for interactive components with state, effects, or event handlers.

```tsx
// ClientComponent.tsx
'use client';

import { useState } from 'react';

interface ClientComponentProps {
  /** Initial count value */
  initialCount?: number;
  /** Callback when count changes */
  onCountChange?: (count: number) => void;
}

export function ClientComponent({
  initialCount = 0,
  onCountChange,
}: ClientComponentProps) {
  const [count, setCount] = useState(initialCount);

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    onCountChange?.(newCount);
  };

  return (
    <button onClick={handleIncrement}>
      Count: {count}
    </button>
  );
}
```

### 3. Async Component (Data Fetching)

Use for server components that fetch data during render (Next.js App Router).

```tsx
// AsyncComponent.tsx
import { Suspense } from 'react';

interface AsyncComponentProps {
  /** User ID to fetch */
  userId: string;
}

async function UserData({ userId }: { userId: string }) {
  const user = await fetchUser(userId);
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

export function AsyncComponent({ userId }: AsyncComponentProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserData userId={userId} />
    </Suspense>
  );
}
```

### 4. Layout Component

Use for structural components that wrap content.

```tsx
// LayoutComponent.tsx
import { cn } from '@/lib/utils';

interface LayoutComponentProps {
  /** Main content */
  children: React.ReactNode;
  /** Sidebar content */
  sidebar?: React.ReactNode;
  /** Additional classes */
  className?: string;
}

export function LayoutComponent({
  children,
  sidebar,
  className,
}: LayoutComponentProps) {
  return (
    <div className={cn('flex min-h-screen', className)}>
      {sidebar && (
        <aside className="w-64 border-r">
          {sidebar}
        </aside>
      )}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
```

### 5. Page Component

Use for Next.js page components.

```tsx
// page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
};

interface PageProps {
  /** URL params */
  params: Promise<{ id: string }>;
  /** Search params */
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  
  return (
    <div>
      <h1>Page {id}</h1>
    </div>
  );
}
```

## Standard Structure

```
ComponentName/
├── index.ts                   # Re-exports
├── ComponentName.tsx          # Main component
├── ComponentName.test.tsx     # Tests
├── ComponentName.stories.tsx  # Storybook stories (optional)
└── types.ts                   # Shared types (optional)
```

### Index File Pattern

```ts
// index.ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

### Types File Pattern

```ts
// types.ts
/** Shared component variants */
export type ComponentVariant = 'default' | 'primary' | 'secondary';

/** Shared size options */
export type ComponentSize = 'sm' | 'md' | 'lg';
```

## Component Template

Full-featured component template with all best practices:

```tsx
// ComponentName.tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================
// Variants
// ============================================

const componentVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// ============================================
// Props Interface
// ============================================

export interface ComponentNameProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
}

// ============================================
// Component
// ============================================

const ComponentName = forwardRef<HTMLElement, ComponentNameProps>(
  (
    {
      className,
      variant,
      size,
      disabled = false,
      isLoading = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <HTMLElement
        ref={ref}
        className={cn(componentVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <span className="mr-2 animate-spin">⟳</span>}
        {children}
      </HTMLElement>
    );
  }
);

ComponentName.displayName = 'ComponentName';

export { ComponentName };
```

## Props Interface Pattern

### Extending HTML Attributes

```tsx
// Extend specific HTML element attributes
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Custom button prop */
  isLoading?: boolean;
}

// Extend generic HTML attributes
interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Custom box prop */
  spacing?: 'sm' | 'md' | 'lg';
}

// Extend with Omit to exclude conflicting props
interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Custom size that conflicts with HTML size */
  size?: 'sm' | 'md' | 'lg';
}
```

### Variant Props

```tsx
import { type VariantProps } from 'class-variance-authority';

const componentVariants = cva('base-classes', {
  variants: {
    variant: {
      default: '',
      primary: '',
      danger: '',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
});

// Extract variant types automatically
interface ComponentProps
  extends VariantProps<typeof componentVariants> {
  // Additional props
}
```

### Event Handlers

```tsx
interface ComponentProps {
  /** Click handler with typed event */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Change handler with typed event and value */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Form submit handler */
  onSubmit?: (data: FormData) => void;
  /** Generic event handler */
  onEvent?: (event: React.SyntheticEvent) => void;
}
```

### Children Handling

```tsx
interface ComponentProps {
  /** Single child element */
  children: React.ReactNode;
  /** Multiple children (array) */
  items: React.ReactNode[];
  /** Render prop pattern */
  renderItem: (item: Item) => React.ReactNode;
  /** Optional children */
  header?: React.ReactNode;
  /** Slot pattern */
  slots?: {
    header?: React.ReactNode;
    footer?: React.ReactNode;
  };
}
```

### Ref Forwarding

```tsx
import { forwardRef, type Ref } from 'react';

interface InputProps {
  label: string;
}

// Forward ref with proper typing
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => (
    <label>
      {label}
      <input ref={ref} {...props} />
    </label>
  )
);

Input.displayName = 'Input';

// Multiple refs pattern
interface MultiRefComponentProps {
  inputRef?: Ref<HTMLInputElement>;
  buttonRef?: Ref<HTMLButtonElement>;
}
```

## Test Template

```tsx
// ComponentName.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  // ============================================
  // Rendering
  // ============================================

  it('renders without crashing', () => {
    render(<ComponentName>Test</ComponentName>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(<ComponentName>Child Content</ComponentName>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  // ============================================
  // Props
  // ============================================

  it('applies custom className', () => {
    render(<ComponentName className="custom-class">Test</ComponentName>);
    expect(screen.getByText('Test')).toHaveClass('custom-class');
  });

  it('renders with variant styles', () => {
    const { rerender } = render(
      <ComponentName variant="primary">Test</ComponentName>
    );
    expect(screen.getByText('Test')).toHaveClass('primary-class');

    rerender(<ComponentName variant="secondary">Test</ComponentName>);
    expect(screen.getByText('Test')).toHaveClass('secondary-class');
  });

  // ============================================
  // Events
  // ============================================

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick}>Click Me</ComponentName>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<input onChange={handleChange} data-testid="input" />);
    
    fireEvent.change(screen.getByTestId('input'), {
      target: { value: 'new value' },
    });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  // ============================================
  // Accessibility
  // ============================================

  it('is accessible by role', () => {
    render(<ComponentName role="button">Accessible</ComponentName>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('supports aria attributes', () => {
    render(
      <ComponentName aria-label="Close dialog" aria-disabled="true">
        Close
      </ComponentName>
    );
    expect(screen.getByLabelText('Close dialog')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLElement | null };
    render(<ComponentName ref={ref}>Ref Test</ComponentName>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  // ============================================
  // State
  // ============================================

  it('renders loading state', () => {
    render(<ComponentName isLoading>Loading</ComponentName>);
    expect(screen.getByText('Loading')).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders disabled state', () => {
    render(<ComponentName disabled>Disabled</ComponentName>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  // ============================================
  // Snapshot (optional)
  // ============================================

  it('matches snapshot', () => {
    const { container } = render(<ComponentName>Snapshot</ComponentName>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

## Storybook Template

```tsx
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

// ============================================
// Meta Configuration
// ============================================

const meta = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A reusable component for [describe purpose].',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'outline', 'ghost'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Component size',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether to show loading state',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    onClick: {
      action: 'clicked',
      description: 'Click event handler',
    },
  },
  args: {
    variant: 'default',
    size: 'md',
    disabled: false,
    isLoading: false,
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Stories
// ============================================

/** Default component appearance */
export const Default: Story = {
  args: {
    children: 'ComponentName',
  },
};

/** Primary variant for main actions */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Action',
  },
};

/** Secondary variant for alternative actions */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Action',
  },
};

/** Outline variant for subtle emphasis */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Style',
  },
};

/** Ghost variant for minimal emphasis */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Style',
  },
};

// ============================================
// Size Variants
// ============================================

/** Small size */
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

/** Medium size (default) */
export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium',
  },
};

/** Large size */
export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

// ============================================
// States
// ============================================

/** Disabled state */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
};

/** Loading state */
export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Loading...',
  },
};

// ============================================
// Combinations
// ============================================

/** All variants displayed together */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex gap-4">
      <ComponentName {...args} variant="default">
        Default
      </ComponentName>
      <ComponentName {...args} variant="primary">
        Primary
      </ComponentName>
      <ComponentName {...args} variant="secondary">
        Secondary
      </ComponentName>
      <ComponentName {...args} variant="outline">
        Outline
      </ComponentName>
      <ComponentName {...args} variant="ghost">
        Ghost
      </ComponentName>
    </div>
  ),
};

/** All sizes displayed together */
export const AllSizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <ComponentName {...args} size="sm">
        Small
      </ComponentName>
      <ComponentName {...args} size="md">
        Medium
      </ComponentName>
      <ComponentName {...args} size="lg">
        Large
      </ComponentName>
    </div>
  ),
};
```

## Naming Conventions

### File Names

| Type | Pattern | Example |
|------|---------|---------|
| Component | PascalCase | `Button.tsx`, `UserCard.tsx` |
| Test | PascalCase.test.tsx | `Button.test.tsx` |
| Stories | PascalCase.stories.tsx | `Button.stories.tsx` |
| Utilities | camelCase | `formatDate.ts`, `cn.ts` |
| Constants | UPPER_SNAKE_CASE or camelCase | `API_URL.ts`, `constants.ts` |
| Hooks | use + PascalCase | `useAuth.ts`, `useDebounce.ts` |
| Types | PascalCase | `types.ts`, `Button.types.ts` |

### Component Names

- Use **PascalCase** for all component names
- Component name should match file name
- Use full words, avoid abbreviations
- Prefix with action for event handlers: `onClick`, `onSubmit`
- Suffix with type for variants: `ButtonVariant`, `InputSize`

```tsx
// ✅ Good
export function UserProfileCard() {}
export function PrimaryButton() {}

// ❌ Bad
export function userProfileCard() {}
export function UserProfile() // Too generic
```

### Props Naming

| Type | Pattern | Example |
|------|---------|---------|
| Boolean | is/has/should prefix | `isLoading`, `hasError`, `shouldShow` |
| Callbacks | on + Event | `onClick`, `onChange`, `onUserSelect` |
| Refs | element + Ref | `inputRef`, `containerRef` |
| Variants | noun describing style | `variant`, `size`, `colorScheme` |
| Option lists | plural noun | `options`, `items`, `variants` |

```tsx
interface Props {
  // ✅ Good
  isDisabled: boolean;
  hasIcon: boolean;
  onClick: () => void;
  onUserDelete: (id: string) => void;
  
  // ❌ Bad
  disabled: boolean; // Ambiguous - prop or attribute?
  clickHandler: () => void; // Not following convention
}
```

### Event Handler Naming

```tsx
// Standard events
onClick
onChange
onSubmit
onFocus
onBlur
onKeyDown
onMouseEnter
onMouseLeave

// Custom events - be descriptive
onUserSelect
onItemDelete
onFormValidate
onSearchQueryChange
onPageTransition

// Event handler implementation
const handleClick = () => {};
const handleUserSelect = (user: User) => {};
const handleSubmit = (event: FormEvent) => {};
```

## Examples

### 1. Simple UI Component (Button)

```tsx
// Button.tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-slate-900 text-white hover:bg-slate-800',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-slate-200 bg-white hover:bg-slate-100',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        ghost: 'hover:bg-slate-100',
        link: 'text-slate-900 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Loading state */
  isLoading?: boolean;
  /** Loading text to display */
  loadingText?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText ?? children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

### 2. Complex Component with Subcomponents (Card)

```tsx
// Card.tsx
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

// ============================================
// Card Root
// ============================================

const cardVariants = cva('rounded-lg border bg-white shadow-sm', {
  variants: {
    variant: {
      default: 'border-slate-200',
      outline: 'border-slate-300',
      ghost: 'border-transparent shadow-none',
    },
    padding: {
      none: '',
      default: 'p-6',
      sm: 'p-4',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'default',
  },
});

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

// ============================================
// Card Header
// ============================================

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional action element (e.g., button, dropdown) */
  action?: React.ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, action, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-start justify-between gap-4', className)}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {action && <div>{action}</div>}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

// ============================================
// Card Title
// ============================================

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-slate-900',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

// ============================================
// Card Description
// ============================================

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('mt-2 text-sm text-slate-600', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// ============================================
// Card Content
// ============================================

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mt-4', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// ============================================
// Card Footer
// ============================================

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Align items in footer */
  align?: 'start' | 'center' | 'end';
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, align = 'start', ...props }, ref) => {
    const alignClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'mt-6 flex items-center gap-2',
          alignClasses[align],
          className
        )}
        {...props}
      />
    );
  }
);
CardFooter.displayName = 'CardFooter';

// ============================================
// Exports
// ============================================

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardFooterProps,
};
```

### 3. Form Component with Validation

```tsx
// TextField.tsx
'use client';

import { forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface ValidationRule {
  /** Validation message */
  message: string;
  /** Validation function */
  validate: (value: string) => boolean;
}

interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message (controlled) */
  error?: string;
  /** Validation rules */
  validation?: ValidationRule[];
  /** Left icon or element */
  startAdornment?: React.ReactNode;
  /** Right icon or element */
  endAdornment?: React.ReactNode;
  /** Container class name */
  containerClassName?: string;
  /** Callback when validation fails */
  onValidationError?: (errors: string[]) => void;
}

// ============================================
// Styles
// ============================================

const inputVariants = cva(
  'flex w-full rounded-md border bg-transparent px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-slate-200 focus-visible:ring-slate-400',
        error: 'border-red-500 focus-visible:ring-red-400',
      },
      size: {
        default: 'h-10',
        sm: 'h-8 text-xs',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// ============================================
// Component
// ============================================

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      className,
      label,
      helperText,
      error: controlledError,
      validation,
      variant,
      size,
      startAdornment,
      endAdornment,
      containerClassName,
      onChange,
      onBlur,
      onValidationError,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const [internalError, setInternalError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);

    const inputId = id || `textfield-${Math.random().toString(36).slice(2)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // Use controlled error if provided, otherwise use internal
    const displayError = controlledError ?? internalError;
    const hasError = !!displayError;

    const validate = (value: string): string | null => {
      if (!validation) return null;

      const errors: string[] = [];
      for (const rule of validation) {
        if (!rule.validate(value)) {
          errors.push(rule.message);
        }
      }

      if (errors.length > 0) {
        onValidationError?.(errors);
        return errors[0];
      }

      return null;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);

      // Real-time validation if already touched
      if (touched && validation) {
        const error = validate(e.target.value);
        setInternalError(error);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      onBlur?.(e);

      // Validate on blur
      if (validation) {
        const error = validate(e.target.value);
        setInternalError(error);
      }
    };

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-900"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {startAdornment && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {startAdornment}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({
                variant: hasError ? 'error' : variant,
                size,
              }),
              startAdornment && 'pl-10',
              endAdornment && 'pr-10',
              className
            )}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            required={required}
            {...props}
          />

          {endAdornment && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {endAdornment}
            </div>
          )}
        </div>

        {hasError ? (
          <p id={errorId} className="text-xs text-red-500" role="alert">
            {displayError}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export { TextField };
export type { TextFieldProps, ValidationRule };
```

### Usage Example

```tsx
import { TextField } from './TextField';

function LoginForm() {
  return (
    <form>
      <TextField
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
        validation={[
          {
            message: 'Email is required',
            validate: (v) => v.length > 0,
          },
          {
            message: 'Please enter a valid email',
            validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
          },
        ]}
      />
      
      <TextField
        label="Password"
        type="password"
        required
        helperText="Must be at least 8 characters"
        validation={[
          {
            message: 'Password must be at least 8 characters',
            validate: (v) => v.length >= 8,
          },
        ]}
      />
    </form>
  );
}
```

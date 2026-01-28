---
name: forms-master
description: Modern form handling with React 19, Server Actions, and Zod validation. Use when building forms in React/Next.js applications, implementing Server Actions for form submission, adding form validation with Zod, handling file uploads in forms, creating multi-step forms, or managing form state with useActionState and useOptimistic.
license: MIT
compatibility: React >=19.0.0, Next.js >=16.0.0
---

# Forms Master

Modern form patterns for React 19 + Next.js 16 with Server Actions and Zod validation.

## Overview

React 19 transforms form handling with native Server Actions and the `useActionState` hook. This skill covers the complete modern stack from simple native forms to complex multi-step workflows.

**When to use React Hook Form (RHF):**
- Complex form with 10+ fields
- Heavy client-side interactivity (conditional fields, computed values)
- Real-time validation on every keystroke
- Complex field arrays with drag-and-drop

**When to use native React 19 patterns:**
- Standard CRUD forms
- Simple to moderate complexity (2-10 fields)
- Server-side validation is acceptable
- File uploads with Server Actions

## The Modern Stack

| Old Way | React 19 Way |
|---------|--------------|
| `useState` for form data | `formData` + Server Actions |
| `onChange` + `onSubmit` handlers | `action` prop on `<form>` |
| API routes (`/api/users`) | Server Actions (`'use server'`) |
| `useFormState` (deprecated) | `useActionState` (native) |
| Manual error handling | `useActionState` returns state |
| React Hook Form for everything | Native first, RHF for complex |

## Basic Server Action Form

### Server Action (`app/actions/user.ts`)

```typescript
'use server';

import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export type FormState = {
  errors?: {
    email?: string[];
    name?: string[];
  };
  message?: string;
  success?: boolean;
} | null;

export async function createUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = schema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  // Database operation here
  // await db.user.create({ data: validated.data });

  return { success: true, message: 'User created successfully' };
}
```

### Client Component (`app/components/user-form.tsx`)

```tsx
'use client';

import { useActionState } from 'react';
import { createUser, FormState } from '@/app/actions/user';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create User'}
    </button>
  );
}

export function UserForm() {
  const [state, action] = useActionState<FormState, FormData>(createUser, null);

  return (
    <form action={action}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-describedby={state?.errors?.email ? 'email-error' : undefined}
        />
        {state?.errors?.email && (
          <p id="email-error" role="alert">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          aria-describedby={state?.errors?.name ? 'name-error' : undefined}
        />
        {state?.errors?.name && (
          <p id="name-error" role="alert">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <SubmitButton />

      {state?.message && (
        <p role={state.success ? 'status' : 'alert'}>
          {state.message}
        </p>
      )}
    </form>
  );
}
```

## Zod Integration Patterns

### Reusable Validation Helper

```typescript
// lib/form-validation.ts
import { z } from 'zod';

export function validateForm<T extends z.ZodTypeAny>(
  schema: T,
  formData: FormData
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  const data = Object.fromEntries(formData.entries());
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// Flatten errors for UI display
export function flattenErrors(error: z.ZodError) {
  return error.flatten().fieldErrors;
}
```

### Type Inference from Schema

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
  role: z.enum(['admin', 'user']),
});

// Infer TypeScript type from schema
type UserInput = z.infer<typeof userSchema>;
// { email: string; age: number; role: 'admin' | 'user' }
```

### Coercion for Number/Date Fields

```typescript
const schema = z.object({
  // Coerce string input to number
  quantity: z.coerce.number().min(1).max(100),
  // Coerce to date
  birthDate: z.coerce.date().max(new Date(), 'Must be in the past'),
  // Boolean from checkbox
  acceptTerms: z.enum(['on', 'off']).transform(v => v === 'on'),
});
```

## Common Form Patterns

### Login Form

```tsx
// actions/auth.ts
'use server';

import { z } from 'zod';
import { signIn } from '@/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function login(prevState: unknown, formData: FormData) {
  const validated = loginSchema.safeParse(Object.fromEntries(formData));
  
  if (!validated.success) {
    return { error: 'Invalid input' };
  }

  try {
    await signIn('credentials', validated.data);
    return { success: true };
  } catch (error) {
    return { error: 'Invalid credentials' };
  }
}

// components/login-form.tsx
'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';

export function LoginForm() {
  const [state, action, isPending] = useActionState(login, null);

  return (
    <form action={action}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>
      {state?.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

### Registration with Confirm Password

```typescript
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

### File Upload with Server Actions

```tsx
// actions/upload.ts
'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadImage(prevState: unknown, formData: FormData) {
  const file = formData.get('image') as File;
  
  if (!file || file.size === 0) {
    return { error: 'Please select a file' };
  }
  
  if (file.size > MAX_SIZE) {
    return { error: 'File too large (max 5MB)' };
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Invalid file type' };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  const filename = `${Date.now()}-${file.name}`;
  const filepath = join(uploadDir, filename);
  
  await writeFile(filepath, buffer);
  
  return { success: true, url: `/uploads/${filename}` };
}

// components/upload-form.tsx
'use client';

import { useActionState } from 'react';
import { uploadImage } from '@/app/actions/upload';

export function UploadForm() {
  const [state, action, isPending] = useActionState(uploadImage, null);

  return (
    <form action={action}>
      <input 
        name="image" 
        type="file" 
        accept="image/jpeg,image/png,image/webp"
        required 
      />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Uploading...' : 'Upload'}
      </button>
      {state?.error && <p role="alert">{state.error}</p>}
      {state?.url && <p>Uploaded: {state.url}</p>}
    </form>
  );
}
```

### Cache Revalidation

After a successful Server Action, revalidate cached data:

```tsx
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateUser(formData: FormData) {
  // ... validation and update logic
  
  // Revalidate specific path
  revalidatePath('/users');
  
  // Or revalidate by tag (useful for on-demand)
  revalidateTag('user-data');
}
```

**When to use:**
- `revalidatePath`: When you know the exact page/route to refresh
- `revalidateTag`: When multiple routes share the same cached data

**With Tags:**
```tsx
// Fetch with tag
const data = await fetch('/api/data', {
  next: { tags: ['user-data'] }
});

// Later revalidate all routes using this tag
revalidateTag('user-data');
```

### Dynamic Field Arrays

```tsx
'use client';

import { useState } from 'react';
import { useActionState } from 'react';

export function TeamForm() {
  const [members, setMembers] = useState([{ id: 1, name: '', email: '' }]);
  const [state, action] = useActionState(createTeam, null);

  const addMember = () => {
    setMembers([...members, { id: Date.now(), name: '', email: '' }]);
  };

  const removeMember = (id: number) => {
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <form action={action}>
      <input name="teamName" placeholder="Team Name" required />
      
      {members.map((member, index) => (
        <div key={member.id}>
          <input
            name={`members[${index}].name`}
            placeholder="Member Name"
            required
          />
          <input
            name={`members[${index}].email`}
            type="email"
            placeholder="Email"
            required
          />
          {members.length > 1 && (
            <button type="button" onClick={() => removeMember(member.id)}>
              Remove
            </button>
          )}
        </div>
      ))}
      
      <button type="button" onClick={addMember}>
        Add Member
      </button>
      <button type="submit">Create Team</button>
    </form>
  );
}
```

## Pending States

### useFormStatus Hook

Track form submission status from child components:

```tsx
'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending, data, method, action } = useFormStatus();
  
  // Example: Show what email is being submitted
  const submittingEmail = data?.get('email') as string;
  
  return (
    <button type="submit" disabled={pending} aria-busy={pending}>
      {pending && submittingEmail ? (
        <>Signing in {submittingEmail}...</>
      ) : pending ? (
        <>
          <Spinner />
          <span>Submitting...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
```

**useFormStatus Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `pending` | `boolean` | True while form is submitting |
| `data` | `FormData \| null` | Form data being submitted |
| `method` | `string` | HTTP method ('get' or 'post') |
| `action` | `function` | Form action function reference |

### Form-Level Pending State

```tsx
'use client';

import { useActionState } from 'react';

export function MyForm() {
  const [state, action, isPending] = useActionState(submitAction, null);
  // isPending tracks submission state

  return (
    <form action={action}>
      <fieldset disabled={isPending}>
        <input name="field1" />
        <input name="field2" />
        <button type="submit">Submit</button>
      </fieldset>
    </form>
  );
}
```

## Optimistic UI

### Basic Optimistic Pattern

```tsx
'use client';

import { useOptimistic, useTransition } from 'react';
import { addTodo } from '@/app/actions/todo';

interface Todo {
  id: number;
  text: string;
  pending?: boolean;
}

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    initialTodos,
    (state, newTodo: Todo) => [...state, { ...newTodo, pending: true }]
  );
  const [, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const text = formData.get('text') as string;
    const tempId = Date.now();
    
    // Wrap in startTransition for React 19
    startTransition(() => {
      addOptimisticTodo({ id: tempId, text });
    });
    
    // Then perform actual submission
    await addTodo(formData);
  }

  return (
    <>
      <form action={handleSubmit}>
        <input name="text" required />
        <button type="submit">Add</button>
      </form>
      
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.text}
          </li>
        ))}
      </ul>
    </>
  );
}
```

### Optimistic with Rollback

```tsx
'use client';

import { useOptimistic, useActionState, startTransition } from 'react';

interface State {
  todos: Todo[];
  error?: string;
}

export function TodoApp({ initialTodos }: { initialTodos: Todo[] }) {
  const [state, submitAction, isPending] = useActionState(
    async (prevState: State, formData: FormData) => {
      try {
        const todo = await addTodo(formData);
        return { todos: [...prevState.todos, todo] };
      } catch (error) {
        return { 
          todos: prevState.todos, 
          error: 'Failed to add todo' 
        };
      }
    },
    { todos: initialTodos }
  );

  const [optimisticTodos, setOptimisticTodos] = useOptimistic(state.todos);

  async function handleSubmit(formData: FormData) {
    const text = formData.get('text') as string;
    
    startTransition(() => {
      setOptimisticTodo(prev => [...prev, { id: Date.now(), text, pending: true }]);
    });
    
    submitAction(formData);
  }

  return (
    <form action={handleSubmit}>
      <input name="text" />
      <button type="submit">Add</button>
      {state.error && <p role="alert">{state.error}</p>}
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.text}
          </li>
        ))}
      </ul>
    </form>
  );
}
```

## Multi-Step Forms

### Wizard Pattern with URL State

```tsx
// app/register/page.tsx
import { redirect } from 'next/navigation';

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { step?: string };
}) {
  const step = parseInt(searchParams.step || '1');
  
  return (
    <form action={handleStep}>
      {step === 1 && <Step1Email />}
      {step === 2 && <Step2Profile />}
      {step === 3 && <Step3Confirm />}
    </form>
  );
}

// actions/register.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function submitStep1(formData: FormData) {
  const email = formData.get('email');
  // Validate
  // Store in cookie or session
  (await cookies()).set('register_email', email as string);
  redirect('/register?step=2');
}

export async function submitRegistration(formData: FormData) {
  // Collect all data from cookies/session + formData
  // Final submission
  redirect('/register/success');
}
```

### Client-Side Wizard with State

```tsx
'use client';

import { useState } from 'react';

export function WizardForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const updateFormData = (newData: object) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleFinalSubmit = async () => {
    // Submit complete formData
  };

  return (
    <div>
      <progress value={step} max={3} />
      
      {step === 1 && (
        <Step1 
          data={formData} 
          onNext={(data) => { updateFormData(data); setStep(2); }}
        />
      )}
      {step === 2 && (
        <Step2 
          data={formData}
          onBack={() => setStep(1)}
          onNext={(data) => { updateFormData(data); setStep(3); }}
        />
      )}
      {step === 3 && (
        <Step3 
          data={formData}
          onBack={() => setStep(2)}
          onSubmit={handleFinalSubmit}
        />
      )}
    </div>
  );
}
```

## Accessibility

### Required Field Pattern

```tsx
<label htmlFor="email">
  Email <span aria-label="required">*</span>
</label>
<input 
  id="email"
  name="email" 
  type="email" 
  required 
  aria-required="true"
/>
```

### Error Announcements

```tsx
function ErrorMessage({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  
  return (
    <p id={id} role="alert" aria-live="polite" className="error">
      {message}
    </p>
  );
}

// Usage
<input 
  aria-describedby={error ? 'email-error' : undefined}
  aria-invalid={error ? 'true' : 'false'}
/>
<ErrorMessage id="email-error" message={error} />
```

### Focus Management

```tsx
'use client';

import { useRef, useEffect } from 'react';

export function AccessibleForm() {
  const errorRef = useRef<HTMLDivElement>(null);
  const [state, action] = useActionState(submitForm, null);

  useEffect(() => {
    if (state?.errors) {
      errorRef.current?.focus();
    }
  }, [state]);

  return (
    <form action={action}>
      {state?.errors && (
        <div 
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="form-errors-heading"
        >
          <h2 id="form-errors-heading">Please correct the following errors:</h2>
          <ul>
            {Object.entries(state.errors).map(([field, errors]) => (
              <li key={field}>
                <a href={`#${field}`}>{errors?.[0]}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* form fields */}
    </form>
  );
}
```

## Error Handling

### Structured Error Response

```typescript
// types/form.ts
export interface FormErrors {
  [key: string]: string[] | undefined;
}

export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  errors?: FormErrors;
  message?: string;
  field?: string; // For focusing specific field
}

// actions/user.ts
export async function updateUser(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const data = schema.parse(Object.fromEntries(formData));
    const user = await db.user.update({ data });
    return { success: true, data: user, message: 'User updated' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
        message: 'Validation failed',
      };
    }
    return {
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}
```

## React Hook Form (When Needed)

For complex forms requiring heavy client-side interactivity:

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useActionState } from 'react';

const schema = z.object({
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
  })),
  total: z.number(),
});

type FormData = z.infer<typeof schema>;

export function ComplexOrderForm() {
  const [state, action] = useActionState(submitOrder, null);
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { items: [{ name: '', quantity: 1 }] },
  });

  // Client-side interactivity
  const items = watch('items');
  const total = items.reduce((sum, item) => sum + item.quantity, 0);

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    action(formData);
  });

  return (
    <form action={onSubmit}>
      {/* Complex form with dynamic fields, computed values, etc */}
    </form>
  );
}
```

## Summary

1. **Use native React 19 patterns** for most forms (Server Actions + `useActionState`)
2. **Use Zod** for type-safe validation with schema inference
3. **Add `useFormStatus`** for pending states
4. **Use `useOptimistic`** for immediate UI feedback
5. **Implement proper ARIA attributes** for accessibility
6. **Reserve React Hook Form** for complex, highly interactive forms

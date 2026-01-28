---
name: subagent-tasker
description: Best practices for creating effective subagent tasks with complete context isolation
license: MIT
compatibility: Kimi Code CLI with Task tool support
---

# Subagent Tasker Skill

Guidelines for dispatching tasks to subagents effectively. Subagents run in **complete isolation** - they cannot see the main agent's context, files, or conversation history.

---

## Core Principle

> **Subagents are amnesic. If it's not in the prompt, it doesn't exist.**

Every piece of information the subagent needs must be explicitly provided in the task prompt.

---

## The 5 Rules of Subagent Prompts

### 1. Complete Code Context

❌ **Bad**: "Fix the bug in the Button component"

✅ **Good**: 
```
Fix the TypeScript error in this Button component:

File: /Users/project/src/components/Button.tsx

```tsx
import React from 'react';

export function Button({ variant, children }) {  // ERROR: variant type missing
  return <button className={variant}>{children}</button>;
}
```

Error message: "Parameter 'variant' implicitly has an 'any' type."

Expected: Add proper TypeScript interface with variant: 'primary' | 'secondary'
```

---

### 2. Explicit File Paths

Always provide **absolute paths** for files to read/write.

❌ **Bad**: "Update the utils file"

✅ **Good**: "Update `/Users/project/src/lib/utils.ts`"

---

### 3. Clear Success Criteria

Define what "done" looks like.

❌ **Bad**: "Make this better"

✅ **Good**: 
```
Refactor this function to:
1. Use async/await instead of .then()
2. Add error handling with try/catch
3. Return a typed result: { success: boolean; data?: User; error?: string }
4. Keep the same function signature for backward compatibility
```

---

### 4. No Tool Recursion

**CRITICAL**: Subagents must NOT use the `Task` tool. This prevents infinite loops.

Subagents should use:
- ✅ `ReadFile`, `WriteFile`, `StrReplaceFile` - File operations
- ✅ `Shell` - Command execution
- ✅ `Grep`, `Glob` - File search
- ❌ `Task` - Creating more subagents

---

### 5. Structured Response Format

Ask subagents to return results in a consistent format:

```
Please return your response in this format:

## Summary
Brief description of what was done

## Files Modified
- `/absolute/path/to/file1` - What changed
- `/absolute/path/to/file2` - What changed

## Code Changes
```language
// Complete code for modified sections
```

## Notes
Any important considerations or follow-up actions
```

---

## Prompt Templates

### Template A: Code Refactoring

```yaml
Description: "Refactor auth hook"
Subagent: "coder"
Prompt: |
  ## Task
  Refactor the authentication hook to use React 19's new use() hook.

  ## Current Code
  File: /Users/project/src/hooks/useAuth.ts
  ```typescript
  [paste complete file content]
  ```

  ## Requirements
  1. Replace useEffect + useState pattern with use()
  2. Keep the same public API (return values)
  3. Add JSDoc comments
  4. Ensure TypeScript strict mode compatibility

  ## Output Format
  Return the complete refactored file content with explanations.
```

---

### Template B: Bug Fix

```yaml
Description: "Fix API route error"
Subagent: "debugger"
Prompt: |
  ## Problem
  API route returns 500 error on POST request.

  ## Error Log
  ```
  TypeError: Cannot read properties of undefined (reading 'email')
    at POST (./app/api/users/route.ts:15:20)
  ```

  ## Code
  File: /Users/project/app/api/users/route.ts
  ```typescript
  [paste complete file]
  ```

  ## Related Files
  - Schema: /Users/project/src/lib/schema.ts
  ```typescript
  [paste relevant schema]
  ```

  ## Expected Behavior
  Should validate the request body and create a user with email.

  ## Your Task
  1. Identify the root cause
  2. Fix the error
  3. Add proper error handling
  4. Test the fix with a sample request
```

---

### Template C: Code Review

```yaml
Description: "Review PR changes"
Subagent: "reviewer"
Prompt: |
  ## Context
  This is a Next.js 16 + Tailwind 4 project.

  ## Files to Review
  
  ### File 1: /Users/project/src/components/Card.tsx
  ```tsx
  [paste complete file]
  ```

  ### File 2: /Users/project/src/components/CardList.tsx
  ```tsx
  [paste complete file]
  ```

  ## Review Checklist
  Review these files against our standards:
  1. TypeScript strict compliance
  2. Proper Server/Client Component usage
  3. Tailwind CSS class organization
  4. Accessibility (ARIA labels, keyboard nav)
  5. Performance (unnecessary re-renders, bundle size)

  ## Output Format
  Provide a structured review with:
  - 🟢 Good practices found
  - 🟡 Suggestions for improvement
  - 🔴 Issues that must be fixed (with code examples)
```

---

### Template D: Multi-File Creation

```yaml
Description: "Create feature module"
Subagent: "architect"
Prompt: |
  ## Feature Request
  Create a complete user profile feature.

  ## Requirements
  1. Profile page at `/profile`
  2. Edit profile form with validation
  3. Avatar upload component
  4. API route for profile updates

  ## Project Context
  - Stack: Next.js 16 + Tailwind 4 + React 19 + TypeScript
  - Path aliases: `@/` maps to `/Users/project/src/`
  - UI components available in `@/components/ui/`
  - Use Server Actions for mutations

  ## Files to Create

  ### 1. /Users/project/src/app/profile/page.tsx
  Server component that fetches user data and displays profile.

  ### 2. /Users/project/src/app/profile/edit/page.tsx
  Client component with form for editing profile.

  ### 3. /Users/project/src/components/AvatarUpload.tsx
  Client component for image upload with preview.

  ### 4. /Users/project/src/app/actions/profile.ts
  Server actions for updateProfile and uploadAvatar.

  ## Response Format
  For each file, provide:
  1. Complete file content
  2. Brief explanation of key decisions
```

---

## Common Patterns

### Parallel Task Dispatch

When you have multiple independent tasks, dispatch them in parallel:

```typescript
// Good: Three independent tasks run concurrently
Task 1: Refactor Button component
Task 2: Refactor Input component
Task 3: Refactor Select component
```

### Sequential Dependencies

When tasks depend on each other, wait for results:

```typescript
// Step 1: Analyze
Task: "Analyze the current API structure"
→ Returns analysis

// Step 2: Refactor based on analysis
Task: "Refactor based on this analysis: [result from step 1]"
→ Returns refactored code

// Step 3: Write tests
Task: "Write tests for this refactored code: [result from step 2]"
```

---

## Decomposing Complex Tasks

When a task is **too important or too complex** for a single subagent, decompose it into multiple smaller subagents. This improves quality, enables validation at each step, and makes debugging easier.

### When to Decompose?

| Task Complexity | Approach | Example |
|---------------|----------|---------|
| Simple (< 30 min) | Single subagent | "Fix TypeScript error in Button" |
| Medium (30-60 min) | Single subagent with checklist | "Create login form with validation" |
| **Complex (> 1h)** | **Multiple subagents** | "Build full authentication system" |
| **Critical** | **Multiple subagents + review** | "Refactor payment processing" |

### The Pipeline Pattern

Break complex work into a pipeline of specialized subagents:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Analyst   │───→│   Architect │───→│    Coder    │───→│   Reviewer  │
│  (Research) │    │  (Design)   │    │ (Implement) │    │  (Validate) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Example: Building an E-Commerce Cart

**❌ Bad: Single massive task**
```yaml
Description: "Build cart feature"  # Too vague, too big
Subagent: "coder"
Prompt: "Create a shopping cart with add/remove items, quantity management, 
persist to localStorage, sync with server, handle errors, optimize performance..."
# Result: Likely incomplete or buggy
```

**✅ Good: Decomposed pipeline**

```yaml
# Step 1: Analysis & Planning
Description: "Analyze cart requirements"
Subagent: "analyst"
Prompt: |
  Analyze the requirements for a shopping cart feature:
  - List all data structures needed (Cart, CartItem, etc.)
  - Identify state management approach (React Context? Zustand?)
  - List all user interactions (add, remove, update quantity)
  - Identify edge cases (out of stock, network errors)
  - Suggest file structure
  
  Return a detailed analysis document.
```

```yaml
# Step 2: Design Data Layer (depends on Step 1)
Description: "Design cart data layer"
Subagent: "architect"
Prompt: |
  Based on this analysis: [paste result from Step 1]
  
  Create the TypeScript types and state management:
  1. Define interfaces (Cart, CartItem, CartState)
  2. Create cart store/context with methods:
     - addItem(product)
     - removeItem(itemId)
     - updateQuantity(itemId, quantity)
     - clearCart()
     - getTotalPrice()
     - getItemCount()
  3. Handle persistence (localStorage)
  4. Handle server sync
  
  Files to create:
  - /project/src/lib/cart/types.ts
  - /project/src/lib/cart/store.ts
  - /project/src/lib/cart/utils.ts
```

```yaml
# Step 3: Build UI Components (depends on Step 2)
Description: "Create cart UI components"
Subagent: "coder"
Prompt: |
  Using this data layer: [paste result from Step 2]
  
  Create these components:
  1. CartIcon - Shows item count badge
  2. CartDrawer - Slide-out cart panel
  3. CartItem - Individual line item with quantity controls
  4. CartSummary - Totals and checkout button
  
  Requirements:
  - Use the cart store from step 2
  - Responsive design
  - Loading states
  - Empty state
  - Error handling
  
  Files: [list all file paths]
```

```yaml
# Step 4: Testing (depends on Step 3)
Description: "Write cart tests"
Subagent: "tester"
Prompt: |
  For this cart implementation: [paste result from Step 2 + Step 3]
  
  Write comprehensive tests:
  1. Unit tests for store methods
  2. Component tests for UI interactions
  3. Edge case tests (empty cart, max quantity, etc.)
  4. Integration test for full checkout flow
  
  Use Vitest + React Testing Library.
```

```yaml
# Step 5: Final Review (depends on all previous)
Description: "Review cart implementation"
Subagent: "reviewer"
Prompt: |
  Review this complete cart implementation:
  
  Data Layer: [Step 2 result]
  UI Components: [Step 3 result]
  Tests: [Step 4 result]
  
  Check for:
  - Type safety
  - Accessibility
  - Performance issues
  - Security concerns
  - Best practices compliance
  
  Flag any issues that must be fixed before deployment.
```

### Benefits of Decomposition

| Benefit | Explanation |
|---------|-------------|
| **Quality** | Each step is focused and manageable |
| **Validation** | Catch errors early before they compound |
| **Flexibility** | Can retry individual steps without redoing everything |
| **Parallelization** | Independent steps can run concurrently |
| **Debuggability** | Clear attribution of which step failed |
| **Reviewability** | Easier to review smaller, focused changes |

### Template: Task Decomposition Decision

Use this checklist to decide if a task needs decomposition:

```
Does this task need to be split into multiple subagents?

□ Will it take more than 1 hour to complete?
□ Does it involve more than 5 files?
□ Are there multiple distinct phases (design → implement → test)?
□ Is this critical code (payments, auth, security)?
□ Could errors in early steps invalidate later work?
□ Would intermediate validation be valuable?

If you checked 2+ boxes → DECOMPOSE into multiple subagents
If you checked 0-1 boxes → Single subagent with detailed checklist is fine
```

---

## Anti-Patterns to Avoid

### ❌ The "Figure It Out" Prompt

```
Bad: "There's a bug somewhere in the codebase, find and fix it"

Why: Subagent has no context about what the bug is, where to look,
or what "fixed" means. Will waste time searching blindly.
```

### ❌ The Reference-Heavy Prompt

```
Bad: "Update the component like we discussed earlier"

Why: Subagent has NO memory of "earlier". Must provide all context
in the prompt.
```

### ❌ The Vague Requirement

```
Bad: "Make the UI look better"

Why: No objective criteria for success. What does "better" mean?
Specify: colors, spacing, layout, animations, etc.
```

### ❌ The Recursive Trap

```
Bad: Subagent prompt includes "Use the Task tool to..."

Why: This creates infinite recursion. Subagents must not use Task.
```

---

## Subagent Types & Specializations

Define specialized subagents for different task types:

| Subagent | Purpose | Typical Tools |
|----------|---------|---------------|
| **coder** | Code writing/refactoring | ReadFile, WriteFile, StrReplaceFile, Shell |
| **debugger** | Bug investigation | ReadFile, Grep, Shell, Grep |
| **reviewer** | Code review | ReadFile |
| **tester** | Test writing | ReadFile, WriteFile, Shell |
| **architect** | Design patterns | ReadFile, WriteFile |

### Defining Subagents in Agent File

```yaml
# In your agent.yaml
subagents:
  coder:
    path: ./subagents/coder.yaml
    description: "Write and refactor code"
  
  debugger:
    path: ./subagents/debugger.yaml
    description: "Investigate and fix bugs"
  
  reviewer:
    path: ./subagents/reviewer.yaml
    description: "Review code quality"
```

### Subagent Definition Example

```yaml
# subagents/coder.yaml
version: 1
agent:
  extend: default
  system_prompt_path: ./coder-prompt.md
  exclude_tools:
    - "kimi_cli.tools.multiagent:Task"  # Prevent recursion
    - "kimi_cli.tools.web:SearchWeb"    # Focus on local code
```

---

## Quality Checklist

Before dispatching a task, verify:

- [ ] All necessary code/files are pasted in the prompt
- [ ] Absolute file paths are provided for all targets
- [ ] Success criteria are clearly defined
- [ ] Response format is specified
- [ ] Subagent won't need to use Task tool
- [ ] Context is sufficient for a human developer to complete the task

---

## Quick Reference: Prompt Structure

```
1. TASK DESCRIPTION
   What needs to be done

2. CONTEXT
   All code, errors, and relevant files

3. REQUIREMENTS
   Specific expectations and constraints

4. OUTPUT FORMAT
   How to structure the response

5. (Optional) EXAMPLES
   Input/output examples for clarity
```

Remember: **When in doubt, include more context.** Subagents have no memory and cannot ask for clarification - they can only work with what's in the prompt.

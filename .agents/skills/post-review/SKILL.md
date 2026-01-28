---
name: post-review
description: Systematic code review after feature implementation to ensure quality, security, accessibility, and adherence to project patterns
license: MIT
compatibility: Next.js 16, React 19, Tailwind CSS 4, TypeScript projects
---

# Post-Implementation Review Skill

**Review before you finish. Quality is everyone's responsibility.**

This skill provides a systematic post-implementation review process to ensure code quality, catch issues early, and maintain consistency across the codebase.

---

## When to Use This Skill

### Trigger Conditions

| Situation | Action |
|-----------|--------|
| Feature implementation complete | **MANDATORY REVIEW** |
| Bug fix merged | **MANDATORY REVIEW** |
| Refactoring finished | **MANDATORY REVIEW** |
| Adding new dependency | Quick security check |
| Modifying core utilities | **MANDATORY REVIEW** |

### Integration with Plan-Master Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  PLAN PHASE          EXECUTE PHASE           REVIEW PHASE   │
├─────────────────────────────────────────────────────────────┤
│  /skill:plan-master  →  Implementation   →  /skill:post-review│
│                                                            │
│  1. P.L.A.N. framework    Subagents/       1. R.E.V.I.E.W. │
│  2. Validate with user    Direct coding      2. Fix issues │
│  3. Convert to tasks                          3. Validate  │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

**Rule**: Never mark a feature as "done" without completing the review phase.

---

## The Review Framework: R.E.V.I.E.W.

```
R - Requirements      (Does it meet requirements?)
E - Errors            (Any runtime errors, TypeScript issues?)
V - Validation        (Are validations correct?)
I - Implementation    (Code quality, patterns, architecture)
E - Edge Cases        (Are edge cases handled?)
W - Web Standards     (a11y, i18n, SEO, security)
```

---

## Phase 1: REQUIREMENTS - Verify Feature Completeness

### Checklist

```markdown
□ All acceptance criteria from plan are met
□ Feature works as described in requirements
□ No scope creep (or documented if any)
□ User flows match the planned UX
□ Data models match the planned schema
```

### Questions to Ask

1. **Does this implement ALL requirements from the plan?**
   - Check each acceptance criterion
   - Verify against the original requirements doc

2. **Are there any undocumented changes?**
   - If yes, were they necessary or scope creep?
   - Document rationale for any deviations

3. **Does the UI match the expected behavior?**
   - For UI features: test visually
   - For APIs: test endpoints manually

---

## Phase 2: ERRORS - Check for Runtime & Build Issues

### TypeScript & Build Checks

```bash
# Run these commands
pnpm type-check        # Or: tsc --noEmit
pnpm build            # Production build
pnpm lint             # ESLint checks
```

### Checklist

```markdown
□ No TypeScript errors (strict mode)
□ No ESLint errors
□ Production build succeeds
□ No console errors in dev mode
□ No hydration mismatches (Next.js)
```

### Common Issues to Catch

| Issue | Severity | How to Fix |
|-------|----------|------------|
| `any` types | HIGH | Replace with proper types or `unknown` |
| Missing return types | MEDIUM | Add explicit return types for functions |
| Unused imports | LOW | Remove with auto-fix |
| `console.log` in code | MEDIUM | Remove or use proper logging |
| Hydration mismatch | HIGH | Check server/client rendering differences |

---

## Phase 3: VALIDATION - Input & Data Validation

### Checklist

```markdown
□ All user inputs validated (forms, query params, body)
□ Zod schemas used where appropriate
□ Error messages are user-friendly
□ Validation happens on server (security)
□ Validation happens on client (UX)
□ Edge cases handled (empty strings, null, undefined)
```

### Server Action Validation Pattern

```typescript
// ✅ GOOD: Server-side validation with Zod
const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
});

export async function createUser(formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = schema.safeParse(data);
  
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  
  // Proceed with valid data
}
```

---

## Phase 4: IMPLEMENTATION - Code Quality Review

### Architecture & Patterns

```markdown
□ Follows existing project patterns
□ No duplicate code (DRY principle)
□ Single Responsibility Principle respected
□ Proper separation of concerns
□ Component composition used effectively
```

### File Structure Review

```markdown
□ Files in correct directories
□ Naming conventions followed
□ Barrel exports for public APIs
□ Internal utilities marked as such
```

### State Management

```markdown
□ Minimal state (derive when possible)
□ Proper use of Server vs Client state
□ TanStack Query patterns followed (if used)
□ Zustand store organized (if used)
□ No prop drilling
```

### Performance

```markdown
□ No unnecessary re-renders
□ useMemo/useCallback used appropriately (not overused)
□ Images optimized (next/image)
□ Dynamic imports for large components
□ Query caching configured properly
```

### Code Style Checklist

```markdown
□ Consistent with existing code style
□ Meaningful variable/function names
□ Functions are small and focused
□ Comments explain WHY not WHAT
□ No magic numbers/strings (use constants)
```

---

## Phase 5: EDGE CASES - Handle the Unexpected

### Checklist

```markdown
□ Empty states handled (no data, empty list)
□ Loading states implemented
□ Error states handled gracefully
□ Network failures handled
□ Race conditions considered
□ Boundary conditions tested (0, 1, many, max)
□ Invalid/malformed data handled
□ Permission/access denied handled
```

### Error Boundary Pattern

```tsx
// ✅ GOOD: Error boundary for graceful failures
<ErrorBoundary fallback={<ErrorFallback />}>
  <FeatureComponent />
</ErrorBoundary>
```

---

## Phase 6: WEB STANDARDS - a11y, i18n, SEO, Security

### Accessibility (a11y)

```markdown
□ Semantic HTML used (nav, main, section, article)
□ Headings hierarchy correct (h1 → h2 → h3)
□ Alt text for images
□ ARIA labels where needed
□ Keyboard navigation works
□ Focus indicators visible
□ Color contrast sufficient
□ Screen reader tested (if possible)
```

### Common a11y Issues

| Issue | Fix |
|-------|-----|
| `<div onClick={...}>` | Use `<button>` instead |
| Missing form labels | Add `label htmlFor` or `aria-label` |
| Images without alt | Add descriptive alt text |
| Focus trap issues | Use proper focus management |

### Internationalization (i18n)

```markdown
□ No hardcoded strings in UI
□ French language used (per project convention)
□ Date/number formatting locale-aware
□ RTL considerations (if applicable)
```

### SEO

```markdown
□ Meta tags present (title, description)
□ Open Graph tags for social sharing
□ Canonical URLs
□ Semantic HTML structure
□ Page load performance acceptable
```

### Security

```markdown
□ No secrets in client-side code
□ Server Actions validate inputs
□ SQL injection prevented (parameterized queries)
□ XSS prevention (escape output, sanitize HTML)
□ CSRF protection enabled
□ Proper CORS configuration
□ Rate limiting considered
```

### Security Red Flags

```typescript
// ❌ DANGEROUS: Never do this
// Direct SQL concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ❌ DANGEROUS: XSS vulnerability
dangerouslySetInnerHTML={{ __html: userContent }}

// ❌ DANGEROUS: Exposing secrets
const API_KEY = process.env.API_KEY; // In client component!

// ✅ GOOD: Parameterized query
const query = 'SELECT * FROM users WHERE id = ?';
await db.query(query, [userId]);

// ✅ GOOD: DOMPurify for HTML
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userContent);
```

---

## Review Output Template

```markdown
# Post-Implementation Review: [Feature Name]

## Summary
- **Date**: YYYY-MM-DD
- **Reviewer**: [Name/AI Instance]
- **Feature**: [Brief description]

## Checklist Results

### ✅ Requirements
- [x] All acceptance criteria met
- [x] Feature works as described
- [ ] [If any issues, list them]

### ✅ Errors
- [x] TypeScript strict mode passes
- [x] Build succeeds
- [x] No console errors
- [ ] [Issues found]

### ✅ Validation
- [x] Input validation implemented
- [x] Error messages user-friendly
- [ ] [Issues found]

### ✅ Implementation
- [x] Follows project patterns
- [x] No code duplication
- [x] Performance acceptable
- [ ] [Issues found]

### ✅ Edge Cases
- [x] Empty states handled
- [x] Loading states implemented
- [x] Error states handled
- [ ] [Issues found]

### ✅ Web Standards
- [x] a11y checked
- [x] i18n considered
- [x] Security reviewed
- [ ] [Issues found]

## Issues Found

### 🔴 Critical (Must Fix)
1. [Issue description] - [How to fix]

### 🟠 Medium (Should Fix)
1. [Issue description] - [How to fix]

### 🟡 Low (Nice to Fix)
1. [Issue description] - [How to fix]

## Action Items

- [ ] Fix critical issues
- [ ] Re-run review checklist
- [ ] Get approval to merge/complete
```

---

## Quick Review Checklist (For Small Changes)

For small changes (< 5 files, < 100 lines), use this abbreviated checklist:

```markdown
## Quick Review

□ TypeScript compiles without errors
□ No console logs left in code
□ Follows existing patterns
□ No obvious security issues
□ Basic a11y considered
□ Tested manually (works as expected)
```

---

## Review Severity Levels

| Level | Definition | Action Required |
|-------|------------|-----------------|
| 🔴 **Critical** | Security risk, crashes, data loss | MUST fix before merge |
| 🟠 **Medium** | Poor UX, performance issues, maintainability | SHOULD fix before merge |
| 🟡 **Low** | Code style, minor improvements | CAN fix later |
| 🟢 **Info** | Suggestions, observations | Optional |

---

## Integration with Subagent Workflow

When using subagent-tasker for implementation:

```
1. Subagent completes task
2. Subagent runs self-review (this checklist)
3. Subagent reports: "Task complete, self-review passed"
4. You (or another subagent) verify with this skill
5. Mark feature as complete only after review passes
```

### Subagent Review Prompt

```markdown
Before marking this task as complete, run the post-review checklist:

Quick Review:
□ TypeScript compiles without errors
□ No console logs in code
□ Follows existing patterns (check similar files)
□ No security issues (input validation, no secrets exposed)
□ Basic a11y (buttons not divs, labels for inputs)
□ Tested: [describe what you tested]

Report any issues found and how you fixed them.
```

---

## Summary

**The Review Golden Rule**:
> Code is not done when it works. Code is done when it's maintainable, secure, accessible, and follows project standards.

**Time Investment**:
- Small change (< 100 lines): 5-10 min review
- Medium feature: 15-30 min review
- Large feature: 30-60 min review

**Return on Investment**:
Every 10 minutes spent reviewing saves 1 hour of debugging in production.

---

## Quick Reference: Review Command

Use this command structure to invoke the review:

```
/skill:post-review

Review the following implementation:
- Feature: [name]
- Files changed: [list]
- Plan reference: [link to plan]
- Requirements: [acceptance criteria]

Run the R.E.V.I.E.W. framework and report findings.
```

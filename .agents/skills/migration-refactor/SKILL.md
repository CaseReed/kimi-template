---
name: migration-refactor
description: Systematic approach to code refactoring and migration projects. Use when refactoring code, migrating between frameworks/languages, restructuring codebases, modernizing legacy code, or performing any large-scale code transformation that requires careful planning and execution.
license: MIT
compatibility: Any codebase
---

# Migration & Refactoring Skill

Systematic workflow for safe, predictable code refactoring and migration projects.

## Quick Decision Tree

```
Need to refactor/migrate code?
│
├─> High risk? (production-critical, many dependents)
│   └─> Use INCREMENTAL approach with feature flags
│
├─> Low risk? (isolated utility, internal tool)
│   └─> ATOMIC migration may be acceptable
│
└─> Uncertain risk?
    └─> Start with ANALYSIS phase, then decide
```

---

## 1. Pre-Refactor Analysis

### 1.1 Code Discovery Checklist

- [ ] **Read target files** - Understand current implementation
- [ ] **Find all imports/exports** - Who depends on this code?
- [ ] **Check test coverage** - Are there tests? Do they pass?
- [ ] **Identify side effects** - External integrations, state management, I/O
- [ ] **Document public API** - What functions/classes are consumed externally?
- [ ] **Map type dependencies** - TypeScript types, interfaces, generics

### 1.2 Dependency Mapping Commands

```bash
# Find all files importing a module
grep -r "from ['\"].*\/targetModule['\"]" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .

# Find all exports from a file
grep -E "^export (const|let|var|function|class|interface|type|default)" targetFile.ts

# Check for dynamic imports
grep -r "import(.*targetModule)" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .
```

### 1.3 Risk Assessment Matrix

| Factor | Low Risk | Medium Risk | High Risk |
|--------|----------|-------------|-----------|
| **Usage** | 1-2 files | 3-10 files | 10+ files |
| **Tests** | >80% coverage | 50-80% coverage | <50% coverage |
| **Complexity** | Pure functions | Some side effects | Heavy state/IO |
| **Criticality** | Internal utility | Feature component | Core infrastructure |
| **Team Size** | Solo project | Small team (<5) | Large team (10+) |

**Decision:**
- 0-2 High Risk factors → Atomic migration acceptable
- 3+ High Risk factors → Must use incremental approach

---

## 2. Planning Phase

### 2.1 Scope Definition Template

```markdown
## Migration Plan: [Component/Feature Name]

### Scope
- **In Scope:** [Specific files, functions, or patterns to change]
- **Out of Scope:** [Explicitly excluded items]
- **Boundary:** [Where changes start and end]

### Success Criteria
- [ ] All existing tests pass
- [ ] Type checking passes (`tsc --noEmit` or equivalent)
- [ ] Build succeeds without warnings
- [ ] Feature parity verified (manual QA for key flows)
- [ ] Performance metrics maintained or improved

### Rollback Plan
- **Checkpoint commit:** [SHA or branch name]
- **Database migrations:** [Can they be reversed?]
- **Feature flags:** [How to disable new code quickly]
- **Estimated rollback time:** [Minutes/hours]

### Timeline
- **Analysis:** [Duration]
- **Implementation:** [Duration]
- **Testing:** [Duration]
- **Review & Deploy:** [Duration]
- **Total:** [Duration]
```

### 2.2 Approach Selection

| Approach | When to Use | Commit Strategy |
|----------|-------------|-----------------|
| **Atomic** | Small changes (<20 files), low risk | Single commit with detailed message |
| **Incremental** | Large changes, high risk, active development | Chain of small, reviewable commits |
| **Strangler Fig** | Replacing entire subsystems | Gradual migration with adapter layer |
| **Branch & Merge** | Long-running refactors (days/weeks) | Regular rebasing, final squash optional |

---

## 3. Step-by-Step Migration

### 3.1 Incremental Migration Workflow

```
Step 1: Setup
├── Create feature flag (if applicable)
├── Write/update tests for current behavior
└── Commit: "test: add tests for [feature] before refactor"
│
Step 2: Add New Implementation
├── Create new files alongside old ones
├── Implement with tests
└── Commit: "feat: add new [component/hook/util] implementation"
│
Step 3: Gradual Migration
├── Update one consumer at a time
├── Toggle feature flag per consumer
└── Commit per consumer: "refactor: migrate [consumer] to new [thing]"
│
Step 4: Validation
├── Remove old implementation
├── Remove feature flag
└── Commit: "chore: remove deprecated [thing] and feature flag"
```

### 3.2 Feature Flag Pattern

```typescript
// config/features.ts
export const FEATURES = {
  useNewDataLayer: process.env.NEW_DATA_LAYER === 'true',
  enableNewUI: process.env.NEW_UI === 'true',
};

// Consumer code
import { FEATURES } from './config/features';
import { oldFetchData } from './api/old';
import { newFetchData } from './api/new';

export async function fetchData() {
  return FEATURES.useNewDataLayer 
    ? newFetchData() 
    : oldFetchData();
}
```

### 3.3 Commit Message Templates

```
# Initial setup
setup: prepare for [migration-name] refactor
- Add feature flag
- Document current behavior
- Add baseline tests

# Migration steps
refactor: migrate [file/module] to [new-pattern]
- Replace [old-thing] with [new-thing]
- Update imports in [affected-files]
- Verified: tests pass, types check

# Cleanup
chore: remove deprecated [thing]
- Remove old implementation
- Remove feature flag
- Clean up temporary files
```

---

## 4. Common Refactoring Patterns

### 4.1 Extract Component

**When:** Component >150 lines or multiple responsibilities

```typescript
// BEFORE: Monolithic component
function UserDashboard() {
  // 200 lines of user list logic
  // 150 lines of analytics logic  
  // 100 lines of settings logic
}

// AFTER: Extracted components
function UserDashboard() {
  return (
    <>
      <UserList />
      <AnalyticsPanel />
      <SettingsPanel />
    </>
  );
}
```

**Steps:**
1. Identify cohesive UI section to extract
2. Copy section to new file
3. Identify props needed (data + callbacks)
4. Replace original with component usage
5. Run tests and type check

### 4.2 Extract Hook

**When:** Logic is reused or component has complex state/effects

```typescript
// BEFORE: Logic in component
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => { /* fetch logic */ }, []);
  // ... 50 more lines
}

// AFTER: Custom hook
function useUser(userId: string) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => { /* fetch logic */ }, [userId]);
  
  return { user, loading, error, refetch };
}

function UserProfile() {
  const { user, loading, error } = useUser(userId);
  // Clean component focused on presentation
}
```

### 4.3 Move File/Folder

**When:** Improving project structure, fixing circular dependencies

**Strategy - Import Redirect Pattern:**

```typescript
// Step 1: Move file, create redirect
// old/location/api.ts → new/location/api.ts

// old/location/api.ts (redirect file)
export * from '../../new/location/api';
export { default } from '../../new/location/api';

// Step 2: Update imports gradually (one PR per area)
// Step 3: Remove redirect file when all imports updated
```

### 4.4 Rename with Consistent Updates

**When:** Improving naming clarity, following conventions

**Safe Rename Checklist:**
- [ ] Rename the symbol
- [ ] Update all imports
- [ ] Update string references (if any)
- [ ] Update test descriptions
- [ ] Update documentation comments
- [ ] Run full test suite

```bash
# VS Code: F2 rename (updates imports)
# JetBrains: Shift+F6 rename

# CLI fallback with sed
grep -rl "oldName" --include="*.ts" --include="*.tsx" . | xargs sed -i 's/oldName/newName/g'
```

### 4.5 Convert Class to Function Component

**When:** Modernizing React code, simplifying lifecycle management

```typescript
// BEFORE: Class component
class UserCard extends React.Component<Props, State> {
  componentDidMount() { /* init */ }
  componentDidUpdate(prevProps) { /* side effect */ }
  componentWillUnmount() { /* cleanup */ }
  render() { /* JSX */ }
}

// AFTER: Function component with hooks
function UserCard(props: Props) {
  // useState for state
  // useEffect for lifecycle (mount, update, unmount)
  // Custom hooks for reusable logic
  return /* JSX */;
}
```

**Conversion Mapping:**
| Class | Function |
|-------|----------|
| `constructor` | Top-level code / `useState` |
| `componentDidMount` | `useEffect(() => {...}, [])` |
| `componentDidUpdate` | `useEffect(() => {...}, [dep])` |
| `componentWillUnmount` | `useEffect(() => { return () => {...} }, [])` |
| `this.state` | `useState` |
| `this.setState` | State setter from `useState` |
| `this.props` | Function parameter |

### 4.6 Add TypeScript Types

**When:** Converting JS to TS, improving type safety

**Incremental Strategy:**

```typescript
// Step 1: Rename to .ts (loose types)
function processData(data: any): any { }

// Step 2: Add interfaces for inputs
interface ProcessDataInput {
  id: string;
  value: number;
}
function processData(data: ProcessDataInput): any { }

// Step 3: Add return types
interface ProcessDataOutput {
  result: string;
  timestamp: Date;
}
function processData(data: ProcessDataInput): ProcessDataOutput { }

// Step 4: Remove 'any' types gradually
```

---

## 5. Verification Checklist

Run before each commit and after completion:

### 5.1 Automated Checks

```bash
# Type checking
npm run type-check      # or: tsc --noEmit
yarn type-check

# Linting
npm run lint
npm run lint -- --fix   # auto-fix where possible

# Tests
npm test
npm test -- --coverage  # verify coverage maintained

# Build
npm run build

# Dead code detection (if available)
npm run find-dead-code  # or use knip, unimported
```

### 5.2 Manual Verification

- [ ] **Console warnings** - Check browser/dev console for warnings
- [ ] **Feature parity** - Key user flows still work
- [ ] **Edge cases** - Empty states, errors, loading states
- [ ] **Accessibility** - Keyboard nav, screen reader labels
- [ ] **Performance** - No significant regressions (DevTools Profiler)

### 5.3 Final Review Checklist

- [ ] No `console.log` or `debugger` statements left
- [ ] No `TODO` or `FIXME` comments (or ticketed)
- [ ] No `any` types added unnecessarily
- [ ] No commented-out code blocks
- [ ] Documentation updated (README, JSDoc, etc.)

---

## 6. Post-Refactor Steps

### 6.1 Code Review Preparation

```markdown
## PR Description Template

### Summary
Brief description of what changed and why.

### Changes
- [ ] List major changes
- [ ] Note any breaking changes
- [ ] Highlight areas needing careful review

### Testing
- [ ] How you tested
- [ ] Test coverage impact
- [ ] Manual QA steps performed

### Migration Notes
- Any actions required by consumers
- Breaking changes and how to handle them
```

### 6.2 Documentation Updates

- [ ] Update README if API changed
- [ ] Update JSDoc/TSDoc comments
- [ ] Update architecture diagrams
- [ ] Update team wiki/playbooks
- [ ] Create migration guide for breaking changes

### 6.3 Cleanup Tasks

```bash
# Find potentially dead code
npx knip                    # Find unused exports/dependencies
npx unimported              # Find unimported files

# Remove temporary files
# - Feature flags (if fully rolled out)
# - Old implementations (after migration complete)
# - Migration scripts/helpers
```

---

## 7. Risk Mitigation

### 7.1 Backup Strategy

```bash
# Create backup branch before major refactor
git checkout -b backup/pre-[migration-name]
git push -u origin backup/pre-[migration-name]

# Tag significant checkpoint
git tag -a checkpoint-[date] -m "Pre-refactor checkpoint"
```

### 7.2 Testing in Isolation

```bash
# Test specific module
cd packages/specific-package
npm test -- --watch

# Test with minimal dependencies
npm test -- --testPathPattern="specific-pattern"

# E2E test critical path only
npm run test:e2e -- --grep="critical-flow"
```

### 7.3 Staged Deployment

```
Deploy Strategy:
│
├─> Staging Environment
│   ├─ Run full test suite
│   ├─ Manual QA of key flows
│   └─ Performance baseline comparison
│
├─> Canary/Partial Rollout (if available)
│   ├─ 5% of traffic
│   ├─ Monitor error rates
│   └─ Monitor performance metrics
│
└─> Production
    ├─ Deploy during low-traffic window
    ├─ Monitor for 1-4 hours
    └─ Keep rollback option ready
```

### 7.4 Post-Deployment Monitoring

- [ ] Error tracking (Sentry, LogRocket, etc.)
- [ ] Performance metrics (Web Vitals, custom timings)
- [ ] Business metrics (conversion, engagement)
- [ ] User feedback channels

---

## 8. Communication

### 8.1 Change Documentation

```markdown
## Migration Guide: [Feature Name] v1 → v2

### Breaking Changes
| Old API | New API | Migration |
|---------|---------|-----------|
| `oldFn()` | `newFn()` | Replace call, param order changed |
| `OldComponent` | `NewComponent` | Props renamed: `x` → `y` |

### Deprecation Timeline
- v2.0: New API available, old API deprecated
- v2.5: Console warnings for old API
- v3.0: Old API removed

### Codemod (if available)
```bash
npx @company/codemod migrate-feature-v2
```
```

### 8.2 Team Communication

**For small teams (<5):**
- Slack/Discord message in dev channel
- Brief in next standup

**For large teams (10+):**
- RFC document for significant changes
- Team meeting walkthrough
- Updated developer docs
- Breaking change announcement (email/Slack)

### 8.3 Breaking Change Notice Template

```markdown
⚠️ BREAKING CHANGE: [Feature/Component Name]

**Effective Date:** [Date]
**Affected Versions:** [Version range]
**Migration Deadline:** [Date]

**What's Changing:**
[1-2 sentence summary]

**Action Required:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Questions?**
Contact: @username or #channel
```

---

## Quick Reference: Migration Decision Flow

```
Starting a refactor?
│
├─> Step 1: ANALYSIS (always)
│   ├─ Map dependencies
│   ├─ Assess risk level
│   └─ Document current behavior
│
├─> Step 2: PLAN
│   ├─ Define scope & boundaries
│   ├─ Choose approach (atomic/incremental)
│   ├─ Create rollback plan
│   └─ Estimate timeline
│
├─> Step 3: EXECUTE
│   ├─ Make small, safe changes
│   ├─ Run verification after each step
│   └─ Commit frequently with clear messages
│
└─> Step 4: VERIFY & SHIP
    ├─ All automated checks pass
    ├─ Manual QA complete
    ├─ Code review approved
    └─ Deploy with monitoring
```

---

## Common Anti-Patterns to Avoid

1. **Refactoring without tests** - Always have a safety net
2. **Mixing refactor with feature work** - Keep separate PRs
3. **Big bang rewrites** - Prefer incremental when possible
4. **Not communicating changes** - Keep team informed
5. **Skipping verification** - Run the full checklist
6. **No rollback plan** - Always have an escape hatch
7. **Refactoring "while I'm here"** - Stay focused on the task

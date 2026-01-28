# Git Workflow Best Practices

> Comprehensive guide for Git workflows: commit messages, branch naming, pull requests, and team collaboration standards.

---

## 📋 Overview

This skill provides battle-tested Git conventions used by top engineering teams (Google, Microsoft, Airbnb, etc.) to maintain clean, readable, and traceable version control history.

---

## 📝 Commit Messages (Conventional Commits)

Use the **Conventional Commits** specification for structured, machine-readable commit messages.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add OAuth2 login` |
| `fix` | Bug fix | `fix(api): resolve null pointer` |
| `docs` | Documentation only | `docs(readme): update API examples` |
| `style` | Code style (formatting, semicolons) | `style(button): fix indentation` |
| `refactor` | Code change neither fix nor feature | `refactor(utils): simplify date parser` |
| `perf` | Performance improvement | `perf(query): add database index` |
| `test` | Adding/updating tests | `test(auth): add login unit tests` |
| `chore` | Build process, dependencies | `chore(deps): upgrade react to 19` |
| `ci` | CI/CD changes | `ci(github): add lint workflow` |
| `revert` | Revert previous commit | `revert: feat(auth) oauth login` |

### Subject Rules

- Use **imperative, present tense**: "add" not "added" or "adds"
- **No capital letter** at start
- **No period** at end
- Maximum **50 characters**
- Describe **what** and **why**, not **how**

```
✅ feat: add user authentication
✅ fix: resolve memory leak in dashboard

❌ Added user authentication
❌ feat: Added user authentication.
❌ fix(memory leak fixed)
```

### Body Guidelines

- Wrap at **72 characters**
- Explain **motivation** for the change
- Contrast with previous behavior
- Reference issues: `Fixes #123`, `Closes #456`

### Full Example

```
feat(auth): implement JWT token refresh

Add automatic token refresh mechanism to prevent session
expiration during active use. Tokens now refresh 5 minutes
before expiry.

- Add /api/auth/refresh endpoint
- Update AuthProvider with refresh logic
- Add tests for token expiration scenarios

Fixes #234
Closes #567
```

---

## 🌿 Branch Naming Conventions

### Format

```
<type>/<description>
# or with ticket ID
<type>/<ticket-id>-<description>
```

### Branch Types

| Type | Purpose | Example |
|------|---------|---------|
| `feature/` | New functionality | `feature/user-authentication` |
| `feat/` | Alternative for features | `feat/payment-integration` |
| `fix/` | Bug fixes | `fix/login-timeout` |
| `bugfix/` | Alternative for fixes | `bugfix/123-memory-leak` |
| `hotfix/` | Critical production fixes | `hotfix/security-vulnerability` |
| `refactor/` | Code restructuring | `refactor/database-queries` |
| `docs/` | Documentation changes | `docs/api-reference` |
| `test/` | Test additions/changes | `test/auth-unit-tests` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `release/` | Release preparation | `release/2.1.0` |
| `experiment/` | Experimental work | `experiment/new-ui-approach` |

### Naming Rules

- Use **lowercase** only
- Use **hyphens** to separate words
- Keep under **50 characters**
- Be **descriptive and specific**
- Include ticket ID when available

```
✅ feature/oauth-google-integration
✅ fix/567-login-timeout-error
✅ hotfix/payment-processing-crash

❌ feature/new-stuff
❌ fix-the-bug
❌ Feature_UserAuth
❌ feature/new_feature
```

### With Issue Tracking

```
feature/PROJ-1234-user-authentication
fix/GH-567-memory-leak
hotfix/TICKET-890-api-timeout
```

---

## 🔀 Pull Request Best Practices

### PR Title Format

```
<type>: <description>
```

Or with ticket reference:

```
[<ticket-id>] <type>: <description>
```

Examples:
- `feat: implement dark mode toggle`
- `fix: resolve dashboard loading issue`
- `[PROJ-1234] feat: add user profile page`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console errors

## Related Issues
Fixes #123
Closes #456
Related to #789
```

### PR Best Practices

1. **Keep PRs small** — Under 400 lines when possible
2. **One concern per PR** — Don't mix features and refactors
3. **Descriptive title** — Reviewers should understand the change at a glance
4. **Fill out the description** — Context helps reviewers
5. **Link related issues** — Use `Fixes #123` syntax
6. **Add screenshots** — For UI changes
7. **Request specific reviewers** — 2 reviewers is optimal
8. **Respond to feedback promptly** — Within 24 hours

---

## 🏗️ Git Workflow Strategies

### GitHub Flow (Recommended for most teams)

Simple workflow ideal for continuous deployment:

```
main (always deployable)
  ↓
feature/description → PR → merge to main
```

Steps:
1. Create feature branch from `main`
2. Make commits
3. Open PR to `main`
4. Review and approve
5. Merge and deploy

### Git Flow (For scheduled releases)

More structured workflow with release branches:

```
main (production)
  ↓
develop (integration)
  ↓
feature/*, release/*, hotfix/*
```

Branch purposes:
- `main` — Production-ready code
- `develop` — Integration branch for features
- `feature/*` — New features (from develop)
- `release/*` — Release preparation (from develop)
- `hotfix/*` — Critical fixes (from main)

---

## 🔐 Security & Best Practices

### Commit Security

```bash
# Never commit secrets
.env
.env.local
*.key
*.pem
secrets.json

# Use git-secrets hook
brew install git-secrets
git secrets --install
git secrets --register-aws
```

### Protected Branches

Configure branch protection rules:
- Require PR reviews (minimum 1)
- Require status checks to pass
- Require up-to-date branches
- Restrict push access
- Require signed commits (optional)

### Clean History

```bash
# Squash commits before merging for clean history
# Option 1: Squash during merge (GitHub/GitLab)
# Option 2: Interactive rebase
git rebase -i HEAD~5

# Keep commits atomic and focused
```

---

## 🛠️ Useful Git Commands

### Branch Management

```bash
# List branches with last commit date
git branch -v

# Delete merged local branches
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d

# Delete merged remote branches
git remote prune origin

# Rename branch
git branch -m old-name new-name
```

### Commit Operations

```bash
# Amend last commit
git commit --amend --no-edit

# Add files to last commit
git add .
git commit --amend --no-edit

# Squash last N commits
git reset --soft HEAD~3
git commit -m "feat: new feature"

# Cherry-pick commit
git cherry-pick abc1234
```

### History & Debugging

```bash
# View commit history with graph
git log --oneline --graph --decorate --all

# Find commit that introduced bug
git bisect start
git bisect bad HEAD
git bisect good v1.0

# Show changes for specific file
git log -p --follow -- filename
```

---

## 🤖 Automation Tools

### Git Hooks

Pre-commit hook for branch naming validation:

```bash
#!/bin/bash
# .git/hooks/pre-commit

branch=$(git symbolic-ref --short HEAD)
pattern="^(feature|feat|fix|bugfix|hotfix|refactor|docs|test|chore|release)\/[a-z0-9-]+$"

if ! echo "$branch" | grep -Eq "$pattern"; then
    echo "ERROR: Branch name '$branch' does not match convention"
    echo "Expected: <type>/<description>"
    echo "Types: feature, feat, fix, bugfix, hotfix, refactor, docs, test, chore"
    exit 1
fi
```

### CI/CD Integration

GitHub Actions workflow for validation:

```yaml
name: Validate Git

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate branch name
        run: |
          branch="${GITHUB_HEAD_REF}"
          pattern="^(feature|feat|fix|bugfix|hotfix|refactor|docs|test|chore)\/[a-z0-9-]+$"
          if ! echo "$branch" | grep -Eq "$pattern"; then
            echo "Invalid branch name: $branch"
            exit 1
          fi
      
      - name: Validate commit messages
        uses: wagoid/commitlint-github-action@v5
```

### Recommended Tools

| Tool | Purpose |
|------|---------|
| [commitlint](https://commitlint.js.org/) | Lint commit messages |
| [commitizen](https://commitizen.github.io/cz-cli/) | Interactive commit helper |
| [git-secrets](https://github.com/awslabs/git-secrets) | Prevent secret commits |
| [husky](https://typicode.github.io/husky/) | Git hooks manager |
| [lint-staged](https://github.com/okonet/lint-staged) | Run linters on staged files |

---

## 📚 Quick Reference Card

```
COMMIT MESSAGE
├── type(scope): subject        ← 50 chars max
│   └── types: feat, fix, docs, style, refactor, 
│              perf, test, chore, ci, revert
├── body                          ← 72 chars wrap
└── footer                        ← Fixes #123

BRANCH NAME
├── Format: type/description
│   └── feature/user-auth
│   └── fix/123-memory-leak
└── Rules: lowercase, hyphens, <50 chars

PULL REQUEST
├── Title: type: description
├── Body: Description, Testing, Checklist
└── Reviewers: 2 optimal
```

---

## 🔗 Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [GitHub Flow Guide](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Git Flow Original Post](https://nvie.com/posts/a-successful-git-branching-model/)
- [How We Use Git at Microsoft](https://docs.microsoft.com/en-us/azure/devops/learn/devops-at-microsoft/use-git-microsoft)

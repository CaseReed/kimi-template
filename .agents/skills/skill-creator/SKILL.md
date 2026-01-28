---
name: skill-creator
description: Guide for creating effective skills - best practices and mandatory checklist
license: MIT
compatibility: All project types
---

# Skill Creator Guide

**Creating a skill requires research first, writing second.**

---

## 🎯 Purpose

This skill defines the mandatory process for creating new skills in this project.

**Why this matters:**
- Prevents outdated or incorrect information
- Ensures consistency across all skills
- Reduces bugs caused by wrong assumptions
- Maintains trust in the skill system

---

## ⚠️ MANDATORY RULE: Research Before Writing

### The Golden Rule

> **🔴 NEVER create a skill without FIRST checking the official documentation.**

```
┌─────────────────────────────────────────────────────────┐
│                    SKILL CREATION FLOW                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. IDENTIFY need for new skill                         │
│     ↓                                                   │
│  2. CHECK /skill:source-of-truth                        │
│     ↓                                                   │
│  3. READ official documentation                         │
│     ↓                                                   │
│  4. VERIFY version compatibility                        │
│     ↓                                                   │
│  5. ONLY THEN write the skill                           │
│     ↓                                                   │
│  6. UPDATE source-of-truth                              │
│     ↓                                                   │
│  7. UPDATE AGENTS.md skill count & list                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Pre-Creation Checklist

### Step 1: Check Source of Truth

```bash
# Before creating ANY skill:
"/skill:source-of-truth"
```

Verify:
- [ ] Does the technology already exist in source-of-truth?
- [ ] Are the versions documented up to date?
- [ ] Are there any breaking changes I should know about?

### Step 2: Read Official Documentation

**ALWAYS visit the official docs:**

| Technology Type | Where to Check |
|-----------------|----------------|
| **Framework** | Official website (nextjs.org, react.dev, etc.) |
| **Library** | GitHub README + official docs site |
| **Tool** | Official documentation site |
| **Service** | Developer documentation portal |

**What to verify:**
- [ ] Current stable version
- [ ] Installation method
- [ ] Basic usage examples
- [ ] Breaking changes from previous versions
- [ ] Compatibility with project stack

### Step 3: Verify Against Project

```bash
# Check actual versions in the project:
cat package.json | grep "<package-name>"
```

Ensure:
- [ ] Skill matches the project's installed version
- [ ] Examples work with project's configuration
- [ ] No conflicting information with existing skills

---

## Writing the Skill

### Required Sections

Every skill MUST include:

```markdown
---
name: skill-name
description: Brief description
license: MIT
compatibility: Version requirements
---

# Skill Name

## Quick Reference

## Installation

## Core Patterns

## Common Pitfalls

## Validation Checklist
```

### Language Rules

**ALL skill content MUST be in English:**
- Skill file content
- Code comments
- Documentation
- Examples

**CLI Conversations remain in French** (as per project rules).

---

## Post-Creation Checklist

### Step 4: Update source-of-truth

Add to `.agents/skills/source-of-truth/SKILL.md`:
- Official documentation link
- Version number
- Any critical notes

### Step 5: Update AGENTS.md

```markdown
# Update skill count
This project has **XX specialized skills**

# Add to skill list table
| `/skill:your-new-skill` | Brief description | When to use |
```

### Step 6: Test the Skill

Before considering complete:
- [ ] Skill file is valid Markdown
- [ ] All code examples are syntactically correct
- [ ] Information matches official docs
- [ ] Cross-references work (if any)

---

## Anti-Patterns

### ❌ DON'T: Create Without Research

```
User: "Create a skill for X"
AI: [immediately starts writing]
```

**Why bad:** Outdated info, wrong syntax, broken examples.

### ✅ DO: Research First

```
User: "Create a skill for X"
AI: 
1. Check source-of-truth
2. Visit official docs
3. Verify versions
4. [THEN write skill]
```

### ❌ DON'T: Copy from Memory

**Why bad:** APIs change, syntax evolves, details matter.

### ✅ DO: Copy from Official Source

**Why good:** Accurate, up-to-date, trustworthy.

---

## Example: Creating a Skill for Library X

### User Request
> "Create a skill for TanStack Query"

### Correct Process

```
1. CHECK source-of-truth
   → TanStack Query v5 documented ✓

2. READ official docs
   → https://tanstack.com/query/latest/docs
   → Verify current API
   → Check React 19 compatibility

3. VERIFY in project
   → Check package.json: "@tanstack/react-query": "^5.x"
   → Review existing usage in codebase

4. WRITE skill
   → Create .agents/skills/tanstack-query/SKILL.md
   → Include verified examples

5. UPDATE source-of-truth
   → Add any new links discovered

6. UPDATE AGENTS.md
   → Increment count: 17 → 18
   → Add to skill list
```

---

## Emergency Override

**Only skip research if:**
- Technology is already extensively used in the project
- AND you've just verified the documentation recently
- AND no version changes are expected

**Still required:**
- Quick check of source-of-truth
- Verify version in package.json

---

## Summary

| Phase | Action | Mandatory? |
|-------|--------|------------|
| Before | Check source-of-truth | ✅ YES |
| Before | Read official docs | ✅ YES |
| Before | Verify version | ✅ YES |
| During | Write skill content | ✅ YES |
| After | Update source-of-truth | ✅ YES |
| After | Update AGENTS.md | ✅ YES |

**Remember:** A bad skill is worse than no skill. Research first.

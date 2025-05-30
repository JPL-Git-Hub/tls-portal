# Agentic Refactoring Patterns

## Core Principle
**Only refactor when it makes the code simpler.** If a refactor adds complexity, abstraction, or confusion - don't do it.

## The 3 Refactoring Triggers

### 1. Pain-Driven Refactoring
Refactor ONLY when you feel actual pain:
- You're copy-pasting the same code for the 3rd time
- A simple change requires updating 5+ files
- You can't understand your own code after 2 weeks
- A bug fix revealed a structural problem

### 2. Performance-Driven Refactoring
Refactor when measured (not imagined) performance issues:
- Actual user complaints about speed
- Measured API response times > 500ms
- Database queries taking > 100ms
- Bundle size affecting load time

### 3. Integration-Driven Refactoring
Refactor when adding new services:
- New service doesn't fit current structure
- Integration would duplicate significant code
- Clear pattern emerges from 3+ similar services

## When NOT to Refactor

❌ **Never refactor for:**
- "Better" architecture
- Future possibilities
- Industry "best practices"
- Code aesthetics
- What you learned in a blog post

## The Refactoring Process

### Step 1: Identify Pain (5 minutes)
Write down EXACTLY what hurts:
- "I have to update 6 files to add a field"
- "This function is 200 lines and I can't follow it"
- "Every new endpoint copies the same 30 lines"

### Step 2: Use Git History as Evidence (10 minutes)
```bash
# Files changed most frequently (top 10)
git log --pretty=format: --name-only | sort | uniq -c | sort -rg | head -10

# Files that change together (coupling)
git log --format='' --name-only | grep -v '^$' | sort | uniq -c | sort -nr

# Recent refactoring attempts (what didn't work)
git log --grep="refactor" --oneline
```

### Step 3: Design Simplification (15 minutes)
The refactor MUST:
- Reduce total lines of code
- Reduce number of files
- Make the next change easier
- Be explainable in one sentence

## Essential Patterns

### Path Resolution Pattern
**Problem:** Hardcoded paths break when project structure changes
**Pattern:** Use __dirname, process.cwd(), or path.resolve() - never hardcode
**Gotcha:** Paths differ between dev (src/) and prod (dist/)

```typescript
// ❌ NEVER
const config = require('/Users/john/tls-portal/config.json')

// ✅ ALWAYS
const config = require(path.join(__dirname, '../config.json'))
const config = require(path.resolve(process.cwd(), 'config.json'))
```

### Database Connection Pattern
**Problem:** Service can't connect in development
**Pattern:** Always check for emulator env vars before initializing
**Gotcha:** Environment variables must be set BEFORE imports

### Standard Service Structure
**Problem:** Services have different patterns
**Pattern:** Copy the simplest working pattern
```
src/[service-name]/
  ├── src/
  │   ├── routes/    # Express routes
  │   ├── services/  # Business logic
  │   ├── types/     # TypeScript types
  │   └── server.ts  # Entry point
  └── package.json
```

### Configuration Pattern
**Problem:** Config scattered across services
**Pattern:** Environment variables + shared config
```typescript
// Before: Hardcoded in each service
const TIMEOUT = 30000

// After: From environment
const TIMEOUT = process.env.SERVICE_TIMEOUT || 30000
```

### Error Handling Pattern
**Problem:** Inconsistent error responses across services
**Pattern:** Standard error middleware returns { error: string, stack?: string }
**Gotcha:** Never expose stack traces in production

### Port Configuration Pattern
**Problem:** Hardcoded ports cause conflicts
**Pattern:** Always use PORT env var with fallback: `process.env.PORT || 3001`
**Gotcha:** Frontend and backend need different default ports

## Script Development Patterns

### Variable Naming Pattern
**Problem:** ALL_CAPS variables confused with environment variables
**Pattern:** Use lowercase for script-local variables, ALL_CAPS only for true env vars
**Gotcha:** Keep $HOME, $PATH, etc. in caps - they're real env vars

### Script Path Pattern
**Problem:** Scripts break when run from different directories
**Pattern:** Always use `SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"`
**Gotcha:** Use BASH_SOURCE not $0 for sourced scripts

### Color Output Pattern
**Problem:** Inconsistent script output hard to read
**Pattern:** Green=success, Yellow=warning, Red=error, use ✓ ✗ ⚠ symbols
**Gotcha:** Always reset color with NC (no color) after colored text

## Service Addition Checklist

When adding new services:

1. **Copy Closest Example** - Find the most similar existing service
2. **Check for Patterns** - Use patterns documented here
3. **Share Obvious Code** - Utils/types in shared package
4. **Document Surprises Only** - Integration quirks, non-obvious config
5. **Resist Abstraction** - No service base classes or clever generators

## Documentation During Refactoring

### Document Patterns, Not Code
When refactoring reveals a pattern:
- **The Problem:** What pain did you hit?
- **The Solution:** What pattern fixed it?
- **The Gotcha:** What surprised you?

Example:
```markdown
## Firebase Emulator Connection Pattern
**Problem:** Services failing in dev with credential errors
**Solution:** Set FIRESTORE_EMULATOR_HOST before Firebase init
**Gotcha:** Must be set before ANY Firebase import
```

### Skip the Obvious
Don't document:
- How React works
- What Express middleware does
- Standard TypeScript patterns
- Anything Google can answer

## Refactoring Checklist

Before starting:
- [ ] Can I explain the pain in one sentence?
- [ ] Will this reduce total complexity?
- [ ] Can I complete it in under 4 hours?
- [ ] Will a junior dev understand the result?

During refactoring:
- [ ] App stays functional after each commit
- [ ] Each commit does one type of change
- [ ] No new dependencies added
- [ ] No new abstractions created

After refactoring:
- [ ] Fewer files OR fewer lines (ideally both)
- [ ] The specific pain is gone
- [ ] No new pain introduced
- [ ] One-sentence explanation ready

## The Final Test

After any refactor, you should be able to say:

> "I refactored [specific thing] because [specific pain]. Now [specific improvement]. It's simpler because [fewer files/lines/steps]."

If you can't fill in ALL those blanks with concrete specifics, you probably added complexity instead of removing it.

**Remember:** The best refactor is the one that makes future-you say "oh, that's obvious" not "wow, that's clever".
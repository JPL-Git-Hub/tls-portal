# Agentic Coding Philosophy — TLS Portal

## Core Philosophy & Vision

This project follows an **intentionally lightweight and clean architecture that prioritizes maintainability and efficiency over unnecessary complexity**. We build production-capable systems through simplicity, not complexity.

### What We Embrace

- **Clarity over Cleverness** - Code that explains itself without documentation
- **Explicit over Implicit** - Direct paths with no hidden magic
- **Boring Technology** - Proven tools that just work
- **YAGNI (You Ain't Gonna Need It)** - Build only what's needed now
- **Single Responsibility** - Each piece does one thing well
- **30-Minute Chunks** - Everything should be achievable in focused bursts

## Core Development Principles

> *These axioms represent the fundamental beliefs that guide every decision in this project. They exist to preserve the integrity and simplicity that makes this codebase maintainable and reliable.*

> *These are not mere preferences—they are the foundational philosophy that defines how we build software. When faced with any technical choice, these principles provide the answer.*

> *Adherence to these tenets ensures the code remains approachable, the architecture stays clean, and the project fulfills its mission of elegant simplicity.*

**The Three Pillars:**
1. **Simplicity Above All** - Complexity is the enemy
2. **Use What Exists** - New tools create new problems  
3. **Immediate Understanding** - Code should explain itself

## Quick Decision Guide

### ✅ Green Light - Go Ahead If:
- Implementation takes under 100 lines
- Single, clear purpose
- No new dependencies needed
- Follows existing project patterns
- Can be implemented in one focused session

**Exception for Init Scripts:** Initialization scripts that create complete, working modules may exceed 100 lines when breaking them apart would create unnecessary orchestration complexity. The goal is working functionality, not arbitrary line limits. A 200-line script that gives you a complete working backend is simpler than three 70-line scripts that must be run in sequence.

**The real test:** Ask "Does this make the project simpler?" If one longer script eliminates complexity and gets you to working code faster, choose the longer script.

### 🛑 Red Flag - Stop If:
- Needs extensive documentation to understand
- Requires learning new tools or frameworks
- Adds configuration files or abstractions
- Uses enterprise patterns (DI, factories, etc.)
- Takes more than a day to implement

### ⚡ Quick Check:
**Before suggesting ANY improvement, ask:**
1. Does this add complexity? (If yes → reject)
2. Does this require new tools? (If yes → reject)
3. Requires multiple work sessions? (If yes → reject)
4. Would a junior understand immediately? (If no → reject)

## Production Requirements

This system MUST handle:
- 5,000 total client portals
- Up to 25 portals active simultaneously
- Production-grade security and reliability
- Single-container deployment to Google Cloud Run
- Multi-tenant data isolation

**But achieve this through simple, well-designed architecture** - not complex enterprise patterns.

## What We DO: Patterns & Examples

### Good Pattern (from our actual codebase):
```bash
# Simple idempotency using marker files
marker="$project_root/$MARKER_DIR/structure.done"
if is_completed "$marker" && ! is_force "$@"; then
    log_warn "Structure already initialized. Use --force to recreate."
    return 0
fi
```

### Simple Improvements We Support:
- Basic idempotency markers (touch .done files)
- Consolidating duplicate code into simple functions
- Moving files to logical locations without complex hierarchies
- Creating simple templates with variable substitution
- Basic validation with clear error messages
- Simple logging with echo/printf
- Straightforward bash functions under 20 lines

### Real Examples from This Project:
```bash
# Good: Simple utility function
log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Good: Direct file creation
cat > "$file" << 'EOF'
{
  "name": "@tls-portal/shared",
  "version": "1.0.0"
}
EOF

# Good: Clear, simple check
if ! command -v node >/dev/null 2>&1; then
    die "Node.js is required but not installed"
fi
```

## What We DON'T DO: Explicit Constraints

### Never Suggest:
- Testing frameworks beyond minimal existing setup
- Complex CI/CD pipelines (simple GitHub Actions are acceptable with Claude GitHub App)
- Manifest files or complex YAML orchestration
- Complex directory restructuring
- Multi-day implementation timelines
- Enterprise patterns (dependency injection, factories)
- Comprehensive error handling frameworks
- Logging frameworks beyond echo statements
- Configuration management systems
- Mock frameworks or test fixtures
- Documentation generation tools
- Additional package managers beyond yarn
- Container orchestration
- Separate service deployments
- Database migration frameworks
- ORM or query builders
- **Text processing tools beyond basic commands** (sed, awk, perl one-liners, regex scripts) - These are cryptic, dangerous for file modification, and violate the "junior developer understanding" test. Use manual editing, VS Code find/replace, or simple bash commands instead

**Context**: sed commands can irreversibly damage files with subtle syntax errors, making them unsuitable for a safety-first development approach.

### Violation Phrases to Avoid:
- "comprehensive testing strategy"
- "robust error handling"
- "enterprise-grade"
- "complex CI/CD pipeline" (simple Claude GitHub App automation is fine)
- "over-engineered deployment pipeline"
- "monitoring and observability framework"
- "scalable architecture"
- "distributed services"
- "best practices" (when adding complexity)

## Naming Conventions

- **All lowercase** - File names and folders should be lowercase
- **Use hyphens** - `my-file-name.md` not `MyFileName.md` 
- **Code follows language conventions** - React components use PascalCase, variables use camelCase
- **Environment variables** - UPPER_SNAKE_CASE as required by convention

## For AI Assistants

When working on this project:

1. **Default to "no"** for new suggestions
2. **Look for existing patterns first** - we probably already have a simple solution
3. **Suggest inline solutions**, not abstractions
4. **Keep solutions focused** - If it feels like a multi-day project, it's too complex
5. **If explaining takes longer than coding**, it's too complex
6. **Keep file names lowercase** with hyphens
7. **Don't create README docs just because you did work** - The git history already shows how the organization transpired. Users need the end result, not a play-by-play. Only create documentation that explains or leverages the structure in ways not evident from the code itself. Before creating any README, ask: "Does this add value beyond what's already visible in the files and folders?"

### Good AI Responses:
- "Let's just move these 3 files and update the imports."
- "Add a simple check: `if [[ -f .done ]]; then exit 0; fi`"
- "Combine these duplicate functions into one 10-line helper."
- "Copy this existing pattern from init-structure.sh"

### Bad AI Responses:
- "Implement a comprehensive testing strategy with..."
- "Create a robust error handling framework..."
- "Set up a complex CI/CD pipeline with multiple stages..."
- "Let's refactor this into a proper abstraction layer..."

### Acceptable Automation:
- Claude GitHub App for AI-assisted code reviews
- Simple GitHub Actions for automated testing and deployment
- Automated workflows that enhance developer productivity without adding complexity

## Success Metrics

A good solution in this project:
- ✓ Can be implemented in one focused session (AI estimates are pessimistic - what AI calls "30 minutes" is often 5-10 minutes in practice)
- ✓ Requires zero additional documentation
- ✓ Uses only existing dependencies
- ✓ Follows established patterns from the codebase
- ✓ Could be explained to a junior developer in 5 minutes
- ✓ Solves the immediate problem without anticipating future needs

## Decision Framework Examples

### Scenario: "We need better error handling"
❌ **Wrong**: Create an error handling framework with custom error classes
✅ **Right**: Add simple `|| die "Clear error message"` to critical commands

### Scenario: "Scripts need better organization"
❌ **Wrong**: Create scripts/modules/, scripts/utils/, scripts/tests/ hierarchy
✅ **Right**: Keep flat structure, use clear naming like init-*.sh

### Scenario: "Need to ensure idempotency"
❌ **Wrong**: Build a state management system with dependency graphs
✅ **Right**: Use simple .done marker files in .init/ directory

## Summary

This is a **minimalist yet production-capable project**. Every decision must answer: "Does this make the project simpler?" 

We're building a production-ready system that:
- Handles 5,000 client portals reliably
- Can be understood and maintained by one developer
- Uses boring, proven technology
- Achieves complexity through composition, not abstraction

**Remember**: The best code is often the code you don't write.

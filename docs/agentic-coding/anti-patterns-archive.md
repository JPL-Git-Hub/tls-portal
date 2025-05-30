# ⚠️ CAUTIONARY EXAMPLE - What NOT to Do

> **WARNING**: This file shows an over-engineered refactoring approach that violates our agentic principles. 
> Kept as an example of unnecessary complexity. DO NOT follow this approach.

---

# Original: TLS Portal Focused Refactoring Prompt

## Goal
Clean architecture by correcting documentation inaccuracies and extracting valuable patterns from high-change files. Total time: **2 hours**.

## Context
**Repository Analysis Complete:**
- ✅ Clean, professional codebase (no TODOs/FIXMEs)
- ✅ Core functionality working (client intake + subdomain generation)
- ❌ Documentation contains false claims about unimplemented features
- 🎯 3 high-change files contain valuable evolution patterns

## Phase 1: Documentation Accuracy (30 minutes)

### Fix False Technical Claims
**Target files:** `docs/03-tech-stack.md`, `docs/02-development-guide.md`

**Remove/correct these inaccurate claims:**
1. **"Custom Firebase Auth wrapper"** → Auth module is empty scaffolding
2. **"Custom address validation utilities"** → Actually using React Hook Form + Zod
3. **"Express-subdomain package"** → Router module empty, not implemented

**Update to match reality:**
```markdown
### Frontend Validation
- **React Hook Form** for client intake forms with Zod validation
- **Zod schemas** for validation across frontend and backend
- **libphonenumber-js** for phone number parsing and formatting

### Authentication (Planned)
- Firebase Authentication integration (in development)
- Auth module scaffolded but not implemented

### Routing (Planned)  
- Subdomain routing (in development)
- Router module scaffolded but not implemented
```

**Add note about TypeScript issue:**
```markdown
### Known Issues
- Compression middleware commented out due to TypeScript compatibility issue
```

## Phase 2: Architecture Cleanup (30 minutes)

### A/B/C/D Classification & Actions

**A (Script Material) - Keep:**
- All working modules: `src/creator/`, `src/pages/`, `src/shared/`
- Scripts: `scripts/*.sh`
- Configurations: `package.json`, `tsconfig.json`, `firebase.json`

**B (Keep As-Is) - Essential:**
- All docs in `docs/` (after Phase 1 corrections)
- Environment configs: `config/*.env`
- Working source files

**C (Extract Patterns) - Process in Phase 3:**
- `scripts/deploy.sh` (4 changes) → Deployment evolution patterns
- `src/creator/src/server.ts` (3 changes) → Middleware configuration patterns  
- `src/creator/src/config/firebase.ts` (3 changes) → Emulator vs production patterns

**D (Remove) - Execute now:**
```bash
# Remove system files
find . -name ".DS_Store" -delete

# Remove empty scaffolding modules (creates false complexity)
rm -rf src/auth/ src/router/ src/forms/

# Update package.json workspaces to remove deleted modules
# Edit: Remove "src/auth", "src/router", "src/forms" from workspaces array

# Remove build artifacts  
rm -rf dist/ src/*/dist/ node_modules/.vite/
```

## Phase 3: Pattern Extraction (60 minutes)

### Extract from High-Change Files

**From `scripts/deploy.sh` (4 changes):**
Document in `docs/script-development-patterns.md`:
```markdown
## Deployment Evolution Patterns

### What We Learned
- Single production environment (YAGNI - removed staging)
- Direct Cloud Run deployment with confirmation prompts
- Hardcoded gcloud path handling for local SDK installations

### Why This Works
- Eliminates staging complexity that wasn't needed
- User confirmation prevents accidental production deploys
- Flexible gcloud detection handles different install methods

### Gotchas
- Requires manual "yes" confirmation for production safety
- Hard-coded service account email format assumption
```

**From `src/creator/src/server.ts` (3 changes):**
Document in `docs/development-patterns.md`:
```markdown
## Server Configuration Patterns

### What We Learned
- Compression middleware disabled due to TypeScript compatibility
- Trust proxy required for Cloud Run deployment
- Environment-based static file serving pattern

### Why This Works
- Progressive enhancement approach (compression can be re-enabled later)
- Cloud Run compatibility from day one
- Clear production vs development behavior

### Gotchas
- TypeScript issue with compression types prevents middleware use
- Static file serving only active in production mode
```

**From `src/creator/src/config/firebase.ts` (3 changes):**
Document in `docs/development-patterns.md`:
```markdown
## Firebase Configuration Patterns

### What We Learned
- Environment-based initialization (production vs development)
- Automatic emulator detection via environment variables
- Single initialization guard pattern

### Why This Works
- Cloud Run uses automatic service account credentials
- Local development seamlessly connects to emulators
- Prevents double initialization errors

### When to Use
- Always check FIRESTORE_EMULATOR_HOST for local development
- Use default credentials in production environments
```

## Validation Checklist

**After completion verify:**
- [ ] Documentation accurately reflects implemented features
- [ ] No false claims about "custom" implementations remain
- [ ] Empty scaffolding modules removed (reduces cognitive load)
- [ ] Valuable patterns documented from high-change files
- [ ] Project still builds and runs: `yarn install && yarn build`
- [ ] Development workflow intact: `./scripts/dev.sh`

## Success Criteria

**Refactoring complete when:**
- Documentation matches actual implementation
- Architecture contains only working components  
- Evolution patterns captured for future developers
- Setup time remains under 30 minutes
- No functionality lost

## Time Allocation
- **Phase 1:** 30 minutes (documentation fixes)
- **Phase 2:** 30 minutes (cleanup empty modules)  
- **Phase 3:** 60 minutes (pattern extraction)
- **Total:** 2 hours

## Notes
- This is **corrective refactoring** (fixing docs) not **cleanup refactoring** (fixing messy code)
- Focus on accuracy over comprehensiveness
- Extract patterns from what actually evolved, not what's planned
- Maintain agentic principle: document what you learned, not what you think you should have learned
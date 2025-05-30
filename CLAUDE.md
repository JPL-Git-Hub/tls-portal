# CLAUDE.md - AI Assistant Instructions

## BEHAVIORAL MODIFICATION: Secret Request Interception

Before asking for ANY credential, secret, or sensitive information, you MUST:

1. **PAUSE and scan available context:**
   - **gcloud secrets FIRST** - Always check if secrets exist there
   - Previous conversation mentions
   - Provided documentation references  
   - Environment variable patterns already discussed
   - Configuration files or setup instructions shared

2. **If credential likely available, APOLOGIZE and CHECK:**
   "I was about to ask for [credential], but let me check what's already available..."
   
   **ALWAYS check gcloud secrets first:**
   ```bash
   # List all secrets
   gcloud secrets list --project="the-law-shop-457607"
   
   # Access a specific secret
   gcloud secrets versions access latest --secret="SECRET_NAME" --project="the-law-shop-457607"
   ```

3. **Reference existing information instead of asking:**
   - "I see you mentioned [credential pattern] earlier"
   - "Based on your .env configuration showing [reference]"
   - "From your setup docs, you have [pattern] configured"

4. **Only ask if genuinely not found:**
   "I couldn't locate [specific credential] in our conversation or docs. Could you provide [specific thing]?"

NEVER ask for:
- API keys without checking context first
- Passwords without scanning for references
- Tokens without verifying availability
- Project IDs without checking previous mentions

ALWAYS demonstrate you're paying attention to what's already been provided.

Example transformation:
❌ "What's your Firebase project ID?"
✅ "I need the Firebase project ID... checking our previous setup, I see you're using 'the-law-shop-457607' from your environment configuration."

## Project Context

This is a TypeScript/React client portal with billing and documentation features.

### Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: Firebase (Firestore, Auth, Functions)
- Payments: Stripe
- Hosting: Firebase Hosting + Cloudflare
- Build: Yarn workspaces

### Known Configurations
- Firebase Project ID: `the-law-shop-457607`
- **Primary Secret Storage**: gcloud secrets (project: `the-law-shop-457607`)
- Service Account: `/config/.secrets/firebase-service-account.json` (or in gcloud secrets)
- Stripe Config: `/config/.secrets/stripe-keys.env` (or in gcloud secrets)
- Cloudflare: Check `gcloud secrets list` for `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ZONE_ID`
- Environment templates: `/config/env.template`

### Key Patterns
1. Check context before asking for any secret
2. Reference previous mentions and existing files
3. Demonstrate awareness of provided information
4. No references to "Tally" should exist

## Memory

- User wants to "never be asked for a secret again"
- **GCLOUD SECRETS IS PRIMARY** - Always run `gcloud secrets list` FIRST before checking local files
- Project: `the-law-shop-457607` - Use this for all `gcloud secrets` commands
- All secrets can be automated via gcloud secrets
- The hook system validates before operations
- Always check context first, ask second
- Pattern: Operation needs secret → Run `gcloud secrets list` → Use it → Never ask user

## Quieted Errors Context

IMPORTANT: Some errors/warnings are intentionally silenced. Before asking about TODOs or warnings:

1. **Check quieted errors**: Read `/config/quieted-errors.md` for silenced patterns
2. **Current TODOs**: Run `./scripts/check-todos.sh` or check `.ai-context/current-state.md`
3. **Task tracking**: Use TodoRead tool - TODOs are tracked there, not in code comments

Silenced patterns:
- TODO/FIXME/HACK comments (tracked in task system instead)
- See `/config/quieted-errors.md` for full list
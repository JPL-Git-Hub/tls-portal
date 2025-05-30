# Node Modules Overview

## What We Use

### Backend (creator)
- **express** - Web server
- **firebase-admin** - Database and auth
- **cors** - Handle cross-origin requests
- **helmet** - Security headers

### Frontend (pages)
- **react** - UI framework
- **vite** - Build tool
- **tailwind** - CSS utilities
- **react-hook-form** - Form handling
- **zustand** - State management
- **axios** - API calls

### Shared
- **zod** - Validation schemas
- **libphonenumber-js** - Phone formatting

## Key Points

1. Everything is managed through Yarn workspaces
2. Dependencies are minimal and focused
3. No complex enterprise libraries
4. Each package only includes what it needs

## Updating Dependencies

```bash
# Update all packages
yarn upgrade-interactive

# Add to specific workspace
yarn workspace @tls-portal/creator add package-name
```
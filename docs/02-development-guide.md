# TLS Portal Development Guide

## Overview

This guide describes the TLS Portal system, a modular monolith with automatic client subdomain generation for law firm client portals. The system handles up to 5,000 client portals with 25 active simultaneously.

## Architecture

### Modular Monolith Design

The project follows a modular monolith architecture with clean separation of concerns:
- **creator**: Portal creation and client management (implemented)
- **pages**: React frontend portal interface (implemented)
- **shared**: Shared utilities, types, and configuration (implemented)
- **auth**: Authentication functionality (planned - not yet implemented)
- **forms**: Form interfaces for intake (planned - not yet implemented)
- **router**: Subdomain routing logic (planned - not yet implemented)

All modules communicate via direct imports within the monolith, maintaining clean boundaries without deployment separation.

### Technology Stack

See [03-tech-stack.md](03-tech-stack.md) for detailed technology decisions and architecture.

**Key versions in use:**
- TypeScript: 5.3.3
- React: 18.2.0
- Node.js: >= 18.0.0
- Yarn Classic: 1.22.x

## Setup

See [01-setup.md](01-setup.md) for complete installation instructions, prerequisites, and troubleshooting.

## Key Features

### Client Subdomain System

Each client receives a unique subdomain:
- **Format**: First 4 letters of last name + last 4 digits of mobile
- **Padding**: Short names padded with 'x' (e.g., "Li" → "lixx")
- **Uniqueness**: Automatic suffix for duplicates
- **Validation**: Enforced 4-letter + 4-digit pattern

Examples:
- John Smith (212) 555-1234 → smit1234.thelawshop.com
- Amy Li (415) 555-0001 → lixx0001.thelawshop.com
- Patrick O'Brien (555) 555-4321 → obri4321.thelawshop.com

### Client Intake Form

React-based form with comprehensive validation:
- **Fields**: First Name, Last Name, Email, Mobile
- **Phone Formatting**: Automatic (XXX) XXX-XXXX format
- **Validation**: Zod schemas with real-time feedback
- **Name Processing**: Proper case formatting, apostrophe handling
- **API Integration**: RESTful endpoint at /api/clients

### Multi-Tenant Security

Firestore rules ensure complete tenant isolation with proper access control within tenant boundaries.

## Development

### Starting the Environment

```bash
# Start all development services
./scripts/start-dev.sh

# Check service status
./scripts/check-dev-status.sh

# Stop all services
./scripts/stop-dev.sh
```

Service URLs:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Emulator UI: http://localhost:4000 (when using emulators)

### Common Tasks

```bash
# Code quality
yarn lint          # ESLint checking
yarn format        # Prettier formatting
yarn typecheck     # TypeScript validation

# Testing
yarn test          # Run test suites

# Building
yarn build         # Production build
yarn docker:build  # Container image
```

See [tls-portal-setup-guide.md](tls-portal-setup-guide.md#available-scripts) for additional scripts and commands.

### Package Management

**Important**: This project uses Yarn Classic (1.x) with workspaces. Always use `yarn` instead of `npm` or `npx` for package management to ensure proper workspace resolution and avoid lockfile conflicts.

```bash
# Add to specific workspace
yarn workspace @tls-portal/creator add [package]

# Add to root
yarn add -D -W [package]

# Run workspace script
yarn workspace @tls-portal/pages dev

# Install all dependencies
yarn install  # NOT npm install

# Run package binaries (instead of npx)
yarn vite         # NOT: npx vite
yarn tsc          # NOT: npx tsc
yarn eslint .     # NOT: npx eslint .
```

**⚠️ Warning**: Never use `npm` or `npx` - they bypass our Yarn workspace configuration and can cause:
- Version mismatches with yarn.lock
- Broken workspace symlinks
- Inconsistent node_modules structure

## Configuration

### Environment Variables

See [Configuration Documentation](../config/README-config-variables.md) for configuration details.

### Yarn Configuration

The .yarnrc file optimizes the development experience by suppressing compatibility warnings and preventing timeout errors.

### TypeScript Configuration

Balanced for productivity and type safety with strict mode enabled but allowing implicit any for rapid development.

## Script Architecture

### Centralized Libraries

The scripts/lib directory contains reusable bash utilities:
- **colors.sh** - Consistent terminal output formatting
- **config.sh** - Shared configuration values
- **utils.sh** - Common functions (validation, setup, cleanup)
- **gcloud.sh** - Google Cloud operations

### Key Scripts

- **init-all.sh** - Master setup orchestration
- **check-prerequisites.sh** - System requirement validation
- **ensure-yarn-config.sh** - Yarn configuration management
- **validate-setup.sh** - Project health verification
- **check-warnings.sh** - Development warning analysis

## Deployment

### Docker Configuration

Multi-stage build for optimization with separate build and production stages.

### Google Cloud Run

Deploy using standard Google Cloud commands after building and pushing the container image.

## Monitoring & Maintenance

### Health Checks

- Backend health endpoint: /health
- Automatic Cloud Run health monitoring
- Structured logging for debugging

### Performance Optimization

- Vite code splitting for optimal bundle sizes
- Compression middleware for response optimization (currently disabled due to TypeScript compatibility issue)
- Firestore query indexing for faster data access
- React Query caching for reduced API calls

### Security

- Helmet security headers
- CORS configuration for subdomain isolation
- Firebase Authentication with custom claims
- Firestore security rules for data protection
- Environment-based secret management

## Firebase Emulator Development

### Port Configuration

| Service | Port | Description |
|---------|------|-------------|
| Frontend (React) | 3000 | Vite dev server |
| Backend API | 3001 | Express server |
| Firebase UI | 4000 | Emulator dashboard |
| Firestore | 8080 | Database emulator |
| Auth | 9099 | Authentication emulator |
| Storage | 9199 | File storage emulator |

### Emulator Features

Access the emulator UI at `http://localhost:4000` to:
- View and edit Firestore data in real-time
- Manage test users for authentication
- Monitor security rules evaluation
- Import/export data for testing

### Development Patterns

#### Standalone HTML Testing
Create test pages for rapid prototyping:
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <script>
        const API_URL = 'http://localhost:3001/api';
        // Direct API testing without React build
    </script>
</body>
</html>
```

#### Firebase Configuration Pattern
```typescript
// Automatic emulator detection
if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log('Using Firestore emulator');
}

// Single initialization guard
let initialized = false;
export function initializeFirebase() {
    if (initialized) return;
    // ... initialization logic
    initialized = true;
}
```

### Common Issues & Solutions

**Port Already in Use**
```bash
lsof -ti:3001 | xargs kill -9  # Kill process on port
```

**Emulator Connection Failed**
- Ensure `USE_EMULATOR=true` in environment
- Check Firebase project ID matches
- Verify emulator ports are free

**TypeScript Compression Issue**
The compression middleware is temporarily disabled due to TypeScript compatibility issues. This is a known issue that doesn't affect functionality.

## Next Development Phases

1. **Authentication System** - Complete Firebase Auth integration
2. **Subdomain Routing** - Router module implementation
3. **Client Dashboard** - Portal interface development
4. **Document Management** - File upload and storage
5. **Notification System** - Email and in-app notifications
6. **Analytics Dashboard** - Usage tracking and reporting

## References

- [Tech Stack Documentation](03-tech-stack.md)
- [Setup Instructions](01-setup.md)
- [Environment Configuration](../config/README-config-variables.md)
- [Project Structure](project-structure-current.md)

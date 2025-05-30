# Client Portal Tech Stack

## Project Approach

This project is intended for deployment in production mode as a unified system, with an intentionally lightweight and clean architecture that prioritizes maintainability and efficiency over unnecessary complexity. The system will handle up to 5,000 client portals with up to 25 active simultaneously.

## Architecture

### Code Organization

Monorepo structure containing a modular monolith with clean separation of concerns:
- **pages**: React frontend portal interface (implemented)
- **creator**: Portal creation functionality (implemented)
- **shared**: Shared utilities, types, and configuration (implemented)
- **auth**: Authentication functionality (planned - module scaffolded but not implemented)
- **router**: Subdomain routing logic (planned - module scaffolded but not implemented)
- **forms**: Form interfaces for intake (planned - module scaffolded but not implemented)

All components communicate via direct imports within the monolith, maintaining clean boundaries without deployment separation.

### Deployment Model

Single-container deployment to Google Cloud Run deploying a unified portal system with modular internal organization.

### Shared Code Approach

The shared module contains:
- **types**: Shared TypeScript interface and type definitions including client data models with subdomain field
- **config**: Environment and feature configuration
- **utils**: Common utilities including logging, Zod validation schemas with automatic formatting, subdomain generation (4 letters + 4 digits), and authentication helpers
- **constants**: System-wide constants and settings

## Core Technologies

### Backend
- **Node.js** as the runtime environment
- **TypeScript** with balanced configuration for AI-assisted development
- **Express.js** for API server framework with middleware optimizations:
  - Helmet for security headers
  - Compression for response optimization (currently disabled due to TypeScript compatibility issue)
  - CORS middleware for wildcard subdomain communication
- **Firebase Admin SDK** for backend services and multi-tenant data management
- **Vitest** for testing focusing on critical user flows
- **Express-subdomain** package for routing based on client-specific subdomains (planned - router module not yet implemented)
- **ts-node** for running TypeScript files directly

### Frontend
- **React.js** for component-based UI architecture
- **TypeScript** with the same configuration as backend
- **Vite** as the build tool with optimized configuration
- **Tailwind CSS** for utility-first styling
- **Vitest** for frontend testing
- **React Query** for data fetching with automatic caching
- **Zustand** for lightweight state management
- **React Router** for navigation with code splitting
- **Firebase Authentication** integration (planned - auth module not yet implemented)
- **React Hook Form** for client intake forms with Zod validation

### Database & Authentication
- **Firestore** NoSQL database with multi-tenant security rules
- **Firebase Authentication** with custom claims for tenant isolation
- Custom authentication domain for cross-subdomain authentication
- Security rules tested to prevent cross-tenant data access
- Client subdomain generation: First 4 letters of last name + last 4 digits of mobile
  - Automatic padding with 'x' for short last names
  - Uniqueness handling with incremental suffixes
  - Validation for proper format

### Infrastructure & Deployment
- **Google Cloud Run** for containerized application deployment
- **Firebase Hosting** for static assets and frontend delivery
- **GitHub Actions** for automated CI/CD (builds containers remotely)
- **Cloudflare** for CDN, edge caching, and wildcard DNS management
- **Yarn workspaces** for monorepo package organization

### Validation & Utils
- **Zod** for schema validation across frontend and backend
- **Axios** for HTTP requests with interceptors
- **libphonenumber-js** for phone number parsing and formatting
- **React Hook Form** with Zod validation for comprehensive form handling
- **Google Secrets Manager** for credential management

### CI/CD
- **GitHub Actions** for automated workflows:
  - Testing critical security and business logic
  - Building optimized Docker images
  - Deploying to Google Cloud Run
- **Google Cloud Build** for container builds with layer optimization
- **Claude GitHub App** for AI-assisted development workflows:
  - Automated code review assistance
  - Pull request analysis and suggestions
  - Integration with Claude Code for development tasks

### Development Tools

#### Package Managers
- **npm** - Node package manager
- **Yarn** - Primary package manager with workspace support
- Project dependencies managed through Yarn workspaces with warning suppression configuration

#### Linting, Formatting & Testing
- **ESLint** - Code quality
- **Prettier** - Code formatting

#### Project Maintenance
- **npm-check-updates (ncu)** - Package version management
- **nodemon** - Auto-reload dev server
- **concurrently** - Run multiple scripts
- **cross-env** - Cross-platform environment variables

### Cloud & Security Tools
- **Firebase CLI** - Deploy Firebase apps
- **Google Cloud SDK** - Google Cloud CLI tools
- **Snyk** - Security scanning

### Performance & Optimization
- **Cloudflare** for edge capabilities including static asset caching and API response caching
- **Express Backend Optimizations** with helmet security headers, request validation, and efficient routing (compression middleware disabled due to TypeScript issue)
- **Firestore Optimizations** with collection indexing and document batching
- **Frontend Build Optimizations** via Vite configuration for code splitting, lazy loading, and content hashing
- **Caching Strategy** relying on Cloudflare edge caching
- **Catchpoint Webpagetest** for performance testing

### Container Tools (Optional)
- **Docker** - Only needed for manual/emergency deployment
- **GitHub Actions** handles all container builds remotely

### Form & Data Processing
- **React Hook Form** with Zod resolver integration
- **libphonenumber-js** for automatic phone formatting
- Form validation using React Hook Form with Zod schemas

### CLI Utilities

#### Essential for AI-Assisted Development
- **jq** - JSON processor for parsing config files and API responses
- **GitHub CLI (gh)** - Repository management (configured)

#### For API Testing & Debugging  
- **httpie** - Testing client intake API (localhost:3001/api/clients) and Firebase emulator endpoints
- **http-server** - Serving standalone test files (minimal use - Firebase emulators handle most serving)

#### Deployment Tools (Configured)
- **Firebase CLI** - Firebase project management
- **Google Cloud SDK** - Cloud resource management

### Security & Compliance
- **Google Cloud Storage** for document management with AES-256 encryption, bucket-level access controls, regional storage, and configurable retention policies
- **Google Secret Manager** for secure credential storage
- **Helmet middleware** for secure HTTP headers
- **Firestore security rules** enforcing tenant isolation

### Monitoring & Observability
- **Cloud Logging** with automatic capture by Cloud Run
- **Error reporting** requiring explicit integration
- **Firestore activity logging** with custom collection structure
- **Snyk security scanning** with GitHub integration
- **Cloudflare analytics** for subdomain performance

### Initialization Scripts

The project includes automated setup scripts:
- **init-all.sh** - Master initialization script with 9-phase setup process
- **check-prerequisites.sh** - Validates system requirements before installation
- **init-package.sh** - Creates individual modules within the monorepo
- **init-git-yarn.sh** - Sets up Git repository and Yarn workspace configuration
- **init-firebase.sh** - Configures Firebase with production-ready settings
- **ensure-yarn-config.sh** - Centralized .yarnrc creation for warning suppression
- **scripts/lib/** - Shared bash libraries for colors, configuration, utilities, and Google Cloud operations

### Package Version Management
- Caret ranges (^) for dependencies
- Yarn lockfile committed to repository
- Automatic dependency updates via npm-check-updates

### Local Development Environment
- **Firebase Emulator Suite** for local emulation of Firestore, Authentication, and Functions
- **Local Subdomain Testing** with DNS configuration for *.localhost wildcard testing
- **Development SSL** with self-signed certificates for local HTTPS
- Configuration supporting cross-subdomain authentication locally

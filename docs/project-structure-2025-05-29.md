# TLS Portal Project Structure

```
tls-portal/
├── config/                                 # Environment configuration files
│   ├── dev.env                            # Development environment variables
│   ├── env.template                       # Template for environment files
│   ├── prod.env                           # Production environment variables
│   └── secrets-values.template            # Template for secrets configuration
│
├── docs/                                  # Project documentation
│   ├── 00-agentic_coding_philosophy.md    # Coding philosophy guide
│   ├── 00-project-overview.md             # Overall project overview
│   ├── 01-setup.md                        # Initial setup guide
│   ├── 02-development-guide.md            # Development workflow guide
│   ├── 03-tech-stack.md                   # Technology stack documentation
│   ├── 04-environment-variables.md        # Environment variables guide
│   ├── 05-deployment-strategy.md          # Deployment strategy documentation
│   ├── 06-subdomain-generation-guide.md   # Subdomain generation guide
│   ├── 07-local-development-guide.md      # Local development setup
│   ├── 08-script-development-guide.md     # Scripts development guide
│   ├── 09-claude-github-app-guide.md      # Claude GitHub app integration
│   ├── 10-node-modules-analysis.md        # Node modules analysis
│   ├── 11-project-ready-checklist.md      # Project readiness checklist
│   ├── 12-cloudflare-setup.md             # Cloudflare configuration guide
│   ├── conversation-summary-2024-01-29-1620.md
│   ├── node-modules-analysis.md
│   ├── test-form.md
│   └── test-workflow.md
│
├── refactoring/                           # Refactoring guides and patterns
│   ├── 0.readme.md                        # Refactoring overview
│   ├── 1.refactoring-guide.md             # General refactoring guide
│   ├── 2.implementation-patterns.md       # Implementation patterns
│   ├── 3.example-complex-refactor-archive.md
│   ├── 5.node-modules-guide.md            # Node modules guide
│   └── project-status-roadmap.md          # Project status and roadmap
│
├── scripts/                               # Build and deployment scripts
│   ├── lib/                               # Script utilities library
│   │   ├── check-yarn-only.js             # Yarn enforcement script
│   │   ├── colors.sh                      # Terminal color utilities
│   │   ├── config.sh                      # Configuration utilities
│   │   ├── connections.sh                 # Connection test utilities
│   │   ├── gcloud.sh                      # Google Cloud utilities
│   │   ├── java.sh                        # Java-related utilities
│   │   ├── process-utils.sh               # Process management utilities
│   │   └── utils.sh                       # General utilities
│   │
│   ├── check-cli-prerequisites.sh         # Check CLI tool requirements
│   ├── check-dev-status.sh                # Check development environment
│   ├── check-tech-stack.sh                # Verify tech stack installation
│   ├── clean-deps.sh                      # Clean dependencies
│   ├── firebase-dev-env.sh                # Firebase dev environment setup
│   ├── firebase-hosting-deploy.sh         # Deploy to Firebase hosting
│   ├── google-cloud-deploy.sh             # Deploy to Google Cloud
│   ├── init-all.sh                        # Initialize all modules
│   ├── init-base-config.sh                # Initialize base configuration
│   ├── init-dev-tools.sh                  # Setup development tools
│   ├── init-docker.sh                     # Initialize Docker configuration
│   ├── init-env-config.sh                 # Setup environment configuration
│   ├── init-firebase.sh                   # Initialize Firebase
│   ├── init-module-creator.sh             # Setup creator module
│   ├── init-module-pages.sh               # Setup pages module
│   ├── init-module-shared.sh              # Setup shared module
│   ├── init-structure.sh                  # Create project structure
│   ├── stop-dev.sh                        # Stop development servers
│   ├── sync-all-secrets.sh                # Sync all secrets
│   ├── sync-secrets.sh                    # Sync specific secrets
│   ├── update-cloudflare-dns.sh           # Update Cloudflare DNS
│   └── yarn-quiet.sh                      # Quiet yarn wrapper
│
├── src/                                   # Source code (monorepo structure)
│   ├── creator/                           # Backend API service
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── firebase.ts            # Firebase configuration
│   │   │   ├── controllers/
│   │   │   │   └── clientController.ts    # Client controller logic
│   │   │   ├── middleware/
│   │   │   │   └── errorHandler.ts        # Error handling middleware
│   │   │   ├── routes/
│   │   │   │   └── clients.ts             # Client API routes
│   │   │   ├── services/                  # Business logic services
│   │   │   ├── utils/                     # Utility functions
│   │   │   └── server.ts                  # Express server entry point
│   │   │
│   │   ├── nodemon.json                   # Nodemon configuration
│   │   ├── package.json                   # Creator module dependencies
│   │   ├── tsconfig.json                  # TypeScript configuration
│   │   └── tsconfig.tsbuildinfo           # TypeScript build info
│   │
│   ├── pages/                             # Frontend React application
│   │   ├── public/                        # Static assets
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── ClientIntakeForm.tsx   # Client intake form component
│   │   │   ├── hooks/                     # React custom hooks
│   │   │   ├── utils/                     # Frontend utilities
│   │   │   ├── App.tsx                    # Main App component
│   │   │   ├── index.css                  # Global styles
│   │   │   └── main.tsx                   # React entry point
│   │   │
│   │   ├── index.html                     # HTML entry point
│   │   ├── package.json                   # Pages module dependencies
│   │   ├── postcss.config.js              # PostCSS configuration
│   │   ├── tailwind.config.js             # Tailwind CSS configuration
│   │   ├── test.html                      # Test HTML page
│   │   ├── tsconfig.json                  # TypeScript configuration
│   │   └── vite.config.ts                 # Vite build configuration
│   │
│   └── shared/                            # Shared code between modules
│       ├── src/
│       │   ├── config/                    # Shared configuration
│       │   ├── constants/                 # Shared constants
│       │   ├── types/
│       │   │   └── client.ts              # Client type definitions
│       │   ├── utils/
│       │   │   ├── subdomain.ts           # Subdomain utilities
│       │   │   └── validation.ts          # Validation utilities
│       │   └── index.ts                   # Shared module exports
│       │
│       ├── package.json                   # Shared module dependencies
│       ├── tsconfig.json                  # TypeScript configuration
│       └── tsconfig.tsbuildinfo           # TypeScript build info
│
├── Dockerfile                             # Docker container configuration
├── firebase.json                          # Firebase project configuration
├── firestore.indexes.json                 # Firestore database indexes
├── firestore.rules                        # Firestore security rules
├── npm                                    # npm wrapper script
├── npx                                    # npx wrapper script
├── package.json                           # Root package.json (workspace)
├── readme.md                              # Project README
├── start-local.sh                         # Start local development
├── storage.rules                          # Firebase storage rules
├── test-client-creation.js                # Client creation test
├── test-client-patterns.js                # Client patterns test
├── test-frontend.sh                       # Frontend test script
├── tsconfig.json                          # Root TypeScript config
└── yarn.lock                              # Yarn lock file
```

## Project Structure Overview

### Root Level
- **Configuration Files**: Docker, Firebase, TypeScript configurations
- **Scripts**: Shell scripts for development, deployment, and initialization
- **Documentation**: Comprehensive guides in `/docs` and `/refactoring`

### Source Code (`/src`)
The project follows a monorepo structure with three main modules:

1. **Creator** (`/src/creator`): Backend API service
   - Express.js server with TypeScript
   - Firebase integration
   - RESTful API endpoints for client management

2. **Pages** (`/src/pages`): Frontend React application
   - React with TypeScript and Vite
   - Tailwind CSS for styling
   - Client intake form and UI components

3. **Shared** (`/src/shared`): Shared utilities and types
   - Common TypeScript interfaces
   - Validation utilities
   - Subdomain generation logic

### Key Features
- Monorepo architecture with Yarn workspaces
- TypeScript throughout the stack
- Firebase for backend services (Firestore, Auth, Storage)
- React + Vite for modern frontend development
- Comprehensive scripting for DevOps automation
- Environment-based configuration management
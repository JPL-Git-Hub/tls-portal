# TLS Portal Project Structure

```
tls-portal/
│
├── 📄 Root Configuration Files
│   ├── package.json              # Root package.json for Yarn workspaces monorepo
│   ├── tsconfig.json            # Root TypeScript configuration
│   ├── yarn.lock                # Yarn lock file for consistent dependencies
│   ├── Dockerfile               # Docker configuration for containerization
│   ├── firebase.json            # Firebase project configuration
│   ├── firestore.rules          # Firestore security rules
│   ├── firestore.indexes.json   # Firestore index definitions
│   ├── storage.rules            # Firebase Storage security rules
│   └── readme.md                # Project README
│
├── 📁 config/                   # Environment and configuration management
│   ├── README.md                # Main config documentation
│   ├── README-config-variables.md # Environment variables documentation
│   ├── README-cloudflare.md     # Cloudflare setup documentation
│   ├── dev.env                  # Development environment variables
│   ├── prod.env                 # Production environment variables
│   ├── env.template             # Template for environment files
│   └── secrets-values.template  # Template for secret values
│
├── 📁 src/                      # Monorepo source code (Yarn workspaces)
│   │
│   ├── 📦 creator/              # Backend API service (Express + TypeScript)
│   │   ├── package.json         # Creator service dependencies
│   │   ├── tsconfig.json        # TypeScript config for creator
│   │   ├── nodemon.json         # Nodemon configuration for dev
│   │   └── src/
│   │       ├── server.ts        # Express server entry point
│   │       ├── config/
│   │       │   └── firebase.ts  # Firebase Admin SDK configuration
│   │       ├── controllers/
│   │       │   └── clientController.ts # Client CRUD operations
│   │       ├── middleware/
│   │       │   └── errorHandler.ts # Global error handling
│   │       ├── routes/
│   │       │   └── clients.ts   # Client API routes
│   │       ├── services/        # Business logic services
│   │       └── utils/           # Utility functions
│   │
│   ├── 📦 pages/                # Frontend application (React + Vite)
│   │   ├── package.json         # Pages dependencies
│   │   ├── tsconfig.json        # TypeScript config for pages
│   │   ├── vite.config.ts       # Vite bundler configuration
│   │   ├── tailwind.config.js   # Tailwind CSS configuration
│   │   ├── postcss.config.js    # PostCSS configuration
│   │   ├── index.html           # Main HTML entry point
│   │   ├── test.html            # Test HTML page
│   │   ├── public/              # Static assets
│   │   └── src/
│   │       ├── main.tsx         # React app entry point
│   │       ├── App.tsx          # Root React component
│   │       ├── index.css        # Global styles
│   │       ├── components/
│   │       │   ├── HomePage.tsx # Landing page component
│   │       │   ├── HireUsPage.tsx # Hire us page component
│   │       │   └── ClientIntakeForm.tsx # Client intake form
│   │       ├── hooks/           # Custom React hooks
│   │       └── utils/           # Frontend utilities
│   │
│   └── 📦 shared/               # Shared code between creator and pages
│       ├── package.json         # Shared module dependencies
│       ├── tsconfig.json        # TypeScript config for shared
│       └── src/
│           ├── index.ts         # Main export file
│           ├── config/          # Shared configuration
│           ├── constants/       # Shared constants
│           ├── types/
│           │   └── client.ts    # TypeScript type definitions
│           └── utils/
│               ├── subdomain.ts # Subdomain generation logic
│               └── validation.ts # Shared validation functions
│
├── 📁 scripts/                  # Development and deployment scripts
│   ├── 🚀 Initialization Scripts
│   │   ├── init-all.sh          # Initialize entire project
│   │   ├── init-structure.sh    # Create project structure
│   │   ├── init-base-config.sh  # Basic configuration setup
│   │   ├── init-env-config.sh   # Environment configuration
│   │   ├── init-dev-tools.sh    # Development tools setup
│   │   ├── init-firebase.sh     # Firebase initialization
│   │   ├── init-docker.sh       # Docker setup
│   │   ├── init-module-creator.sh # Creator module setup
│   │   ├── init-module-pages.sh   # Pages module setup
│   │   └── init-module-shared.sh  # Shared module setup
│   │
│   ├── 🔧 Development Scripts
│   │   ├── start-local.sh       # Start local development (moved to root)
│   │   ├── stop-dev.sh          # Stop development services
│   │   ├── check-dev-status.sh  # Check development environment status
│   │   ├── firebase-dev-env.sh  # Firebase emulator environment
│   │   └── clean-deps.sh        # Clean dependencies
│   │
│   ├── 🚢 Deployment Scripts
│   │   ├── firebase-hosting-deploy.sh # Deploy to Firebase Hosting
│   │   ├── google-cloud-deploy.sh     # Deploy to Google Cloud
│   │   ├── update-cloudflare-dns.sh   # Update Cloudflare DNS
│   │   ├── sync-secrets.sh            # Sync single secret
│   │   └── sync-all-secrets.sh       # Sync all secrets
│   │
│   ├── 🔍 Utility Scripts
│   │   ├── check-cli-prerequisites.sh # Check required CLI tools
│   │   ├── check-tech-stack.sh        # Verify tech stack
│   │   └── yarn-quiet.sh              # Quiet yarn wrapper
│   │
│   └── 📁 lib/                  # Script library functions
│       ├── check-yarn-only.js   # Ensure yarn usage (not npm)
│       ├── colors.sh            # Terminal color utilities
│       ├── config.sh            # Configuration utilities
│       ├── connections.sh       # Connection checking utilities
│       ├── gcloud.sh            # Google Cloud utilities
│       ├── java.sh              # Java runtime utilities
│       ├── process-utils.sh     # Process management utilities
│       └── utils.sh             # General utilities
│
├── 📁 docs/                     # Project documentation
│   ├── 📋 Core Documentation
│   │   ├── 00-agentic-coding-axioms.md  # Development principles
│   │   ├── 03-tech-stack.md             # Technology stack overview
│   │   ├── tls-portal-overview.md       # Project overview
│   │   ├── tls-portal-setup-guide.md    # Setup instructions
│   │   ├── tls-portal-development-workflow.md # Dev workflow
│   │   ├── tls-portal-deployment.md     # Deployment guide
│   │   ├── production-readiness-checklist.md # Production checklist
│   │   ├── shell-scripts-guide.md       # Scripts documentation
│   │   ├── local-firebase-emulator-guide.md # Firebase emulator guide
│   │   └── client-types-and-firestore-guide.md # Data model guide
│   │
│   ├── 📁 archive/              # Archived documentation
│   │   ├── conversation-summary-2024-01-29-1620.md
│   │   ├── node-modules-analysis-original.md
│   │   └── project-structure-2025-05-29-archived.md
│   │
│   ├── 📁 features/             # Feature-specific documentation
│   │   └── portal-subdomain-generation.md # Subdomain feature docs
│   │
│   ├── 📁 integrations/         # Integration guides
│   │   └── claude-github-app.md # Claude GitHub app integration
│   │
│   └── 📁 testing/              # Testing documentation
│       ├── test-form.md         # Test form documentation
│       └── test-workflow.md     # Test workflow guide
│
├── 📁 refactoring/              # Refactoring guides and patterns
│   ├── 0.readme.md              # Refactoring overview
│   ├── 1.refactoring-guide.md   # Step-by-step guide
│   ├── 2.implementation-patterns.md # Code patterns
│   ├── 3.example-complex-refactor-archive.md # Examples
│   ├── 5.node-modules-guide.md  # Node modules management
│   └── project-status-roadmap.md # Project roadmap
│
├── 🧪 Test Files
│   ├── test-client-creation.js  # Client creation tests
│   ├── test-client-patterns.js  # Client pattern tests
│   └── test-frontend.sh         # Frontend testing script
│
├── 📊 Log Files (git-ignored in production)
│   ├── backend.log              # Backend service logs
│   ├── frontend.log             # Frontend service logs
│   ├── firebase.log             # Firebase logs
│   ├── firebase-emulators.log   # Firebase emulator logs
│   └── firestore-debug.log      # Firestore debug logs
│
└── 🔧 Utility Scripts (Root Level)
    ├── start-local.sh           # Main development startup script
    ├── npm                      # npm wrapper (enforces yarn)
    └── npx                      # npx wrapper (enforces yarn)
```

## Key Architectural Notes

### Monorepo Structure
- Uses Yarn Workspaces for managing multiple packages
- Three main packages: `creator` (backend), `pages` (frontend), `shared` (common code)
- Shared TypeScript types and utilities prevent code duplication

### Environment Management
- Centralized configuration in `/config` directory
- Separate dev and prod environment files
- Template files for easy setup

### Script Organization
- Comprehensive shell scripts for all operations
- Modular script library in `/scripts/lib`
- Clear separation between init, dev, and deployment scripts

### Documentation Structure
- Core docs in root of `/docs`
- Specialized subdirectories for archive, features, integrations, and testing
- Refactoring guides separate for focused improvement efforts

### Development Workflow
- Firebase emulators for local development
- Hot-reloading for both frontend and backend
- Comprehensive logging for debugging
# TLS Portal Project Structure


tls-portal/
├── config/       # environmental config files
│   ├── dev.env   # environmental var for development
│   ├── env.template  # environmental files templ
│   ├── prod.env      # environmental var for production 
│   └── secrets-values.template # secrets config templ
│
├── docs/         						   # project docs
│   ├── 00-agentic_coding_philosophy.md    # ai coding principles
│   ├── 00-project-overview.md             # project overview
│   ├── 01-setup.md                        # initial setup
│   ├── 02-development-guide.md            # development workflow
│   ├── 03-tech-stack.md                   # technology stack
│   ├── 04-environment-variables.md        # environmental var
│   ├── 05-deployment-strategy.md          # deployment strategy
│   ├── 06-subdomain-generation-guide.md   # subdomain generation
│   ├── 07-local-development-guide.md      # local development
│   ├── 08-script-development-guide.md     # scripts development
│   ├── 09-claude-github-app-guide.md      # CC-GitHub integr
│   ├── 10-node-modules-analysis.md        # node modules
│   ├── 11-project-ready-checklist.md      # project readiness
│   ├── 12-cloudflare-setup.md             # Cloudflare config
│   ├── conversation-summary-2024-01-29-1620.md 	# Other
│   ├── node-modules-analysis.md				 	# Other
│   ├── test-form.md								# Other
│   └── test-workflow.md							# Other
│
├── refactoring/                
│   ├── 0.readme.md                     # refactoring
│   ├── 1.refactoring-guide.md          # refactoring
│   ├── 2.implementation-patterns.md    # refactoring patterns
│   ├── 3.poorly-done-refactor example.md 	# what not to do
│   ├── node-modules-guide.md            	• move to docs
│   └── project-status-roadmap.md          	# Project roadmap
│
├── scripts/            			# build and deploy
│   ├── lib/            			# util library
│   │   ├── check-yarn-only.js      # Yarn enforcement
│   │   ├── colors.sh               # terminal color
│   │   ├── config.sh               # config
│   │   ├── connections.sh          # connection test
│   │   ├── gcloud.sh               # Google Cloud
│   │   ├── java.sh                 # Java
│   │   ├── process-utils.sh        # process management
│   │   └── utils.sh                # general
│   │
│   ├── check-cli-prerequisites.sh  # check CLI tools
│   ├── check-dev-status.sh         # check dev environment
│   ├── check-tech-stack.sh         # check tech stack install
│   ├── clean-deps.sh               # clean dependencies
│   ├── firebase-dev-env.sh         # start FB local dev env
│   ├── firebase-hosting-deploy.sh  # start FB hosting
│   ├── google-cloud-deploy.sh      # start Google Cloud deploy
│   ├── init-all.sh                 # start all modules
│   ├── init-base-config.sh         # start base config
│   ├── init-dev-tools.sh           # setup development tools
│   ├── init-docker.sh              # start Docker config
│   ├── init-env-config.sh          # setup environment config
│   ├── init-firebase.sh            # start Firebase
│   ├── init-module-creator.sh      # Setup creator module
│   ├── init-module-pages.sh        # Setup pages module
│   ├── init-module-shared.sh       # Setup shared module
│   ├── init-structure.sh           # Create project structure
│   ├── stop-dev.sh                 # Stop development servers
│   ├── sync-all-secrets.sh         # Sync all secrets
│   ├── sync-secrets.sh             # Sync specific secrets
│   ├── update-cloudflare-dns.sh    # Update Cloudflare DNS
│   └── yarn-quiet.sh               # Quiet yarn wrapper
│
├── src/                       		# src code (monorepo)
│   ├── creator/                    # backend API services
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── firebase.ts     # FB config
│   │   │   ├── controllers/
│   │   │   │   └── clientController.ts  # Client controller logic
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
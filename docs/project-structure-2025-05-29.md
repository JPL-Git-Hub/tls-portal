# TLS Portal Project Structure


tls-portal/
├── config/
│   ├── env.template            # Template for all .env files (shows required variables)
│   ├── dev.env                 # Development values (localhost, test APIs, debug=true)
│   ├── prod.env                # Production values (real URLs, live APIs, debug=false)
│   └── secrets-values.template # Template for managing secrets in Google Secrets Manager
│
├── docs/         						   
│   ├── 00-agentic_coding_philosophy.md    # ai coding principles
│   ├── 00-project-overview.md             # project overview
│   ├── 01-setup.md                        # initial setup
│   ├── 02-development-guide.md            # development workflow
│   ├── 03-tech-stack.md                   # technology stack
│   ├── 04-environment-variables.md        # config variables and secrets
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
│   │   │   │   └── firebase.ts     		# FB config
│   │   │   ├── controllers/
│   │   │   │   └── clientController.ts  	# client biz logic
│   │   │   ├── middleware/
│   │   │   │   └── errorHandler.ts  		# error handling
│   │   │   ├── routes/
│   │   │   │   └── clients.ts     # client API routes
│   │   │   ├── services/          # general biz logic
│   │   │   ├── utils/             # util functions
│   │   │   └── server.ts          # express server entry point
│   │   │
│   │   ├── nodemon.json           # Nodemon config
│   │   ├── package.json           # Creator module depend
│   │   ├── tsconfig.json          # TypeScript config
│   │   └── tsconfig.tsbuildinfo   # TypeScript build
│   │
│   ├── pages/                     # Frontend React appl
│   │   ├── public/                # Static assets
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── ClientIntakeForm.tsx   # Client intake form component
│   │   │   ├── hooks/                     # React custom hooks
│   │   │   ├── utils/                     # frontend util
│   │   │   ├── App.tsx                    # main app component
│   │   │   ├── index.css                  # global styles
│   │   │   └── main.tsx                   # react entry point
│   │   │
│   │   ├── index.html                     # HTML entry point
│   │   ├── package.json                   # Pages module depend
│   │   ├── postcss.config.js              # PostCSS config
│   │   ├── tailwind.config.js             # Tailwind CSS config
│   │   ├── test.html                      # Test HTML page
│   │   ├── tsconfig.json                  # TypeScript config
│   │   └── vite.config.ts                 # Vite build config
│   │
│   └── shared/                            # shared code btw mods
│       ├── src/
│       │   ├── config/                    # shared config
│       │   ├── constants/                 # shared constants
│       │   ├── types/
│       │   │   └── client.ts          	   # client type def'n
│       │   ├── utils/
│       │   │   ├── subdomain.ts           # subdomain util
│       │   │   └── validation.ts          # validation util
│       │   └── index.ts                   # shared mod export
│       │
│       ├── package.json                   # shared mod depend
│       ├── tsconfig.json                  # TypeScript config
│       └── tsconfig.tsbuildinfo           # TypeScript build
│
├── Dockerfile                     # Docker container config
├── firebase.json                  # Firebase project config
├── firestore.indexes.json         # Firestore database indexes
├── firestore.rules                # Firestore security rules
├── npm                            # npm wrapper script
├── npx                            # npx wrapper script
├── package.json                   # Root package.json (workspace)
├── readme.md                      # Project README
├── start-local.sh                 # Start local development
├── storage.rules                  # Firebase storage rules
├── test-client-creation.js        		# Client creation test
├── test-client-patterns.js             # Client patterns test
├── test-frontend.sh                    # Frontend test script
├── tsconfig.json                       # Root TypeScript config
└── yarn.lock                           # Yarn lock file

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
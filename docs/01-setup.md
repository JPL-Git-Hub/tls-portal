# TLS Portal Setup Guide

## ⚠️ Important: Use Yarn Only

This is a Yarn workspace monorepo. **Always use Yarn for package management:**
- ✅ `yarn install` - Install dependencies
- ✅ `yarn add <package>` - Add a package
- ✅ `yarn workspace @tls-portal/creator add <package>` - Add to specific workspace
- ❌ Never use `npm install` or `npm add`

The project includes safeguards to prevent accidental npm usage.

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd tls-portal

# 2. Check prerequisites
./scripts/check-cli-prerequisites.sh

# 3. Run complete setup
./scripts/init-all.sh

# 4. Start development
./scripts/start-dev.sh
```

## Prerequisites

### Required Software

1. **Node.js** (>= 18.0.0)
   - Download: https://nodejs.org
   - Or use nvm: `nvm install 18`

2. **Yarn Classic** (1.x)
   ```bash
   npm install -g yarn
   ```

3. **Git**
   - Should be pre-installed on most systems
   - Download: https://git-scm.com

### Optional Software

1. **Java** (>= 11) - Required for Firebase emulators
   - macOS: `brew install openjdk`
   - Others: https://adoptium.net

2. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Google Cloud SDK** - For deployment
   - Download: https://cloud.google.com/sdk

## Detailed Setup

### Step 1: Prerequisites Check

Run the prerequisites checker to ensure your system is ready:

```bash
./scripts/check-cli-prerequisites.sh
```

This will check all required and optional software and provide installation instructions for anything missing.

### Step 2: Complete Project Setup

Run the master initialization script:

```bash
./scripts/init-all.sh
```

This script runs through 9 phases:

1. **Prerequisites Check** - Verifies all required software
2. **Core Structure** - Creates directories and shared libraries
3. **Configuration** - Sets up TypeScript, ESLint, Git configs
4. **Module Setup** - Creates all workspace packages
5. **Firebase Config** - Sets up Firebase project files
6. **Initial Code** - Creates starter source files
7. **Dependencies** - Installs all npm packages
8. **Final Setup** - Creates .env file, sets permissions
9. **Validation** - Runs validation checks

### Step 3: Environment Configuration

1. Review and update `.env` file:
   ```bash
   # Edit with your favorite editor
   vim .env
   ```

2. Key variables to configure:
   - `FIREBASE_PROJECT_ID` - Your Firebase project ID
   - `JWT_SECRET` - Change for production
   - `ALLOWED_ORIGINS` - Update for your domains

### Step 4: Firebase Setup (Optional)

If you have Firebase CLI installed:

```bash
# Login to Firebase
firebase login

# Initialize Firebase features
firebase init

# Select:
# - Firestore
# - Emulators (Firestore, Auth)
# - Use existing project or create new
```

### Step 5: Java Configuration (For Emulators)

If Java is installed but not in PATH:

```bash
# macOS with Homebrew
echo 'export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## Development

### Start Development Servers

```bash
# Start all development services
./scripts/start-dev.sh

# Check service status
./scripts/check-dev-status.sh

# Stop all services (when done)
./scripts/stop-dev.sh
```

The emulator setup provides:
- Local Firestore database (port 8080)
- Local Auth service (port 9099)
- Local Storage (port 9199)
- Emulator UI at http://localhost:4000

This allows fast iteration without affecting production data.

### Available Scripts

- `yarn dev` - Start frontend and backend
- `yarn test` - Run tests
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier
- `yarn typecheck` - Check TypeScript types
- `yarn build` - Build for production
- `yarn docker:build` - Build Docker image
- `yarn docker:run` - Run Docker container

### Project Structure

```
tls-portal/
├── src/
│   ├── auth/        # Authentication service
│   ├── creator/     # API backend service
│   ├── forms/       # Form handling service
│   ├── pages/       # React frontend
│   ├── router/      # Routing service
│   └── shared/      # Shared utilities and types
├── scripts/
│   ├── lib/         # Shared script libraries
│   └── *.sh         # Setup and utility scripts
├── config/          # Configuration files
└── docs/           # Documentation
```

## Troubleshooting

### "Java not found" when starting emulators

1. Install Java:
   ```bash
   brew install openjdk  # macOS
   ```

2. Add to PATH:
   ```bash
   echo 'export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

### TypeScript errors with compression middleware

This is a known issue. The middleware is temporarily commented out in `src/creator/server.ts`.

### ESLint deprecation warnings

These are suppressed via `.yarnrc`. To see all warnings:
```bash
./scripts/check-warnings.sh --show-all
```

### Port already in use

Kill the process using the port:
```bash
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:3001 | xargs kill -9  # Backend
```

## Features

### Client Intake Form

The project includes a working client intake form with:
- Name, email, and phone validation
- Automatic subdomain generation (first 4 letters of last name + last 4 digits of phone)
- Firebase Firestore integration
- Multi-tenant support

Example subdomain generation:
- John Smith, (212) 555-1234 → `smit1234.thelawshop.com`
- Amy Li, (415) 555-0001 → `lixx0001.thelawshop.com`

## Required Before Production

### 1. Express Subdomain Package
The `express-subdomain` package must be installed for subdomain routing to work:
```bash
yarn workspace @tls-portal/creator add express-subdomain
```

### 2. Local Development SSL
SSL certificates are required for subdomain testing in local development:
```bash
# Install mkcert for local SSL certificates
brew install mkcert  # macOS
mkcert -install
mkcert "*.localhost" localhost
```

## Next Steps

1. **Add authentication** - Implement Firebase Auth
2. **Deploy to Cloud Run** - Set up CI/CD
3. **Add more forms** - Extend the form system
4. **Implement routing** - Install express-subdomain and configure
5. **Add tests** - Write unit and integration tests

## Support

- Check `docs/` for additional documentation
- Review scripts in `scripts/` for automation options
- See `config/yarn-suppressions.md` for warning management

## Deployment

For deployment to staging or production environments, see [05-deployment-strategy.md](05-deployment-strategy.md).
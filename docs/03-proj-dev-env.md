# Development Environment Setup

## Purpose
Initial development environment setup for new developers joining the TLS Portal project.

## Prerequisites
```bash
./scripts/check-cli-prerequisites.sh
```
This script will verify all required software and provide installation instructions for anything missing.

## Setup

Run the complete initialization:
```bash
./scripts/init-all.sh
```

This master script executes 9 phases:

1. **Prerequisites Check** - Verifies all required software
2. **Core Structure** - Creates directories and shared libraries
3. **Configuration** - Sets up TypeScript, ESLint, Git configs
4. **Module Setup** - Creates all workspace packages
5. **Firebase Config** - Sets up Firebase project files
6. **Initial Code** - Creates starter source files
7. **Dependencies** - Installs all npm packages
8. **Final Setup** - Creates .env file, sets permissions
9. **Validation** - Runs validation checks

## Claude GitHub App Setup

Install the Claude GitHub App for AI-powered code reviews:

```bash
# From the project root
cd tls-portal
/install-github-app
```

Configure GitHub repository:
```bash
# Set GitHub token from environment
export GH_TOKEN=$(gcloud secrets versions access latest --secret=github-token)

# Add remote if not already done
git remote add origin https://github.com/YOUR_USERNAME/tls-portal.git
```

The app will automatically:
- Review pull requests
- Provide security analysis
- Enforce code quality standards

## First Start

Start the development environment:
```bash
./scripts/start-dev.sh
```

This opens:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Firebase UI: http://localhost:4000

## Quick Test

1. Go to http://localhost:3000
2. Fill out the client form
3. Submit
4. Check Firebase UI for the data

## Done

Your development environment is ready. You can now start developing!
# TLS Portal Overview

Client portal system with automatic subdomain generation for law firms.

## What It Does

- Each client gets a unique subdomain (smit1234.portal.thelawshop.com)
- Clients fill out intake forms
- Law firm accesses client data securely
- Multi-tenant - each firm's data is isolated

## Architecture

Monorepo with 3 modules:
- `pages` - React frontend
- `creator` - Backend API
- `shared` - Shared types and utils

Deploys as single container to Google Cloud Run.

## Quick Start

```bash
./scripts/init-all.sh         # Setup
./scripts/firebase-dev-env.sh  # Run locally
```

## Important

**Use Yarn only**. Never use npm. The project blocks npm automatically.
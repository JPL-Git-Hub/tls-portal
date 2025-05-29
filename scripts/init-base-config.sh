#!/bin/bash
set -e

# Initialize base configuration files
# Creates root package.json, tsconfig.json, .yarnrc, and .gitignore

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source libraries
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

# Script marker for idempotency
marker="$project_root/$MARKER_DIR/base-config.done"

# Create root package.json
create_package_json() {
    local file="$project_root/package.json"
    
    if [ -f "$file" ]; then
        log_info "package.json already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
{
  "name": "tls-portal",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "src/*"
  ],
  "scripts": {
    "dev": "concurrently -n backend,frontend -c yellow,cyan \"yarn dev:backend\" \"yarn dev:frontend\"",
    "dev:backend": "yarn workspace @tls-portal/creator dev",
    "dev:frontend": "yarn workspace @tls-portal/pages dev",
    "dev:all": "concurrently -n auth,creator,forms,pages,router -c yellow,cyan,green,blue,magenta \"yarn workspace @tls-portal/auth dev\" \"yarn workspace @tls-portal/creator dev\" \"yarn workspace @tls-portal/forms dev\" \"yarn workspace @tls-portal/pages dev\" \"yarn workspace @tls-portal/router dev\"",
    "build": "yarn workspaces run build",
    "lint": "yarn workspaces run lint",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json}\"",
    "typecheck": "yarn workspaces run typecheck",
    "test": "yarn workspaces run test",
    "clean": "rm -rf node_modules src/*/node_modules src/*/dist",
    "emulators": "firebase emulators:start",
    "firebase:deploy": "firebase deploy",
    "docker:build": "docker build -t tls-portal .",
    "docker:run": "docker run -p 3001:3001 --env-file .env tls-portal"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "concurrently": "^8.2.0",
    "cross-env": "^7.0.3",
    "eslint": "^8.50.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.0.0",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "yarn": "1.x"
  }
}
EOF
    
    log_success "Created package.json"
}

# Create root tsconfig.json
create_tsconfig() {
    local file="$project_root/tsconfig.json"
    
    if [ -f "$file" ]; then
        log_info "tsconfig.json already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": false,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@tls-portal/*": ["src/*/src"]
    }
  },
  "exclude": ["node_modules", "dist", "build"]
}
EOF
    
    log_success "Created tsconfig.json"
}

# Create .yarnrc
create_yarnrc() {
    local file="$project_root/.yarnrc"
    
    if [ -f "$file" ]; then
        log_info ".yarnrc already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
# Yarn configuration for TLS Portal

# Suppress compatibility warnings
--install.ignore-engines true
--add.ignore-engines true

# Prevent timeout errors
network-timeout 600000

# Disable package-lock.json warning
--install.no-lockfile false

# Set registry
registry "https://registry.yarnpkg.com"
EOF
    
    log_success "Created .yarnrc"
}

# Create .gitignore
create_gitignore() {
    local file="$project_root/.gitignore"
    
    if [ -f "$file" ]; then
        log_info ".gitignore already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Production builds
dist/
build/
*.log

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log

# Docker
docker-compose.override.yml

# OS files
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp

# Lock files (except yarn.lock)
package-lock.json

# Initialization markers
.init/
EOF
    
    log_success "Created .gitignore"
}

# Main function
main() {
    section "Base Configuration Initialization"
    
    # Check if already completed
    if is_completed "$marker" && ! is_force "$@"; then
        log_warn "Base configuration already initialized. Use --force to recreate."
        return 0
    fi
    
    # Create configuration files
    create_package_json
    create_tsconfig
    create_yarnrc
    create_gitignore
    
    # Mark as completed
    mark_completed "$marker"
    
    log_success "Base configuration initialization completed!"
}

# Run main function
main "$@"
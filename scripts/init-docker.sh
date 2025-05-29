#!/bin/bash
set -e

# Initialize Docker configuration
# Creates Dockerfile and .dockerignore

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source libraries
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

# Script marker for idempotency
marker="$project_root/$MARKER_DIR/docker.done"

# Create Dockerfile
create_dockerfile() {
    local file="$project_root/Dockerfile"
    
    if [ -f "$file" ]; then
        log_info "Dockerfile already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
# Multi-stage Dockerfile for TLS Portal

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY src/*/package.json ./src/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build all packages
RUN yarn build

# Stage 2: Production stage
FROM node:18-alpine

# Install runtime dependencies
RUN apk add --no-cache tini

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY src/*/package.json ./src/

# Install production dependencies only
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Copy built files from builder
COPY --from=builder /app/src/*/dist ./src/

# Copy necessary files
COPY firebase.json ./
COPY firestore.rules ./
COPY storage.rules ./

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose backend port
EXPOSE 3001

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the backend server
CMD ["node", "src/creator/dist/index.js"]
EOF
    
    log_success "Created Dockerfile"
}

# Create .dockerignore
create_dockerignore() {
    local file="$project_root/.dockerignore"
    
    if [ -f "$file" ]; then
        log_info ".dockerignore already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
# Dependencies
node_modules/
**/node_modules/

# Build outputs (will be built in container)
dist/
**/dist/
build/
**/build/

# Development files
*.log
.env
.env.*
!.env.example

# IDE
.vscode/
.idea/
*.swp
*.swo

# Git
.git/
.gitignore

# Documentation
docs/
*.md

# Tests
coverage/
.nyc_output/
**/*.test.ts
**/*.spec.ts

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log

# OS files
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
.init/

# Archives
Archive/
EOF
    
    log_success "Created .dockerignore"
}

# Main function
main() {
    section "Docker Configuration Initialization"
    
    # Check if already completed
    if is_completed "$marker" && ! is_force "$@"; then
        log_warn "Docker configuration already initialized. Use --force to recreate."
        return 0
    fi
    
    # Create Docker files
    create_dockerfile
    create_dockerignore
    
    # Mark as completed
    mark_completed "$marker"
    
    log_success "Docker configuration initialization completed!"
}

# Run main function
main "$@"
#!/bin/bash
set -e

# Initialize environment configuration
# Creates environment templates and .env file

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source libraries
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

# Script marker for idempotency
marker="$project_root/$MARKER_DIR/env-config.done"

# Create environment template
create_env_template() {
    local file="$project_root/config/env.template"
    
    create_dir "$project_root/config"
    
    if [ -f "$file" ]; then
        log_info "env.template already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
# TLS Portal Environment Configuration Template
# Copy this file to .env and update with your values

# Node environment
NODE_ENV=development

# Server ports
PORT=3001
FRONTEND_PORT=3000

# Firebase configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com

# Firebase emulator configuration
USE_EMULATOR=true
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099

# API configuration
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# JWT configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Domain configuration
DOMAIN=thelawshop.com
SUBDOMAIN_PATTERN={subdomain}.thelawshop.com

# Feature flags
ENABLE_SIGNUP=true
ENABLE_EMULATORS=true

# Logging
LOG_LEVEL=debug
EOF
    
    log_success "Created env.template"
}

# Create development environment file
create_dev_env() {
    local file="$project_root/config/dev.env"
    
    if [ -f "$file" ]; then
        log_info "dev.env already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
# Development Environment Configuration
NODE_ENV=development
PORT=3001
FRONTEND_PORT=3000

# Firebase - Using emulators
USE_EMULATOR=true
FIREBASE_PROJECT_ID=tls-portal-dev
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099

# URLs
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Development JWT (not secure, for dev only)
JWT_SECRET=dev-secret-key-do-not-use-in-production
JWT_EXPIRES_IN=7d

# Domain
DOMAIN=localhost
SUBDOMAIN_PATTERN={subdomain}.localhost

# Features
ENABLE_SIGNUP=true
ENABLE_EMULATORS=true
LOG_LEVEL=debug
EOF
    
    log_success "Created dev.env"
}

# Create .env from template
create_dotenv() {
    local template="$project_root/config/dev.env"
    local target="$project_root/.env"
    
    if [ -f "$target" ]; then
        log_info ".env already exists, skipping"
        return 0
    fi
    
    if [ -f "$template" ]; then
        cp "$template" "$target"
        log_success "Created .env from dev.env"
    else
        log_warn "dev.env not found, please create .env manually"
    fi
}

# Create secrets template
create_secrets_template() {
    local file="$project_root/config/secrets-values.template"
    
    if [ -f "$file" ]; then
        log_info "secrets-values.template already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
# Google Secrets Manager Values Template
# These values should be stored in Google Secrets Manager for production

# Firebase Service Account (JSON format)
FIREBASE_SERVICE_ACCOUNT={
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk@your-project-id.iam.gserviceaccount.com",
  "client_id": "client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40your-project-id.iam.gserviceaccount.com"
}

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-production-jwt-secret

# API Keys (if needed)
SENDGRID_API_KEY=your-sendgrid-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# Database URLs (if not using Firebase)
DATABASE_URL=your-database-connection-string

# Third-party service credentials
CLOUDFLARE_API_TOKEN=your-cloudflare-token
EOF
    
    log_success "Created secrets-values.template"
}

# Main function
main() {
    section "Environment Configuration Initialization"
    
    # Check if already completed
    if is_completed "$marker" && ! is_force "$@"; then
        log_warn "Environment configuration already initialized. Use --force to recreate."
        return 0
    fi
    
    # Create configuration files
    create_env_template
    create_dev_env
    create_dotenv
    create_secrets_template
    
    # Mark as completed
    mark_completed "$marker"
    
    log_success "Environment configuration initialization completed!"
    
    # Show reminder
    echo
    log_warn "Remember to update .env with your actual configuration values!"
}

# Run main function
main "$@"
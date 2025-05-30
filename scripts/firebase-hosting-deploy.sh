#!/bin/bash
set -e

# Deploy frontend to Firebase Hosting
# Simple deployment for static hosting

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"
source "$script_dir/lib/secrets-hook.sh"

# Check secrets before deployment
check_secrets "deploy" || die "Missing required secrets"

PROJECT_ID="$DEFAULT_FIREBASE_PROJECT"

section "Firebase Hosting Deployment"

# Build frontend
log_info "Building frontend..."
cd "$project_root/src/pages"
yarn build || die "Frontend build failed"

# Deploy to Firebase Hosting
log_info "Deploying to Firebase Hosting..."
cd "$project_root"
# Use non-interactive mode to force service account usage
firebase deploy --only hosting --project $PROJECT_ID --non-interactive || die "Firebase deploy failed"

log_success "Frontend deployed to Firebase Hosting"
log_info "View at: https://$PROJECT_ID.web.app"
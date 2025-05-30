#!/bin/bash
set -e

# Deploy frontend to Firebase Hosting
# Simple deployment for static hosting

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"

source "$script_dir/lib/config.sh"

PROJECT_ID="$DEFAULT_FIREBASE_PROJECT"

section "Firebase Hosting Deployment"

# Build frontend
log_info "Building frontend..."
cd "$project_root/src/pages"
yarn build || die "Frontend build failed"

# Deploy to Firebase Hosting
log_info "Deploying to Firebase Hosting..."
cd "$project_root"
firebase deploy --only hosting --project $PROJECT_ID || die "Firebase deploy failed"

log_success "Frontend deployed to Firebase Hosting"
log_info "View at: https://$PROJECT_ID.web.app"
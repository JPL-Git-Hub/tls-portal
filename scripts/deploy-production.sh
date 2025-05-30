#!/bin/bash
set -e

# Production deployment script for TLS Portal
# Handles build, deployment, and post-deployment tasks

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"
source "$script_dir/lib/secrets-manager.sh"
source "$script_dir/lib/secrets-hook.sh"

section "Production Deployment"

# Check for required secrets (now checks Google Secrets Manager first)
log_info "Checking deployment prerequisites..."
check_secrets "deploy" || die "Missing required secrets for deployment"

# Environment setup
export NODE_ENV=production
# GOOGLE_APPLICATION_CREDENTIALS already set by load_firebase_service_account

# Build the frontend
section "Building Frontend"
cd "$project_root/src/pages"
log_info "Installing dependencies..."
yarn install --frozen-lockfile

log_info "Running production build..."
yarn build

# Verify build output
if [ ! -d "$project_root/src/pages/dist" ]; then
    die "Build failed - dist directory not found"
fi

# Deploy Firebase Functions
section "Deploying Firebase Functions"
cd "$project_root"
log_info "Building functions..."
cd functions
npm install --production
cd ..

log_info "Deploying functions to production..."
firebase deploy --only functions --project "$DEFAULT_FIREBASE_PROJECT"

# Deploy Firestore rules and indexes
section "Deploying Firestore Configuration"
log_info "Deploying Firestore rules..."
firebase deploy --only firestore:rules --project "$DEFAULT_FIREBASE_PROJECT"

log_info "Deploying Firestore indexes..."
firebase deploy --only firestore:indexes --project "$DEFAULT_FIREBASE_PROJECT"

# Deploy Storage rules
log_info "Deploying Storage rules..."
firebase deploy --only storage --project "$DEFAULT_FIREBASE_PROJECT"

# Deploy to Firebase Hosting
section "Deploying to Firebase Hosting"
log_info "Deploying frontend to Firebase Hosting..."
firebase deploy --only hosting --project "$DEFAULT_FIREBASE_PROJECT"

# Post-deployment tasks
section "Post-Deployment Tasks"

# Clear Cloudflare cache if configured
if [ -f "$project_root/config/.secrets/cloudflare.env" ]; then
    log_info "Clearing Cloudflare cache..."
    if [ -f "$script_dir/purge-cloudflare-cache.sh" ]; then
        "$script_dir/purge-cloudflare-cache.sh" all
    else
        log_warn "Cache purge script not found"
    fi
fi

# Verify deployment
log_info "Verifying deployment..."
deployment_url="https://$DEFAULT_FIREBASE_PROJECT.web.app"
if curl -s -o /dev/null -w "%{http_code}" "$deployment_url" | grep -q "200"; then
    log_success "Site is accessible at $deployment_url"
else
    log_warn "Site may not be fully deployed yet. Check in a few minutes."
fi

# Summary
section "Deployment Summary"
log_success "Production deployment completed!"
echo ""
echo "🌐 Main site: https://thelawshop.com"
echo "🔥 Firebase hosting: $deployment_url"
echo "📊 Firebase console: https://console.firebase.google.com/project/$DEFAULT_FIREBASE_PROJECT"
echo ""
echo "Next steps:"
echo "1. Verify all functionality on production"
echo "2. Check Firebase Functions logs for any errors"
echo "3. Monitor performance and error rates"
echo "4. Update DNS if needed"

# Create deployment record
deployment_file="$project_root/.deployments/$(date +%Y%m%d_%H%M%S).json"
mkdir -p "$project_root/.deployments"
cat > "$deployment_file" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "production",
  "project": "$DEFAULT_FIREBASE_PROJECT",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "deployed_by": "$(whoami)",
  "frontend_url": "$deployment_url",
  "main_domain": "https://thelawshop.com"
}
EOF

log_info "Deployment record saved to $deployment_file"
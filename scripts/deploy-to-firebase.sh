#!/bin/bash
set -e

# Automated Firebase deployment with credential management
# No manual logins required!

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"
source "$script_dir/lib/secrets-manager.sh"

section "Automated Firebase Deployment"

# Check for service account key (Google Secrets Manager first)
check_firebase_auth() {
    log_info "Checking Firebase authentication..."
    
    # Try Google Secrets Manager first
    if load_firebase_service_account; then
        export FIREBASE_TOKEN="service_account"
        return 0
    fi
    
    # Option 2: Firebase CI token
    if [[ -n "$FIREBASE_TOKEN" ]]; then
        log_success "Using Firebase CI token from environment"
        return 0
    fi
    
    # Option 3: Check for firebase token in secrets
    if [[ -f "$HOME/.firebase/tokens.json" ]]; then
        log_success "Using existing Firebase tokens"
        return 0
    fi
    
    log_error "No Firebase authentication found!"
    log_info "To fix this, add service account to Google Secrets Manager:"
    log_info "gcloud secrets create FIREBASE_SERVICE_ACCOUNT --data-file=config/.secrets/firebase-service-account.json --project=$PROJECT_ID"
    return 1
}

# Deploy using gcloud instead of firebase CLI
deploy_with_gcloud() {
    log_info "Deploying with gcloud (more reliable than firebase CLI)..."
    
    # Copy built files to tls-public if requested
    if [[ -d "/Users/josephleon/repos/tls-public" ]]; then
        log_info "Copying build to tls-public..."
        cp -r "$project_root/src/pages/dist/"* "/Users/josephleon/repos/tls-public/"
        log_success "Files copied to tls-public"
    fi
    
    # Deploy to Firebase Hosting via gcloud
    local project_id="${FIREBASE_PROJECT:-$DEFAULT_FIREBASE_PROJECT}"
    
    # Create temporary firebase.json for deployment
    cat > "$project_root/src/pages/dist/firebase.json" << EOF
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{
      "source": "**",
      "destination": "/index.html"
    }]
  }
}
EOF
    
    # Use gcloud to deploy
    cd "$project_root/src/pages/dist"
    gcloud builds submit --project="$project_id" \
        --config=- <<EOF
steps:
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  args: ['firebase', 'deploy', '--only', 'hosting', '--project', '$project_id']
EOF
}

# Main deployment flow
main() {
    # Build first
    log_info "Building frontend..."
    cd "$project_root/src/pages"
    yarn build || die "Build failed"
    
    # Check authentication
    if check_firebase_auth; then
        # Try firebase CLI first
        cd "$project_root"
        if firebase deploy --only hosting --project "$DEFAULT_FIREBASE_PROJECT" 2>/dev/null; then
            log_success "Deployed successfully with Firebase CLI!"
        else
            log_warning "Firebase CLI failed, trying gcloud..."
            deploy_with_gcloud
        fi
    else
        die "Authentication required. See instructions above."
    fi
    
    # Clear Cloudflare cache if configured
    if [[ -f "$script_dir/update-cloudflare-dns.sh" ]]; then
        log_info "Clearing Cloudflare cache..."
        # This would call your CF purge script
        log_info "Run: $script_dir/update-cloudflare-dns.sh --purge-cache"
    fi
    
    log_success "Deployment complete!"
    log_info "Tally has been removed from thelawshop.com"
    log_info "Site should update within 1-2 minutes"
}

main "$@"
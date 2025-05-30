#!/bin/bash
set -e

# Sync ALL secrets between .env and Google Secrets Manager
# Ensures GitHub Actions has everything it needs

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

PROJECT_ID="$DEFAULT_FIREBASE_PROJECT"

section "Syncing All Secrets"

# List of all secrets that should be in Google Secrets Manager
REQUIRED_SECRETS=(
    "FIREBASE_PROJECT_ID"
    "FIREBASE_SERVICE_ACCOUNT"
    "JWT_SECRET"
    "Cloudflare_DNS_API_Token"
    "CLOUDFLARE_ZONE_ID"
    "github-token"
)

# Check and sync each secret
for secret in "${REQUIRED_SECRETS[@]}"; do
    # Check if secret exists in Google Secrets Manager
    if gcloud secrets describe "$secret" --project="$PROJECT_ID" >/dev/null 2>&1; then
        log_success "✓ $secret exists"
    else
        log_warn "✗ $secret missing"
        
        # Try to get from .env
        if [ -f "$project_root/.env" ] && grep -q "^$secret=" "$project_root/.env"; then
            value=$(grep "^$secret=" "$project_root/.env" | cut -d'=' -f2-)
            echo -n "$value" | gcloud secrets create "$secret" \
                --data-file=- --project="$PROJECT_ID"
            log_success "Created $secret from .env"
        else
            log_error "Cannot find $secret in .env - manual setup required"
        fi
    fi
done

# Special handling for Cloudflare Zone ID - auto-fetch if needed
if ! gcloud secrets describe "CLOUDFLARE_ZONE_ID" --project="$PROJECT_ID" >/dev/null 2>&1; then
    log_info "Fetching Cloudflare Zone ID..."
    
    API_TOKEN=$(gcloud secrets versions access latest \
        --secret="Cloudflare_DNS_API_Token" --project="$PROJECT_ID")
    
    if [ -n "$API_TOKEN" ]; then
        ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=thelawshop.com" \
            -H "Authorization: Bearer $API_TOKEN" | jq -r '.result[0].id')
        
        if [ -n "$ZONE_ID" ]; then
            echo -n "$ZONE_ID" | gcloud secrets create "CLOUDFLARE_ZONE_ID" \
                --data-file=- --project="$PROJECT_ID"
            log_success "Auto-fetched and saved Cloudflare Zone ID"
        fi
    fi
fi

log_success "Secret sync complete!"

# Show what GitHub needs
echo
section "GitHub Actions Setup"
echo "Add these secrets to GitHub (Settings → Secrets → Actions):"
echo
echo "1. GCP_SA_KEY - Run this command:"
echo "   gcloud secrets versions access latest --secret=gcp-service-account | \\"
echo "   GH_TOKEN=\$(gcloud secrets versions access latest --secret=github-token) \\"
echo "   gh secret set GCP_SA_KEY --repo JPL-Git-Hub/tls-portal"
echo
echo "That's it! Everything else pulls from Google Secrets Manager automatically."
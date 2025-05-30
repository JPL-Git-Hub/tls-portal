#!/bin/bash
set -e

# Check status of all secrets in Google Secrets Manager

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"
source "$script_dir/lib/secrets-manager.sh"

section "Secret Status Check"

# List of expected secrets
declare -a expected_secrets=(
    "FIREBASE_SERVICE_ACCOUNT"
    "CLOUDFLARE_API_TOKEN"
    "CLOUDFLARE_ZONE_ID"
    "STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "GWS_SENDER_EMAIL"
    "SENDGRID_API_KEY"
    "JWT_SECRET"
)

# Check each secret
log_info "Checking secrets in Google Secrets Manager..."
echo ""

found_count=0
missing_count=0

for secret in "${expected_secrets[@]}"; do
    if secret_exists "$secret"; then
        echo "✅ $secret - Found in Secrets Manager"
        ((found_count++))
    else
        echo "❌ $secret - Not found"
        ((missing_count++))
    fi
done

echo ""
section "Summary"
echo "Found: $found_count secrets"
echo "Missing: $missing_count secrets"

if [ $missing_count -gt 0 ]; then
    echo ""
    log_warn "To add missing secrets:"
    echo ""
    
    # Provide specific guidance for each type
    if ! secret_exists "FIREBASE_SERVICE_ACCOUNT"; then
        echo "# Firebase Service Account:"
        echo "gcloud secrets create FIREBASE_SERVICE_ACCOUNT \\"
        echo "  --data-file=config/.secrets/firebase-service-account.json \\"
        echo "  --project=$PROJECT_ID"
        echo ""
    fi
    
    if ! secret_exists "CLOUDFLARE_API_TOKEN" || ! secret_exists "CLOUDFLARE_ZONE_ID"; then
        echo "# Cloudflare:"
        echo "echo -n 'your-api-token' | gcloud secrets create CLOUDFLARE_API_TOKEN --data-file=- --project=$PROJECT_ID"
        echo "echo -n 'your-zone-id' | gcloud secrets create CLOUDFLARE_ZONE_ID --data-file=- --project=$PROJECT_ID"
        echo ""
    fi
    
    if ! secret_exists "STRIPE_SECRET_KEY" || ! secret_exists "STRIPE_PUBLISHABLE_KEY"; then
        echo "# Stripe:"
        echo "echo -n 'sk_live_...' | gcloud secrets create STRIPE_SECRET_KEY --data-file=- --project=$PROJECT_ID"
        echo "echo -n 'pk_live_...' | gcloud secrets create STRIPE_PUBLISHABLE_KEY --data-file=- --project=$PROJECT_ID"
        echo "echo -n 'whsec_...' | gcloud secrets create STRIPE_WEBHOOK_SECRET --data-file=- --project=$PROJECT_ID"
        echo ""
    fi
fi

# Also check for local secrets
echo ""
section "Local Secret Files"

local_files=(
    "config/.secrets/firebase-service-account.json"
    "config/.secrets/cloudflare.env"
    "config/.secrets/stripe-keys.env"
    "config/.secrets/gws-email.env"
)

for file in "${local_files[@]}"; do
    if [ -f "$project_root/$file" ]; then
        echo "📁 $file - Present (can be migrated to Secrets Manager)"
    else
        echo "⚠️  $file - Not found"
    fi
done

echo ""
log_info "Tip: Run './scripts/sync-secrets.sh push' to upload local secrets to Google Secrets Manager"
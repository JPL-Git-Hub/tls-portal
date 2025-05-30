#!/bin/bash
# Automatic secrets checker - triggered before any operation needing secrets
# Now checks Google Secrets Manager FIRST before local files

# Source required libraries
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/../.." && pwd)"

# Source secrets manager functions
if [[ -f "$script_dir/secrets-manager.sh" ]]; then
    source "$script_dir/secrets-manager.sh"
fi

# Source the meta script for AI introspection if available
if [[ -f "$script_dir/secrets-meta.sh" ]]; then
    source "$script_dir/secrets-meta.sh"
fi

# Standard secret locations with consistent naming
SECRET_LOCATION_GOOGLE="config/.secrets/firebase-service-account.json"
SECRET_LOCATION_FIREBASE_SA="config/.secrets/firebase-service-account.json"
SECRET_LOCATION_FIREBASE_ADMIN="config/.secrets/firebase-admin-sa.json"
SECRET_LOCATION_STRIPE="config/.secrets/stripe-keys.env"
SECRET_LOCATION_CLOUDFLARE="config/.secrets/cloudflare-keys.env"

# Check for secrets before operations
check_secrets() {
    local operation="${1:-general}"
    local missing_secrets=()
    
    echo "🔍 Checking secrets for: $operation"
    
    case "$operation" in
        "deploy"|"firebase")
            # Try Google Secrets Manager first
            if ! load_firebase_service_account; then
                missing_secrets+=("FIREBASE_SERVICE_ACCOUNT")
            fi
            ;;
            
        "stripe"|"billing")
            # Try Google Secrets Manager first
            if ! load_stripe_secrets; then
                missing_secrets+=("STRIPE_SECRET_KEY")
            fi
            ;;
            
        "cloudflare"|"dns")
            # Try Google Secrets Manager first
            if ! load_cloudflare_secrets; then
                missing_secrets+=("CLOUDFLARE_API_TOKEN")
            fi
            ;;
    esac
    
    # Check general env files
    if [[ ! -f "config/dev.env" ]] && [[ ! -f "config/prod.env" ]]; then
        missing_secrets+=("Environment config (dev.env or prod.env)")
    fi
    
    # Report missing secrets with AI introspection
    if [[ ${#missing_secrets[@]} -gt 0 ]]; then
        echo "❌ Missing required secrets:"
        for secret in "${missing_secrets[@]}"; do
            echo "   - $secret"
            # AI Introspection: Show exact location for each secret
            if type get_secret_location >/dev/null 2>&1; then
                location=$(get_secret_location "$secret")
                [[ -n "$location" ]] && echo "     $location"
            fi
        done
        echo ""
        echo "📋 Quick fix guide:"
        case "$operation" in
            "deploy"|"firebase")
                echo "   Download service account from Firebase Console > Project Settings"
                echo "   Save to: config/.secrets/firebase-service-account.json"
                ;;
            "stripe"|"billing")
                echo "   Get keys from Stripe Dashboard > API Keys"
                echo "   Create: config/.secrets/stripe-keys.env with:"
                echo "     STRIPE_SECRET_KEY=sk_test_..."
                echo "     STRIPE_PUBLISHABLE_KEY=pk_test_..."
                ;;
            "cloudflare"|"dns")
                echo "   Get token from Cloudflare > My Profile > API Tokens"
                echo "   Create: config/.secrets/cloudflare.env with:"
                echo "     CLOUDFLARE_API_TOKEN=..."
                echo "     CLOUDFLARE_ZONE_ID=..."
                ;;
        esac
        return 1
    fi
    
    echo "✅ All required secrets found!"
    return 0
}

# Auto-source this in other scripts
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
    # Being sourced - set up the hook
    export -f check_secrets
fi
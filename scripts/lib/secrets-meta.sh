#!/bin/bash
# Meta-script for AI secret introspection
# This file helps AI assistants understand where secrets live

# Secret location mapping for AI reference
declare -A SECRET_LOCATIONS=(
    # Firebase
    ["GOOGLE_APPLICATION_CREDENTIALS"]="/config/.secrets/firebase-service-account.json"
    ["FIREBASE_SERVICE_ACCOUNT"]="/config/.secrets/firebase-service-account.json"
    ["FIREBASE_ADMIN_SDK"]="/config/.secrets/firebase-admin-sa.json"
    
    # Stripe
    ["STRIPE_SECRET_KEY"]="/config/.secrets/stripe-keys.env"
    ["STRIPE_PUBLISHABLE_KEY"]="/config/.secrets/stripe-keys.env"
    ["STRIPE_WEBHOOK_SECRET"]="/config/.secrets/stripe-keys.env"
    
    # Cloudflare
    ["CLOUDFLARE_API_TOKEN"]="/config/.secrets/cloudflare.env"
    ["CLOUDFLARE_ZONE_ID"]="/config/.secrets/cloudflare.env"
    
    # Email
    ["SENDGRID_API_KEY"]="/config/.secrets/sendgrid.env"
    
    # Authentication
    ["JWT_SECRET"]="/config/.secrets/jwt-secret.env"
    
    # Frontend Config (Public keys)
    ["VITE_FIREBASE_API_KEY"]="/src/pages/.env"
    ["VITE_FIREBASE_PROJECT_ID"]="/src/pages/.env"
)

# Function to guide AI on secret location
get_secret_location() {
    local secret_name="$1"
    local location="${SECRET_LOCATIONS[$secret_name]}"
    
    if [[ -n "$location" ]]; then
        echo "Secret '$secret_name' should be in: $location"
    else
        echo "Unknown secret. Check /config/env.template for all secrets."
    fi
}

# Function to check if a secret file exists
secret_exists() {
    local secret_name="$1"
    local location="${SECRET_LOCATIONS[$secret_name]}"
    
    if [[ -n "$location" ]] && [[ -f "$PROJECT_ROOT$location" ]]; then
        return 0
    else
        return 1
    fi
}

# AI Helper: List all expected secret locations
list_all_secret_locations() {
    echo "=== TLS Portal Secret Locations ==="
    echo ""
    echo "Production Secrets (/config/.secrets/):"
    echo "  - firebase-service-account.json : Firebase admin credentials"
    echo "  - stripe-keys.env              : Stripe API keys"
    echo "  - cloudflare.env               : Cloudflare API credentials"
    echo "  - sendgrid.env                 : SendGrid email API key"
    echo "  - jwt-secret.env               : Production JWT secret"
    echo ""
    echo "Development Secrets:"
    echo "  - .env                         : Local development variables"
    echo "  - /src/pages/.env              : Frontend Firebase config"
    echo ""
    echo "Templates (for reference):"
    echo "  - /config/env.template         : All environment variables"
    echo "  - /config/secrets-values.template : Google Secrets Manager format"
    echo ""
}

# Export for use in other scripts
export -f get_secret_location
export -f secret_exists
export -f list_all_secret_locations
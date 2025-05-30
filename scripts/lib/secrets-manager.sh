#!/bin/bash
# Shared library for fetching secrets using gcloud secrets
# Sources secrets from gcloud secrets first, falls back to local files

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-${DEFAULT_FIREBASE_PROJECT:-the-law-shop-457607}}"

# Function to check if a secret exists in gcloud secrets
secret_exists() {
    local secret_name="$1"
    gcloud secrets describe "$secret_name" --project="$PROJECT_ID" >/dev/null 2>&1
}

# Function to fetch a secret from gcloud secrets
fetch_secret() {
    local secret_name="$1"
    if secret_exists "$secret_name"; then
        gcloud secrets versions access latest --secret="$secret_name" --project="$PROJECT_ID" 2>/dev/null
    else
        return 1
    fi
}

# Function to fetch or create a secret
fetch_or_guide_secret() {
    local secret_name="$1"
    local description="$2"
    
    if secret_exists "$secret_name"; then
        fetch_secret "$secret_name"
    else
        log_warn "Secret '$secret_name' not found in gcloud secrets"
        log_info "To add: echo -n 'your-$description' | gcloud secrets create $secret_name --data-file=- --project=$PROJECT_ID"
        return 1
    fi
}

# Function to load multiple secrets as environment variables
load_secrets_from_manager() {
    local secrets=("$@")
    local found_all=true
    
    for secret in "${secrets[@]}"; do
        if secret_exists "$secret"; then
            local value=$(fetch_secret "$secret")
            if [ -n "$value" ]; then
                export "$secret=$value"
                log_success "Loaded $secret from gcloud secrets"
            fi
        else
            log_warn "$secret not found in gcloud secrets"
            found_all=false
        fi
    done
    
    return $([ "$found_all" = true ] && echo 0 || echo 1)
}

# Function to check and load Cloudflare secrets
load_cloudflare_secrets() {
    log_info "Checking gcloud secrets list for Cloudflare credentials..."
    
    if load_secrets_from_manager "CLOUDFLARE_API_TOKEN" "CLOUDFLARE_ZONE_ID"; then
        return 0
    elif [ -f "$project_root/config/.secrets/cloudflare.env" ]; then
        log_info "Falling back to local cloudflare.env"
        source "$project_root/config/.secrets/cloudflare.env"
        return 0
    else
        log_error "No Cloudflare credentials found"
        log_info "Add to gcloud secrets:"
        log_info "  echo -n 'your-token' | gcloud secrets create CLOUDFLARE_API_TOKEN --data-file=- --project=$PROJECT_ID"
        log_info "  echo -n 'your-zone-id' | gcloud secrets create CLOUDFLARE_ZONE_ID --data-file=- --project=$PROJECT_ID"
        return 1
    fi
}

# Function to check and load Stripe secrets
load_stripe_secrets() {
    log_info "Checking gcloud secrets list for Stripe credentials..."
    
    if load_secrets_from_manager "STRIPE_SECRET_KEY" "STRIPE_PUBLISHABLE_KEY" "STRIPE_WEBHOOK_SECRET"; then
        return 0
    elif [ -f "$project_root/config/.secrets/stripe-keys.env" ]; then
        log_info "Falling back to local stripe-keys.env"
        source "$project_root/config/.secrets/stripe-keys.env"
        return 0
    else
        log_error "No Stripe credentials found"
        log_info "Add to gcloud secrets:"
        log_info "  echo -n 'sk_live_...' | gcloud secrets create STRIPE_SECRET_KEY --data-file=- --project=$PROJECT_ID"
        log_info "  echo -n 'pk_live_...' | gcloud secrets create STRIPE_PUBLISHABLE_KEY --data-file=- --project=$PROJECT_ID"
        return 1
    fi
}

# Function to check and load Firebase service account
load_firebase_service_account() {
    log_info "Checking gcloud secrets for Firebase service account..."
    
    # Try to get the service account JSON from gcloud secrets
    if secret_exists "FIREBASE_SERVICE_ACCOUNT"; then
        local sa_json=$(fetch_secret "FIREBASE_SERVICE_ACCOUNT")
        if [ -n "$sa_json" ]; then
            # Write to temporary file for this session
            local temp_sa_file="/tmp/firebase-sa-$$.json"
            echo "$sa_json" > "$temp_sa_file"
            export GOOGLE_APPLICATION_CREDENTIALS="$temp_sa_file"
            log_success "Loaded Firebase service account from gcloud secrets"
            
            # Clean up on exit
            trap "rm -f $temp_sa_file" EXIT
            return 0
        fi
    fi
    
    # Fall back to local file
    if [ -f "$project_root/config/.secrets/firebase-service-account.json" ]; then
        export GOOGLE_APPLICATION_CREDENTIALS="$project_root/config/.secrets/firebase-service-account.json"
        log_info "Using local Firebase service account"
        return 0
    fi
    
    log_error "No Firebase service account found"
    log_info "Add to gcloud secrets:"
    log_info "  gcloud secrets create FIREBASE_SERVICE_ACCOUNT --data-file=config/.secrets/firebase-service-account.json --project=$PROJECT_ID"
    return 1
}

# Function to check and load email secrets
load_email_secrets() {
    log_info "Checking gcloud secrets for email credentials..."
    
    if load_secrets_from_manager "GWS_SENDER_EMAIL" "SENDGRID_API_KEY"; then
        return 0
    elif [ -f "$project_root/config/.secrets/gws-email.env" ]; then
        log_info "Falling back to local email config"
        source "$project_root/config/.secrets/gws-email.env"
        return 0
    else
        log_warn "No email credentials found in gcloud secrets"
        return 1
    fi
}

# Function to load JWT secret
load_jwt_secret() {
    log_info "Checking gcloud secrets for JWT secret..."
    
    if secret_exists "JWT_SECRET"; then
        export JWT_SECRET=$(fetch_secret "JWT_SECRET")
        log_success "Loaded JWT secret from gcloud secrets"
        return 0
    else
        # Generate one if not exists
        log_warn "JWT_SECRET not found, generating new one"
        local new_secret=$(openssl rand -base64 32)
        echo -n "$new_secret" | gcloud secrets create JWT_SECRET --data-file=- --project="$PROJECT_ID" 2>/dev/null
        export JWT_SECRET="$new_secret"
        return 0
    fi
}
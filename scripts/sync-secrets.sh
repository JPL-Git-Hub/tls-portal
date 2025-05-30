#!/bin/bash
set -e

# Sync secrets between local .env and Google Secrets Manager
# Simple approach following agentic coding principles

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

PROJECT_ID="$DEFAULT_FIREBASE_PROJECT"

# Usage
usage() {
    echo "Usage: $0 [push|pull]"
    echo "  push - Upload local secrets to Google Secrets Manager"
    echo "  pull - Download secrets from Google Secrets Manager to local"
    exit 1
}

# Push secrets to Google Secrets Manager
push_secrets() {
    section "Pushing Secrets to Google Secrets Manager"
    
    # Check if .env exists
    if [ ! -f "$project_root/.env" ]; then
        die ".env file not found"
    fi
    
    # Read secrets from both .env and secrets template
    if [ ! -f "$project_root/config/secrets-values.template" ]; then
        log_warn "config/secrets-values.template not found, using .env only"
    fi
    
    # Get list of secret keys from template
    while IFS= read -r line; do
        # Skip comments and empty lines
        [[ "$line" =~ ^#.*$ ]] || [[ -z "$line" ]] && continue
        
        # Extract key name (before = sign)
        key=$(echo "$line" | cut -d'=' -f1 | tr -d ' ')
        
        # Get value from .env
        if grep -q "^$key=" "$project_root/.env"; then
            value=$(grep "^$key=" "$project_root/.env" | cut -d'=' -f2-)
            
            # Create or update secret
            log_info "Updating secret: $key"
            echo -n "$value" | gcloud secrets create "$key" \
                --data-file=- \
                --project="$PROJECT_ID" \
                2>/dev/null || \
            echo -n "$value" | gcloud secrets versions add "$key" \
                --data-file=- \
                --project="$PROJECT_ID"
        else
            log_warn "Secret $key not found in .env, skipping"
        fi
    done < "$project_root/config/secrets-values.template"
    
    log_success "Secrets pushed successfully"
}

# Pull secrets from Google Secrets Manager
pull_secrets() {
    section "Pulling Secrets from Google Secrets Manager"
    
    # Backup existing .env
    if [ -f "$project_root/.env" ]; then
        cp "$project_root/.env" "$project_root/.env.backup"
        log_info "Backed up .env to .env.backup"
    fi
    
    # Start with dev.env as base
    cp "$project_root/config/dev.env" "$project_root/.env"
    
    # Read secrets from template and fetch from Secrets Manager
    while IFS= read -r line; do
        # Skip comments and empty lines
        [[ "$line" =~ ^#.*$ ]] || [[ -z "$line" ]] && continue
        
        # Extract key name
        key=$(echo "$line" | cut -d'=' -f1 | tr -d ' ')
        
        # Try to get secret from Google Secrets Manager
        if gcloud secrets describe "$key" --project="$PROJECT_ID" >/dev/null 2>&1; then
            log_info "Fetching secret: $key"
            value=$(gcloud secrets versions access latest \
                --secret="$key" \
                --project="$PROJECT_ID" 2>/dev/null)
            
            # Update .env file
            if grep -q "^$key=" "$project_root/.env"; then
                # Replace existing value
                sed -i.tmp "s|^$key=.*|$key=$value|" "$project_root/.env"
            else
                # Add new key
                echo "$key=$value" >> "$project_root/.env"
            fi
        else
            log_warn "Secret $key not found in Secrets Manager"
        fi
    done < "$project_root/config/secrets-values.template"
    
    # Clean up temp files
    rm -f "$project_root/.env.tmp"
    
    log_success "Secrets pulled successfully"
}

# Main
case "$1" in
    push)
        push_secrets
        ;;
    pull)
        pull_secrets
        ;;
    *)
        usage
        ;;
esac
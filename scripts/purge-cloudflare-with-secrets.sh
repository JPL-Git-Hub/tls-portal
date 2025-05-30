#!/bin/bash
set -e

# Purge Cloudflare cache using credentials from Google Secrets Manager

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

section "Cloudflare Cache Purge (with Google Secrets)"

PROJECT_ID="${DEFAULT_FIREBASE_PROJECT:-the-law-shop-457607}"

# Try to fetch Cloudflare credentials from Google Secrets Manager
fetch_cloudflare_secrets() {
    log_info "Fetching Cloudflare credentials from Google Secrets Manager..."
    
    # Check if secrets exist in Google Secrets Manager
    if gcloud secrets describe "CLOUDFLARE_API_TOKEN" --project="$PROJECT_ID" >/dev/null 2>&1; then
        export CLOUDFLARE_API_TOKEN=$(gcloud secrets versions access latest \
            --secret="CLOUDFLARE_API_TOKEN" \
            --project="$PROJECT_ID" 2>/dev/null)
        log_success "Retrieved CLOUDFLARE_API_TOKEN from Secrets Manager"
    else
        log_warn "CLOUDFLARE_API_TOKEN not found in Secrets Manager"
        return 1
    fi
    
    if gcloud secrets describe "CLOUDFLARE_ZONE_ID" --project="$PROJECT_ID" >/dev/null 2>&1; then
        export CLOUDFLARE_ZONE_ID=$(gcloud secrets versions access latest \
            --secret="CLOUDFLARE_ZONE_ID" \
            --project="$PROJECT_ID" 2>/dev/null)
        log_success "Retrieved CLOUDFLARE_ZONE_ID from Secrets Manager"
    else
        log_warn "CLOUDFLARE_ZONE_ID not found in Secrets Manager"
        return 1
    fi
    
    return 0
}

# Function to purge entire cache
purge_everything() {
    log_info "Purging entire Cloudflare cache..."
    
    response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"purge_everything":true}')
    
    success=$(echo "$response" | jq -r '.success')
    
    if [ "$success" == "true" ]; then
        log_success "Cache purged successfully!"
        return 0
    else
        error=$(echo "$response" | jq -r '.errors[0].message // "Unknown error"')
        log_error "Failed to purge cache: $error"
        return 1
    fi
}

# Main execution
main() {
    # First try Google Secrets Manager
    if fetch_cloudflare_secrets; then
        log_success "Using credentials from Google Secrets Manager"
    elif [ -f "$project_root/config/.secrets/cloudflare.env" ]; then
        # Fallback to local file
        log_info "Using local credentials file"
        source "$project_root/config/.secrets/cloudflare.env"
    else
        log_error "No Cloudflare credentials found!"
        log_info "Either:"
        log_info "1. Add to Google Secrets Manager:"
        log_info "   gcloud secrets create CLOUDFLARE_API_TOKEN --data-file=- --project=$PROJECT_ID"
        log_info "   gcloud secrets create CLOUDFLARE_ZONE_ID --data-file=- --project=$PROJECT_ID"
        log_info "2. Or create local file: config/.secrets/cloudflare.env"
        exit 1
    fi
    
    # Verify we have the required values
    if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ZONE_ID" ]; then
        log_error "Missing required Cloudflare credentials"
        exit 1
    fi
    
    # Purge the cache
    purge_everything
    
    if [ $? -eq 0 ]; then
        echo ""
        log_info "Cache purge complete! Changes should be visible within:"
        log_info "  - 30 seconds for most users"
        log_info "  - Up to 2 minutes for all edge locations"
        echo ""
        log_info "To verify the update:"
        log_info "  1. Visit https://thelawshop.com"
        log_info "  2. Or check Firebase directly: https://the-law-shop-457607.web.app"
    fi
}

# Check for required tools
if ! command -v jq &> /dev/null; then
    log_error "jq is required but not installed"
    log_info "Install with: brew install jq"
    exit 1
fi

if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI is required but not installed"
    exit 1
fi

main "$@"
#!/bin/bash
set -e

# Update Cloudflare DNS after Cloud Run deployment
# Simple script that gets called after successful deployment

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

section "Updating Cloudflare DNS"

# Get Cloud Run service URL
SERVICE_URL=$1
if [ -z "$SERVICE_URL" ]; then
    log_info "Getting Cloud Run service URL..."
    SERVICE_URL=$(gcloud run services describe $PROJECT_NAME \
        --platform managed \
        --region $DEFAULT_REGION \
        --project $DEFAULT_FIREBASE_PROJECT \
        --format 'value(status.url)')
    
    if [ -z "$SERVICE_URL" ]; then
        die "Could not get Cloud Run service URL"
    fi
fi

log_info "Cloud Run URL: $SERVICE_URL"

# Get Cloudflare credentials from secrets
log_info "Getting Cloudflare credentials..."

# Get Cloudflare API token from secrets
CLOUDFLARE_API_TOKEN=$(gcloud secrets versions access latest \
    --secret="Cloudflare_DNS_API_Token" \
    --project="$DEFAULT_FIREBASE_PROJECT") || die "Missing Cloudflare_DNS_API_Token secret"

# Get Zone ID - if not in secrets, get it from API
CLOUDFLARE_ZONE_ID=$(gcloud secrets versions access latest \
    --secret="CLOUDFLARE_ZONE_ID" \
    --project="$DEFAULT_FIREBASE_PROJECT" 2>/dev/null) || {
    log_info "Zone ID not in secrets, fetching from Cloudflare API..."
    # Get zone ID for thelawshop.com
    CLOUDFLARE_ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=thelawshop.com" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" | jq -r '.result[0].id')
    
    if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
        die "Could not get Zone ID from Cloudflare API"
    fi
    
    # Save it to secrets for next time
    echo -n "$CLOUDFLARE_ZONE_ID" | gcloud secrets create "CLOUDFLARE_ZONE_ID" \
        --data-file=- --project="$DEFAULT_FIREBASE_PROJECT" 2>/dev/null || \
    echo -n "$CLOUDFLARE_ZONE_ID" | gcloud secrets versions add "CLOUDFLARE_ZONE_ID" \
        --data-file=- --project="$DEFAULT_FIREBASE_PROJECT"
    
    log_success "Zone ID saved to secrets manager"
}

# Extract domain from Cloud Run URL
CLOUD_RUN_DOMAIN=$(echo $SERVICE_URL | sed 's|https://||')

# Function to get DNS record ID
get_record_id() {
    local record_name=$1
    curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?name=$record_name" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" | \
        jq -r '.result[0].id // empty'
}

# Function to update or create DNS record
update_dns_record() {
    local record_name=$1
    local record_id=$(get_record_id "$record_name")
    
    if [ -n "$record_id" ]; then
        # Update existing record
        log_info "Updating DNS record for $record_name (ID: $record_id)..."
        curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$record_id" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"CNAME\",\"name\":\"$record_name\",\"content\":\"$CLOUD_RUN_DOMAIN\",\"ttl\":1,\"proxied\":true}" \
            > /dev/null || die "Failed to update DNS record"
    else
        # Create new record
        log_info "Creating DNS record for $record_name..."
        curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"CNAME\",\"name\":\"$record_name\",\"content\":\"$CLOUD_RUN_DOMAIN\",\"ttl\":1,\"proxied\":true}" \
            > /dev/null || die "Failed to create DNS record"
    fi
    log_success "DNS record updated for $record_name"
}

# Portal subdomain (portal.thelawshop.com) points to Firebase Hosting
# So we only need to update the wildcard for client API endpoints

# Update wildcard for client subdomains (API/Backend)
update_dns_record "*.portal.thelawshop.com"

log_success "Cloudflare DNS updated successfully"
log_info "DNS propagation may take a few minutes"
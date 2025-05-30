#!/bin/bash
set -e

# Cloudflare DNS setup for TLS Portal
# Sets up domain routing for main site and client subdomains

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"
source "$script_dir/lib/secrets-manager.sh"

section "Cloudflare DNS Configuration"

# Load Cloudflare credentials (checks Google Secrets Manager first)
if ! load_cloudflare_secrets; then
    die "Missing Cloudflare configuration"
fi

# Firebase hosting URL
FIREBASE_HOSTING_URL="the-law-shop-457607.web.app"

# Function to create/update DNS record
update_dns_record() {
    local name=$1
    local type=$2
    local content=$3
    local proxied=${4:-true}
    
    log_info "Updating DNS record: $name ($type)"
    
    # Check if record exists
    existing_record=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?name=$name&type=$type" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" | jq -r '.result[0].id // empty')
    
    if [ -n "$existing_record" ]; then
        # Update existing record
        curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$existing_record" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"$type\",\"name\":\"$name\",\"content\":\"$content\",\"proxied\":$proxied}" \
            > /dev/null
        log_success "Updated $name"
    else
        # Create new record
        curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"$type\",\"name\":\"$name\",\"content\":\"$content\",\"proxied\":$proxied}" \
            > /dev/null
        log_success "Created $name"
    fi
}

# Main domain configuration
section "Configuring Main Domain"
update_dns_record "thelawshop.com" "CNAME" "$FIREBASE_HOSTING_URL" true
update_dns_record "www.thelawshop.com" "CNAME" "$FIREBASE_HOSTING_URL" true

# API subdomain (if using separate API)
# update_dns_record "api.thelawshop.com" "CNAME" "your-api-endpoint.com" true

# Wildcard for client subdomains
section "Configuring Client Subdomains"
update_dns_record "*.thelawshop.com" "CNAME" "$FIREBASE_HOSTING_URL" true

# Portal-specific subdomains (examples)
log_info "Example client portals will be accessible at:"
log_info "  - acme.thelawshop.com"
log_info "  - smithlaw.thelawshop.com"
log_info "  - johndoe.thelawshop.com"

# SSL configuration
section "SSL Configuration"
log_info "Cloudflare SSL/TLS settings:"
log_info "1. Go to Cloudflare Dashboard > SSL/TLS"
log_info "2. Set encryption mode to 'Full (strict)'"
log_info "3. Enable 'Always Use HTTPS'"
log_info "4. Enable 'Automatic HTTPS Rewrites'"

# Page rules for optimization
section "Recommended Page Rules"
log_info "Consider adding these page rules in Cloudflare:"
log_info "1. Cache Level: Cache Everything for *.thelawshop.com/assets/*"
log_info "2. Browser Cache TTL: 1 month for static assets"
log_info "3. Security Level: High for */admin/*"

# Verify DNS propagation
section "DNS Verification"
log_info "DNS records have been updated. Propagation may take up to 48 hours."
log_info "You can check propagation status at: https://www.whatsmydns.net"
log_info ""
log_info "To verify locally:"
log_info "  dig thelawshop.com"
log_info "  dig acme.thelawshop.com"

log_success "Cloudflare configuration complete!"
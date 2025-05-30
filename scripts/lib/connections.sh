#!/bin/bash
# Connection helpers for GitHub and Cloudflare
# No interactive authentication - uses tokens from Google Secrets

# GitHub helper - always use token from secrets
gh_cmd() {
    GH_TOKEN=$(gcloud secrets versions access latest --secret=github-token --project=the-law-shop-457607) gh "$@"
}

# Cloudflare API helper
cf_api() {
    local endpoint=$1
    shift
    
    API_TOKEN=$(gcloud secrets versions access latest --secret=Cloudflare_DNS_API_Token --project=the-law-shop-457607)
    
    curl -s -X GET "https://api.cloudflare.com/client/v4/$endpoint" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        "$@"
}

# Example usage:
# gh_cmd secret list --repo JPL-Git-Hub/tls-portal
# cf_api "zones/$CLOUDFLARE_ZONE_ID/dns_records"
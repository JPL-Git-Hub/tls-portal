#!/bin/bash
set -e

# Force removal of old website from all caches

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"
source "$script_dir/lib/secrets-manager.sh"

section "Force Remove Old Site"

# 1. Deploy an empty/redirect page to Firebase
deploy_blank_page() {
    log_info "Creating blank index.html..."
    
    mkdir -p "$project_root/temp-deploy"
    cat > "$project_root/temp-deploy/index.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>The Law Shop</title>
    <meta http-equiv="refresh" content="0; url=https://portal.thelawshop.com">
</head>
<body>
    <p>Redirecting to portal...</p>
</body>
</html>
EOF

    # Create minimal firebase.json
    cat > "$project_root/temp-deploy/firebase.json" << EOF
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json"]
  }
}
EOF

    # Deploy to Firebase
    log_info "Deploying blank page to Firebase..."
    cd "$project_root/temp-deploy"
    firebase deploy --only hosting --project "$DEFAULT_FIREBASE_PROJECT"
    
    cd "$project_root"
    rm -rf "$project_root/temp-deploy"
    
    log_success "Blank page deployed to Firebase"
}

# 2. Purge Cloudflare cache completely
purge_cloudflare() {
    log_info "Purging Cloudflare cache..."
    
    if ! load_cloudflare_secrets; then
        log_error "Cannot purge Cloudflare without credentials"
        return 1
    fi
    
    # Purge everything
    response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"purge_everything":true}')
    
    success=$(echo "$response" | jq -r '.success')
    
    if [ "$success" == "true" ]; then
        log_success "Cloudflare cache purged!"
    else
        log_error "Failed to purge Cloudflare cache"
        return 1
    fi
}

# 3. Set aggressive cache headers in Cloudflare
set_no_cache_rules() {
    log_info "Setting no-cache rules in Cloudflare..."
    
    # Create page rule for no caching
    rule_data='{
        "targets": [
            {
                "target": "url",
                "constraint": {
                    "operator": "matches",
                    "value": "*thelawshop.com/*"
                }
            }
        ],
        "actions": [
            {
                "id": "cache_level",
                "value": "bypass"
            },
            {
                "id": "edge_cache_ttl",
                "value": 0
            }
        ],
        "priority": 1,
        "status": "active"
    }'
    
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/pagerules" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "$rule_data" > /dev/null
    
    log_info "Cache bypass rule created (if not already exists)"
}

# Main execution
main() {
    log_warn "This will replace the old site with a blank/redirect page"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cancelled"
        exit 0
    fi
    
    # Step 1: Deploy blank page
    deploy_blank_page
    
    # Step 2: Purge all caches
    purge_cloudflare
    
    # Step 3: Set no-cache rules
    set_no_cache_rules
    
    section "Additional Steps"
    
    log_info "The old site should now be gone. Additional steps:"
    echo ""
    echo "1. Clear your browser cache (Cmd+Shift+R or Ctrl+Shift+R)"
    echo "2. Try incognito/private mode"
    echo "3. Check these URLs:"
    echo "   - https://the-law-shop-457607.web.app (Firebase direct)"
    echo "   - https://thelawshop.com (via Cloudflare)"
    echo ""
    echo "4. If still seeing old content:"
    echo "   - Wait 2-5 minutes for global CDN propagation"
    echo "   - Try from a different network/device"
    echo "   - Use a VPN to check from different location"
    echo ""
    echo "5. Nuclear option - Change DNS:"
    echo "   - Temporarily point thelawshop.com to a different server"
    echo "   - This forces all caches to update"
}

main "$@"
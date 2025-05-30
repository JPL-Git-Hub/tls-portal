#!/bin/bash
set -e

# Purge Cloudflare cache to force update from Firebase Hosting

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"
source "$script_dir/lib/secrets-manager.sh"

section "Cloudflare Cache Purge"

# Load Cloudflare credentials (checks Google Secrets Manager first)
if ! load_cloudflare_secrets; then
    exit 1
fi

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

# Function to purge specific URLs
purge_urls() {
    local urls=("$@")
    
    log_info "Purging specific URLs..."
    
    # Create JSON array of URLs
    json_urls=$(printf '%s\n' "${urls[@]}" | jq -R . | jq -s .)
    
    response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"files\":$json_urls}")
    
    success=$(echo "$response" | jq -r '.success')
    
    if [ "$success" == "true" ]; then
        log_success "URLs purged successfully!"
        return 0
    else
        error=$(echo "$response" | jq -r '.errors[0].message // "Unknown error"')
        log_error "Failed to purge URLs: $error"
        return 1
    fi
}

# Main execution
main() {
    case "${1:-all}" in
        all)
            purge_everything
            ;;
        urls)
            shift
            if [ $# -eq 0 ]; then
                log_error "No URLs provided"
                log_info "Usage: $0 urls https://thelawshop.com https://www.thelawshop.com"
                exit 1
            fi
            purge_urls "$@"
            ;;
        home)
            # Purge common homepage URLs
            urls=(
                "https://thelawshop.com"
                "https://thelawshop.com/"
                "https://www.thelawshop.com"
                "https://www.thelawshop.com/"
                "https://thelawshop.com/index.html"
            )
            purge_urls "${urls[@]}"
            ;;
        *)
            log_info "Usage: $0 [all|home|urls <url1> <url2> ...]"
            log_info "  all  - Purge entire cache"
            log_info "  home - Purge homepage URLs"
            log_info "  urls - Purge specific URLs"
            exit 1
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        echo ""
        log_info "Cache purge complete! Changes should be visible within:"
        log_info "  - 30 seconds for most users"
        log_info "  - Up to 2 minutes for all edge locations"
        echo ""
        log_info "To verify the update:"
        log_info "  1. Open an incognito/private browser window"
        log_info "  2. Visit https://thelawshop.com"
        log_info "  3. Check for your latest changes"
        echo ""
        log_info "Alternative verification:"
        log_info "  - Check Firebase directly: https://the-law-shop-457607.web.app"
        log_info "  - Use curl: curl -I https://thelawshop.com | grep cf-cache-status"
    fi
}

# Check for required tools
if ! command -v jq &> /dev/null; then
    log_error "jq is required but not installed"
    log_info "Install with: brew install jq"
    exit 1
fi

main "$@"
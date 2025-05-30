#!/bin/bash
set -e

# One-time secrets setup with consistent naming
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"

section "TLS Portal Secrets Setup"

# Create secrets directory
log_info "Creating secrets directory..."
mkdir -p "$project_root/config/.secrets"

# Add to .gitignore if not already there
if ! grep -q "config/.secrets" "$project_root/.gitignore" 2>/dev/null; then
    echo "config/.secrets/" >> "$project_root/.gitignore"
    log_success "Added secrets directory to .gitignore"
fi

# Check for existing Firebase service account
if [[ -f "$project_root/config/.secrets/firebase-service-account.json" ]]; then
    log_success "Firebase service account already exists"
elif [[ -f "$project_root/config/.secrets/firebase-admin-sa.json" ]]; then
    log_info "Found firebase-admin-sa.json, creating standard link..."
    ln -sf firebase-admin-sa.json "$project_root/config/.secrets/firebase-service-account.json"
    log_success "Created standard service account link"
else
    log_warning "No Firebase service account found!"
    echo "
📋 To add Firebase service account:
   1. Go to Firebase Console > Project Settings > Service Accounts
   2. Click 'Generate New Private Key'
   3. Save as: config/.secrets/firebase-service-account.json
"
fi

# Create environment config if missing
if [[ ! -f "$project_root/config/dev.env" ]]; then
    log_info "Creating dev.env from template..."
    cp "$project_root/config/env.template" "$project_root/config/dev.env"
    log_success "Created config/dev.env - please fill in your values"
else
    log_success "dev.env already exists"
fi

# Create Stripe keys template
if [[ ! -f "$project_root/config/.secrets/stripe-keys.env" ]]; then
    cat > "$project_root/config/.secrets/stripe-keys.env" << 'EOF'
# Stripe API Keys
export STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
export STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY_HERE"
export STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"
EOF
    log_info "Created Stripe keys template at config/.secrets/stripe-keys.env"
fi

# Create Cloudflare keys template
if [[ ! -f "$project_root/config/.secrets/cloudflare-keys.env" ]]; then
    cat > "$project_root/config/.secrets/cloudflare-keys.env" << 'EOF'
# Cloudflare API Configuration
export CLOUDFLARE_ZONE_ID="your-zone-id"
export CLOUDFLARE_API_TOKEN="your-api-token"
EOF
    log_info "Created Cloudflare keys template at config/.secrets/cloudflare-keys.env"
fi

# Summary
echo "
📁 Secrets Directory Structure:
   config/
   ├── .secrets/                        (git ignored)
   │   ├── firebase-service-account.json  (main service account)
   │   ├── stripe-keys.env               (Stripe API keys)
   │   └── cloudflare-keys.env           (Cloudflare API)
   ├── dev.env                          (development config)
   ├── prod.env                         (production config)
   └── env.template                     (reference template)

✅ Consistent naming established!
🔍 Scripts will auto-detect secrets in standard locations
"

# Test the secrets hook
log_info "Testing secrets detection..."
source "$script_dir/lib/secrets-hook.sh"
if check_secrets "deploy"; then
    log_success "Deployment secrets are properly configured!"
else
    log_warning "Some secrets still need to be added"
fi
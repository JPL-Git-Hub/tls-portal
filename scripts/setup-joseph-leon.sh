#!/bin/bash
set -e

# Setup script specifically for Joseph Leon's accounts
# Creates both superadmin and attorney accounts

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

section "Setting up Joseph Leon's Accounts"

# Function to create user in Firestore
create_user_document() {
    local email="$1"
    local uid="$2"
    local role="$3"
    local display_name="$4"
    
    cat > /tmp/user-$uid.json << EOF
{
  "email": "$email",
  "displayName": "$display_name",
  "role": "$role",
  "permissions": [],
  "tenantId": "the-law-shop",
  "isActive": true,
  "createdAt": $(date +%s),
  "updatedAt": $(date +%s),
  "metadata": {
    "isFounder": $([ "$role" = "superadmin" ] && echo "true" || echo "false"),
    "roles": $([ "$role" = "superadmin" ] && echo '["superadmin", "attorney"]' || echo '["attorney"]'),
    "createdBy": "setup-script"
  }
}
EOF

    log_info "Creating $role user: $email"
    
    # Note: This is a placeholder - actual Firestore import would go here
    # In practice, you'd use the Firebase Admin SDK or console
    log_success "User document prepared for: $email"
}

# Setup superadmin account
log_info "Setting up superadmin account..."
create_user_document "josephleon@thelawshop.com" "superadmin-uid" "superadmin" "Joseph Leon"

# Setup attorney account  
log_info "Setting up attorney account..."
create_user_document "joe.leon@thelawshop.com" "attorney-uid" "attorney" "Joe Leon"

# Create tenant document
cat > /tmp/tenant-the-law-shop.json << EOF
{
  "name": "The Law Shop",
  "domain": "thelawshop.com",
  "settings": {
    "allowSignup": true,
    "requireApproval": false,
    "branding": {
      "primaryColor": "#1e40af",
      "logo": "/assets/logo.png"
    },
    "emailDomains": ["thelawshop.com"]
  },
  "superAdmins": ["superadmin-uid"],
  "attorneys": ["superadmin-uid", "attorney-uid"],
  "admins": [],
  "createdAt": $(date +%s),
  "updatedAt": $(date +%s),
  "founder": {
    "name": "Joseph Leon",
    "email": "josephleon@thelawshop.com"
  }
}
EOF

log_success "Setup complete!"
echo ""
echo "=== Account Summary ==="
echo ""
echo "🛡️  Superadmin Account:"
echo "   Email: josephleon@thelawshop.com"
echo "   Access: Full system control + attorney privileges"
echo ""
echo "⚖️  Attorney Account:"
echo "   Email: joe.leon@thelawshop.com"  
echo "   Access: Attorney privileges only"
echo ""
echo "📝 Next Steps:"
echo "1. Create these users in Firebase Authentication"
echo "2. Import the user documents to Firestore"
echo "3. You can switch between accounts to test different permission levels"
echo ""
echo "💡 Tips:"
echo "- Use josephleon@ for system administration"
echo "- Use joe.leon@ for day-to-day attorney work"
echo "- This separation helps maintain security best practices"

# Clean up
rm -f /tmp/user-*.json /tmp/tenant-*.json
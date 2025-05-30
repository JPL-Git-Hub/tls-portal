#!/bin/bash
set -e

# Script to create superadmin user in Firestore
# Run this after setting up Firebase Auth

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

section "Create Superadmin User"

# Check if user email is provided
if [ -z "$1" ]; then
    log_error "Usage: $0 <admin-email>"
    log_info "Example: $0 admin@thelawshop.com"
    exit 1
fi

ADMIN_EMAIL="$1"
ADMIN_UID="${2:-}"  # Optional, will be fetched if not provided

# Function to get user UID from email
get_uid_from_email() {
    local email="$1"
    firebase auth:export /tmp/users.json --project "$DEFAULT_FIREBASE_PROJECT" >/dev/null 2>&1
    
    local uid=$(jq -r ".users[] | select(.email == \"$email\") | .localId" /tmp/users.json 2>/dev/null)
    rm -f /tmp/users.json
    
    echo "$uid"
}

# Get or validate UID
if [ -z "$ADMIN_UID" ]; then
    log_info "Fetching UID for $ADMIN_EMAIL..."
    ADMIN_UID=$(get_uid_from_email "$ADMIN_EMAIL")
    
    if [ -z "$ADMIN_UID" ]; then
        log_error "User $ADMIN_EMAIL not found in Firebase Auth"
        log_info "Please create the user first:"
        log_info "1. Go to Firebase Console > Authentication"
        log_info "2. Add user with email: $ADMIN_EMAIL"
        log_info "3. Run this script again"
        exit 1
    fi
fi

log_success "Found user: $ADMIN_EMAIL (UID: $ADMIN_UID)"

# Create Firestore document
log_info "Creating superadmin user document..."

cat > /tmp/admin-user.json << EOF
{
  "email": "$ADMIN_EMAIL",
  "displayName": "Admin User",
  "role": "superadmin",
  "permissions": [],
  "tenantId": "the-law-shop",
  "isActive": true,
  "createdAt": $(date +%s),
  "updatedAt": $(date +%s),
  "metadata": {
    "isFounder": true,
    "roles": ["superadmin", "attorney"],
    "createdBy": "setup-script"
  }
}
EOF

# Import to Firestore
log_info "Writing to Firestore..."
firebase firestore:import /tmp/admin-user.json \
    --project "$DEFAULT_FIREBASE_PROJECT" \
    --document-id "$ADMIN_UID" \
    --collection-path "users" \
    --merge

# Create tenant if it doesn't exist
log_info "Creating tenant document..."

cat > /tmp/tenant.json << EOF
{
  "name": "The Law Shop",
  "domain": "thelawshop.com",
  "settings": {
    "allowSignup": true,
    "requireApproval": false,
    "branding": {
      "primaryColor": "#1e40af"
    }
  },
  "superAdmins": ["$ADMIN_UID"],
  "attorneys": ["$ADMIN_UID"],
  "createdAt": $(date +%s),
  "updatedAt": $(date +%s)
}
EOF

firebase firestore:import /tmp/tenant.json \
    --project "$DEFAULT_FIREBASE_PROJECT" \
    --document-id "the-law-shop" \
    --collection-path "tenants" \
    --merge

# Clean up
rm -f /tmp/admin-user.json /tmp/tenant.json

log_success "Superadmin user created successfully!"
echo ""
echo "User Details:"
echo "  Email: $ADMIN_EMAIL"
echo "  UID: $ADMIN_UID"
echo "  Role: superadmin + attorney"
echo "  Tenant: The Law Shop"
echo ""
echo "You can now log in with full administrative access."
#!/bin/bash
set -e

# Initialize Firebase configuration
# Creates firebase.json, firestore.rules, firestore.indexes.json, and storage.rules

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source libraries
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

# Script marker for idempotency
marker="$project_root/$MARKER_DIR/firebase.done"

# Create firebase.json
create_firebase_json() {
    local file="$project_root/firebase.json"
    
    if [ -f "$file" ]; then
        log_info "firebase.json already exists, skipping"
        return 0
    fi
    
    cat > "$file" << EOF
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "src/pages/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "auth": {
      "port": $AUTH_PORT
    },
    "firestore": {
      "port": $FIRESTORE_PORT
    },
    "hosting": {
      "port": $FRONTEND_PORT
    },
    "storage": {
      "port": $STORAGE_PORT
    },
    "ui": {
      "enabled": true,
      "port": $EMULATOR_UI_PORT
    },
    "singleProjectMode": true
  }
}
EOF
    
    log_success "Created firebase.json"
}

# Create firestore.rules
create_firestore_rules() {
    local file="$project_root/firestore.rules"
    
    if [ -f "$file" ]; then
        log_info "firestore.rules already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user belongs to the tenant
    function belongsToTenant(tenantId) {
      return isSignedIn() && 
        request.auth.token.tenantId == tenantId;
    }
    
    // Helper function to check if user is a tenant admin
    function isTenantAdmin(tenantId) {
      return belongsToTenant(tenantId) && 
        request.auth.token.role == 'admin';
    }
    
    // Tenant documents
    match /tenants/{tenantId} {
      allow read: if belongsToTenant(tenantId);
      allow write: if isTenantAdmin(tenantId);
      
      // Client subcollection
      match /clients/{clientId} {
        allow read: if belongsToTenant(tenantId);
        allow create: if isTenantAdmin(tenantId) && 
          request.resource.data.tenantId == tenantId;
        allow update: if isTenantAdmin(tenantId) && 
          request.resource.data.tenantId == resource.data.tenantId;
        allow delete: if isTenantAdmin(tenantId);
      }
      
      // Settings subcollection
      match /settings/{document=**} {
        allow read: if belongsToTenant(tenantId);
        allow write: if isTenantAdmin(tenantId);
      }
    }
    
    // User profiles
    match /users/{userId} {
      allow read: if isSignedIn() && 
        (request.auth.uid == userId || 
         isTenantAdmin(resource.data.tenantId));
      allow create: if isSignedIn() && 
        request.auth.uid == userId &&
        request.resource.data.userId == userId;
      allow update: if isSignedIn() && 
        request.auth.uid == userId &&
        request.resource.data.userId == resource.data.userId &&
        request.resource.data.tenantId == resource.data.tenantId;
      allow delete: if false; // Users cannot be deleted through client
    }
    
    // Public intake forms (write-only for anonymous users)
    match /intake/{document} {
      allow create: if true; // Anyone can submit a form
      allow read: if isSignedIn(); // Only authenticated users can read
      allow update, delete: if false; // Intake forms are immutable
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
EOF
    
    log_success "Created firestore.rules"
}

# Create firestore.indexes.json
create_firestore_indexes() {
    local file="$project_root/firestore.indexes.json"
    
    if [ -f "$file" ]; then
        log_info "firestore.indexes.json already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
{
  "indexes": [
    {
      "collectionGroup": "clients",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "tenantId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "profile.lastName",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "clients",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "tenantId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "clients",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "subdomain",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "intake",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "tenantId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
EOF
    
    log_success "Created firestore.indexes.json"
}

# Create storage.rules
create_storage_rules() {
    local file="$project_root/storage.rules"
    
    if [ -f "$file" ]; then
        log_info "storage.rules already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function belongsToTenant(tenantId) {
      return isSignedIn() && request.auth.token.tenantId == tenantId;
    }
    
    function isTenantAdmin(tenantId) {
      return belongsToTenant(tenantId) && request.auth.token.role == 'admin';
    }
    
    // Tenant document storage
    match /tenants/{tenantId}/{allPaths=**} {
      allow read: if belongsToTenant(tenantId);
      allow write: if isTenantAdmin(tenantId);
    }
    
    // Client document storage
    match /clients/{tenantId}/{clientId}/{allPaths=**} {
      allow read: if belongsToTenant(tenantId);
      allow write: if isTenantAdmin(tenantId);
    }
    
    // User profile pictures
    match /users/{userId}/profile/{fileName} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && request.auth.uid == userId && 
        request.resource.size < 5 * 1024 * 1024 && // 5MB limit
        request.resource.contentType.matches('image/.*');
    }
    
    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
EOF
    
    log_success "Created storage.rules"
}

# Main function
main() {
    section "Firebase Configuration Initialization"
    
    # Check if already completed
    if is_completed "$marker" && ! is_force "$@"; then
        log_warn "Firebase configuration already initialized. Use --force to recreate."
        return 0
    fi
    
    # Create Firebase configuration files
    create_firebase_json
    create_firestore_rules
    create_firestore_indexes
    create_storage_rules
    
    # Mark as completed
    mark_completed "$marker"
    
    log_success "Firebase configuration initialization completed!"
}

# Run main function
main "$@"

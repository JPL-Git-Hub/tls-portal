#!/bin/bash
set -e

# Initialize the shared module
# Creates package.json, TypeScript config, and core shared utilities

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source libraries
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

# Script marker for idempotency
marker="$project_root/$MARKER_DIR/module-shared.done"
module_dir="$project_root/$SRC_DIR/shared"

# Create package.json
create_package_json() {
    local file="$module_dir/package.json"
    
    if [ -f "$file" ]; then
        log_info "shared/package.json already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
{
  "name": "@tls-portal/shared",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest run"
  },
  "dependencies": {
    "zod": "^3.22.0",
    "libphonenumber-js": "^1.10.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.3",
    "vitest": "^1.0.0"
  }
}
EOF
    
    log_success "Created shared/package.json"
}

# Create tsconfig.json
create_tsconfig() {
    local file="$module_dir/tsconfig.json"
    
    if [ -f "$file" ]; then
        log_info "shared/tsconfig.json already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
EOF
    
    log_success "Created shared/tsconfig.json"
}

# Create client types
create_client_types() {
    local file="$module_dir/src/types/client.ts"
    
    if [ -f "$file" ]; then
        log_info "types/client.ts already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
/**
 * Client data types for the TLS Portal system
 */

export interface ClientProfile {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientMetadata {
  source: 'web_form' | 'admin_entry' | 'import';
  tags: string[];
  notes?: string;
}

export interface Client {
  id: string;
  tenantId: string;
  subdomain: string;
  profile: ClientProfile;
  metadata: ClientMetadata;
  status: 'active' | 'inactive' | 'archived';
  portalUrl: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export type CreateClientInput = Omit<
  Client,
  'id' | 'subdomain' | 'portalUrl' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'
>;

export type UpdateClientInput = Partial<
  Omit<Client, 'id' | 'tenantId' | 'subdomain' | 'createdAt' | 'createdBy'>
>;
EOF
    
    log_success "Created types/client.ts"
}

# Create subdomain utility
create_subdomain_util() {
    local file="$module_dir/src/utils/subdomain.ts"
    
    if [ -f "$file" ]; then
        log_info "utils/subdomain.ts already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
/**
 * Utility functions for generating and validating client portal subdomains
 */

/**
 * Generate a subdomain from client last name and mobile number
 * Format: first 4 letters of last name + last 4 digits of mobile
 * Example: "Smith" + "555-123-4567" = "smit4567"
 */
export function generateSubdomain(lastName: string, mobile: string): string {
  // Clean and normalize inputs
  const cleanLastName = lastName.trim().toLowerCase().replace(/[^a-z]/g, '');
  const cleanMobile = mobile.replace(/\D/g, ''); // Remove all non-digits
  
  // Get first 4 letters of last name (pad with 'x' if needed)
  const namePrefix = cleanLastName.substring(0, 4).padEnd(4, 'x');
  
  // Get last 4 digits of mobile
  if (cleanMobile.length < 4) {
    throw new Error('Mobile number must have at least 4 digits');
  }
  const mobileSuffix = cleanMobile.slice(-4);
  
  return `${namePrefix}${mobileSuffix}`;
}

/**
 * Validate a subdomain format
 */
export function isValidSubdomain(subdomain: string): boolean {
  // Must be exactly 8 characters: 4 letters + 4 digits
  const pattern = /^[a-z]{4}\d{4}$/;
  return pattern.test(subdomain);
}

/**
 * Generate a unique subdomain by appending a counter if needed
 */
export function generateUniqueSubdomain(
  lastName: string,
  mobile: string,
  existingSubdomains: string[]
): string {
  const baseSubdomain = generateSubdomain(lastName, mobile);
  
  if (!existingSubdomains.includes(baseSubdomain)) {
    return baseSubdomain;
  }
  
  let counter = 2;
  let uniqueSubdomain = `${baseSubdomain}${counter}`;
  
  while (existingSubdomains.includes(uniqueSubdomain)) {
    counter++;
    uniqueSubdomain = `${baseSubdomain}${counter}`;
  }
  
  return uniqueSubdomain;
}
EOF
    
    log_success "Created utils/subdomain.ts"
}

# Create validation schemas
create_validation_schemas() {
    local file="$module_dir/src/utils/validation.ts"
    
    if [ -f "$file" ]; then
        log_info "utils/validation.ts already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
/**
 * Validation schemas using Zod
 */

import { z } from 'zod';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

// Phone number validation
export const phoneSchema = z
  .string()
  .refine(
    (phone) => {
      try {
        return isValidPhoneNumber(phone, 'US');
      } catch {
        return false;
      }
    },
    { message: 'Invalid phone number' }
  )
  .transform((phone) => {
    const parsed = parsePhoneNumber(phone, 'US');
    return parsed?.format('NATIONAL') || phone;
  });

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Name validation
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters');

// Client creation schema
export const createClientSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  mobile: phoneSchema,
  source: z.enum(['web_form', 'admin_entry', 'import']).default('web_form'),
});

export type CreateClientDto = z.infer<typeof createClientSchema>;
EOF
    
    log_success "Created utils/validation.ts"
}

# Create index file
create_index() {
    local file="$module_dir/src/index.ts"
    
    if [ -f "$file" ]; then
        log_info "shared/src/index.ts already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
/**
 * Shared module exports
 */

// Types
export * from './types/client';

// Utilities
export * from './utils/subdomain';
export * from './utils/validation';

// Re-export commonly used libraries
export { z } from 'zod';
EOF
    
    log_success "Created shared/src/index.ts"
}

# Main function
main() {
    section "Shared Module Initialization"
    
    # Check if already completed
    if is_completed "$marker" && ! is_force "$@"; then
        log_warn "Shared module already initialized. Use --force to recreate."
        return 0
    fi
    
    # Create module structure
    create_dir "$module_dir/src/types"
    create_dir "$module_dir/src/utils"
    create_dir "$module_dir/src/config"
    create_dir "$module_dir/src/constants"
    
    # Create files
    create_package_json
    create_tsconfig
    create_client_types
    create_subdomain_util
    create_validation_schemas
    create_index
    
    # Mark as completed
    mark_completed "$marker"
    
    log_success "Shared module initialization completed!"
}

# Run main function
main "$@"

#!/bin/bash
set -e

# Initialize the creator module (backend API)
# Creates Express server with client creation endpoint and Firebase integration

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source libraries
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

# Script marker for idempotency
marker="$project_root/$MARKER_DIR/module-creator.done"
module_dir="$project_root/$SRC_DIR/creator"

# Create package.json
create_package_json() {
    local file="$module_dir/package.json"
    
    if [ -f "$file" ]; then
        log_info "creator/package.json already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
{
  "name": "@tls-portal/creator",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "test": "vitest run"
  },
  "dependencies": {
    "@tls-portal/shared": "1.0.0",
    "express": "^4.18.0",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "compression": "^1.7.4",
    "firebase-admin": "^12.0.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/compression": "^1.7.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.3",
    "nodemon": "^3.0.0",
    "ts-node": "^10.9.0",
    "vitest": "^1.0.0"
  }
}
EOF
    
    log_success "Created creator/package.json"
}

# Create tsconfig.json
create_tsconfig() {
    local file="$module_dir/tsconfig.json"
    
    if [ -f "$file" ]; then
        log_info "creator/tsconfig.json already exists, skipping"
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
  "exclude": ["node_modules", "dist", "**/*.test.ts"],
  "references": [
    { "path": "../shared" }
  ]
}
EOF
    
    log_success "Created creator/tsconfig.json"
}

# Create server.ts
create_server() {
    local file="$module_dir/src/server.ts"
    
    if [ -f "$file" ]; then
        log_info "src/server.ts already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
/**
 * Main server entry point for the Creator API service
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase';
import { errorHandler } from './middleware/errorHandler';
import { clientRoutes } from './routes/clients';

// Load environment variables
dotenv.config();

// Initialize Firebase
initializeFirebase();

// Create Express app
const app = express();

// Trust proxy - required for Cloud Run
app.set('trust proxy', true);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'creator-api',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/clients', clientRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Creator API listening on port ${PORT}`);
});
EOF
    
    log_success "Created src/server.ts"
}

# Create Firebase config
create_firebase_config() {
    local file="$module_dir/src/config/firebase.ts"
    
    if [ -f "$file" ]; then
        log_info "config/firebase.ts already exists, skipping"
        return 0
    fi
    
    create_dir "$module_dir/src/config"
    
    cat > "$file" << 'EOF'
/**
 * Firebase Admin SDK initialization
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let initialized = false;

export function initializeFirebase() {
  if (initialized) return;

  try {
    // In production, use default credentials
    if (process.env.NODE_ENV === 'production') {
      initializeApp();
    } else {
      // In development, use service account or emulators
      const projectId = process.env.FIREBASE_PROJECT_ID || 'the-law-shop-457607';
      
      initializeApp({
        projectId,
      });
      
      // Connect to emulators if available
      if (process.env.FIRESTORE_EMULATOR_HOST) {
        console.log('Using Firestore emulator:', process.env.FIRESTORE_EMULATOR_HOST);
      }
    }
    
    initialized = true;
    console.log('Firebase Admin SDK initialized');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

export const db = getFirestore();
EOF
    
    log_success "Created config/firebase.ts"
}

# Create error handler middleware
create_error_handler() {
    local file="$module_dir/src/middleware/errorHandler.ts"
    
    if [ -f "$file" ]; then
        log_info "middleware/errorHandler.ts already exists, skipping"
        return 0
    fi
    
    create_dir "$module_dir/src/middleware"
    
    cat > "$file" << 'EOF'
/**
 * Global error handler middleware
 */

import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors
    });
  }

  // Firebase errors
  if (err.code?.startsWith('auth/')) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: err.message
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
EOF
    
    log_success "Created middleware/errorHandler.ts"
}

# Create client routes
create_client_routes() {
    local file="$module_dir/src/routes/clients.ts"
    
    if [ -f "$file" ]; then
        log_info "routes/clients.ts already exists, skipping"
        return 0
    fi
    
    create_dir "$module_dir/src/routes"
    
    cat > "$file" << 'EOF'
/**
 * Client management routes
 */

import { Router } from 'express';
import { createClient } from '../controllers/clientController';

export const clientRoutes = Router();

// Create new client
clientRoutes.post('/', createClient);
EOF
    
    log_success "Created routes/clients.ts"
}

# Create client controller
create_client_controller() {
    local file="$module_dir/src/controllers/clientController.ts"
    
    if [ -f "$file" ]; then
        log_info "controllers/clientController.ts already exists, skipping"
        return 0
    fi
    
    create_dir "$module_dir/src/controllers"
    
    cat > "$file" << 'EOF'
/**
 * Client controller - handles client creation and management
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase';
import { 
  createClientSchema, 
  generateSubdomain, 
  generateUniqueSubdomain,
  Client 
} from '@tls-portal/shared';

export async function createClient(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    // Validate request body
    const validatedData = createClientSchema.parse(req.body);
    
    // Get tenant ID (hardcoded for now, will come from auth later)
    const tenantId = 'default-tenant';
    
    // Check existing subdomains for this tenant
    const existingClients = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .select('subdomain')
      .get();
    
    const existingSubdomains = existingClients.docs.map(doc => doc.data().subdomain);
    
    // Generate unique subdomain
    const subdomain = generateUniqueSubdomain(
      validatedData.lastName,
      validatedData.mobile,
      existingSubdomains
    );
    
    // Create client document
    const now = new Date();
    const clientData: Omit<Client, 'id'> = {
      tenantId,
      subdomain,
      profile: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        mobile: validatedData.mobile,
        createdAt: now,
        updatedAt: now
      },
      metadata: {
        source: validatedData.source || 'web_form',
        tags: []
      },
      status: 'active',
      portalUrl: `https://${subdomain}.${process.env.DOMAIN || 'thelawshop.com'}`,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system', // Will be replaced with auth user
      lastModifiedBy: 'system'
    };
    
    // Save to Firestore
    const docRef = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .add(clientData);
    
    // Return created client
    res.status(201).json({
      id: docRef.id,
      ...clientData
    });
    
  } catch (error) {
    next(error);
  }
}
EOF
    
    log_success "Created controllers/clientController.ts"
}

# Create nodemon config
create_nodemon_config() {
    local file="$module_dir/nodemon.json"
    
    if [ -f "$file" ]; then
        log_info "nodemon.json already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node",
  "env": {
    "NODE_ENV": "development"
  }
}
EOF
    
    log_success "Created nodemon.json"
}

# Main function
main() {
    section "Creator Module Initialization"
    
    # Check if already completed
    if is_completed "$marker" && ! is_force "$@"; then
        log_warn "Creator module already initialized. Use --force to recreate."
        return 0
    fi
    
    # Create module structure
    create_dir "$module_dir/src/config"
    create_dir "$module_dir/src/controllers"
    create_dir "$module_dir/src/middleware"
    create_dir "$module_dir/src/routes"
    create_dir "$module_dir/src/services"
    create_dir "$module_dir/src/utils"
    
    # Create files
    create_package_json
    create_tsconfig
    create_server
    create_firebase_config
    create_error_handler
    create_client_routes
    create_client_controller
    create_nodemon_config
    
    # Mark as completed
    mark_completed "$marker"
    
    log_success "Creator module initialization completed!"
}

# Run main function
main "$@"

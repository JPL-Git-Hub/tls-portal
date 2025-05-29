#!/bin/bash
# Shared configuration values for all scripts

# Project configuration
PROJECT_NAME="tls-portal"
DEFAULT_FIREBASE_PROJECT="the-law-shop-457607"
DEFAULT_REGION="us-central1"

# Module names
MODULES=(
    "auth"
    "creator"
    "forms"
    "pages"
    "router"
    "shared"
)

# Directory paths (relative to project root)
SRC_DIR="src"
SCRIPTS_DIR="scripts"
CONFIG_DIR="config"
DOCS_DIR="docs"

# Marker directory for idempotency
MARKER_DIR=".init"

# Node/Yarn configuration
MIN_NODE_VERSION="18.0.0"
YARN_VERSION="1.x"

# Port assignments
FRONTEND_PORT=3000
BACKEND_PORT=3001
EMULATOR_UI_PORT=4000
FIRESTORE_PORT=8080
AUTH_PORT=9099
STORAGE_PORT=9199

# Export all configuration
export PROJECT_NAME DEFAULT_FIREBASE_PROJECT DEFAULT_REGION
export MODULES SRC_DIR SCRIPTS_DIR CONFIG_DIR DOCS_DIR MARKER_DIR
export MIN_NODE_VERSION YARN_VERSION
export FRONTEND_PORT BACKEND_PORT EMULATOR_UI_PORT
export FIRESTORE_PORT AUTH_PORT STORAGE_PORT

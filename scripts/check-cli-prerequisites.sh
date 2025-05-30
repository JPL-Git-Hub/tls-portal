#!/bin/bash
set -e

# Check CLI Prerequisites for TLS Portal
# Purpose: Verify required CLI tools are installed for AI-assisted development
# Usage: ./scripts/check-cli-prerequisites.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Source utilities for dynamic path detection
source "$SCRIPT_DIR/lib/gcloud.sh"
source "$SCRIPT_DIR/lib/java.sh"
source "$SCRIPT_DIR/lib/utils.sh"

echo -e "${GREEN}=== Checking CLI Prerequisites ===${NC}"
echo "Verifying tools for AI-assisted development..."
echo

# Track missing tools
missing_count=0
warning_count=0

# Function to check command
check_command() {
    local cmd=$1
    local description=$2
    local required=${3:-true}
    
    if command -v "$cmd" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ $cmd${NC} - $description"
        # Show version for key tools
        case "$cmd" in
            node) echo "  Version: $(node --version)" ;;
            yarn) echo "  Version: $(yarn --version)" ;;
            jq) echo "  Version: $(jq --version 2>&1)" ;;
            gh) echo "  Version: $(gh --version | head -1)" ;;
        esac
    else
        if [ "$required" = true ]; then
            echo -e "${RED}✗ $cmd${NC} - $description ${RED}[REQUIRED]${NC}"
            ((missing_count++))
        else
            echo -e "${YELLOW}⚠ $cmd${NC} - $description ${YELLOW}[OPTIONAL]${NC}"
            ((warning_count++))
        fi
    fi
}

# Check gcloud with special handling
check_gcloud() {
    echo -e "\n${YELLOW}Deployment Tools:${NC}"
    
    # Use the gcloud detection utility
    if setup_gcloud >/dev/null 2>&1; then
        echo -e "${GREEN}✓ gcloud${NC} - Google Cloud SDK"
        echo "  Version: $(gcloud --version | head -1)"
        # Check if authenticated
        if check_gcloud_auth; then
            echo "  Status: Authenticated"
        else
            echo "  Status: Not authenticated (run 'gcloud auth login')"
        fi
    else
        echo -e "${YELLOW}⚠ gcloud${NC} - Google Cloud SDK ${YELLOW}[OPTIONAL - needed for deployment]${NC}"
        ((warning_count++))
    fi
}

# Core development tools
echo -e "${YELLOW}Core Development Tools:${NC}"
check_command "node" "Node.js runtime (>= 18.0.0)"
check_command "yarn" "Yarn package manager"
check_command "git" "Version control"

# Essential CLI tools for AI development
echo -e "\n${YELLOW}Essential for AI-Assisted Development:${NC}"
check_command "jq" "JSON processor for parsing configs and API responses"
check_command "gh" "GitHub CLI for repository management"

# API testing tools
echo -e "\n${YELLOW}API Testing & Debugging:${NC}"
check_command "httpie" "HTTP client for testing API endpoints" false
check_command "curl" "Alternative HTTP client"
check_command "http-server" "Static file server for standalone tests" false

# Firebase tools
echo -e "\n${YELLOW}Firebase Development:${NC}"
check_command "firebase" "Firebase CLI for emulators and deployment" false

# Java for Firebase emulators
if setup_java 11 >/dev/null 2>&1; then
    echo -e "${GREEN}✓ java${NC} - Java runtime for Firebase emulators"
    echo "  Version: $(get_java_version)"
else
    echo -e "${YELLOW}⚠ java${NC} - Java 11+ needed for Firebase emulators ${YELLOW}[OPTIONAL]${NC}"
    ((warning_count++))
fi

# Google Cloud tools
check_gcloud

# Docker (only needed for manual/emergency deployment)
echo -e "\n${YELLOW}Container Tools (Optional):${NC}"
check_command "docker" "Docker (only for manual deployment, not needed with GitHub Actions)" false

# Summary
echo
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
if [ $missing_count -eq 0 ]; then
    echo -e "${GREEN}✓ All required tools are installed!${NC}"
else
    echo -e "${RED}✗ Missing $missing_count required tool(s)${NC}"
fi

if [ $warning_count -gt 0 ]; then
    echo -e "${YELLOW}⚠ Missing $warning_count optional tool(s)${NC}"
fi

# Installation suggestions
if [ $missing_count -gt 0 ] || [ $warning_count -gt 0 ]; then
    echo
    echo -e "${YELLOW}Installation suggestions:${NC}"
    
    # Check if we need jq
    if ! command -v jq >/dev/null 2>&1; then
        echo -e "  ${YELLOW}jq:${NC} brew install jq"
    fi
    
    # Check if we need gh
    if ! command -v gh >/dev/null 2>&1; then
        echo -e "  ${YELLOW}gh:${NC} brew install gh"
    fi
    
    # Check if we need httpie
    if ! command -v httpie >/dev/null 2>&1; then
        echo -e "  ${YELLOW}httpie:${NC} brew install httpie"
    fi
    
    # Check if we need firebase
    if ! command -v firebase >/dev/null 2>&1; then
        echo -e "  ${YELLOW}firebase:${NC} npm install -g firebase-tools"
    fi
    
    # Check if we need gcloud
    if ! check_gcloud; then
        echo -e "  ${YELLOW}gcloud:${NC} https://cloud.google.com/sdk/docs/install"
    fi
    
    # Check if we need Java
    if ! setup_java 11 >/dev/null 2>&1; then
        echo -e "  ${YELLOW}java:${NC} brew install openjdk (macOS) or https://adoptium.net/"
    fi
fi

# Exit with error if required tools missing
if [ $missing_count -gt 0 ]; then
    echo
    echo -e "${RED}Please install required tools before continuing${NC}"
    exit 1
else
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    exit 0
fi

#!/bin/bash
set -e

# Tech stack verification script
# Checks all required and optional tools for TLS Portal development

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source libraries
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"
source "$script_dir/lib/gcloud.sh"

# Version checks
check_version() {
    local cmd=$1
    local name=$2
    local min_version=$3
    local install_info=$4
    
    if command -v "$cmd" >/dev/null 2>&1; then
        local version=$($cmd --version 2>&1 | head -1)
        log_success "$name: $version"
        return 0
    else
        log_error "$name not found"
        if [ -n "$install_info" ]; then
            echo "  Install: $install_info"
        fi
        return 1
    fi
}

# Main function
main() {
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}        TLS Portal Tech Stack Check                 ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo
    
    local has_errors=0
    
    section "Required Tools"
    
    # Node.js
    if ! check_version "node" "Node.js" "$MIN_NODE_VERSION" "https://nodejs.org"; then
        has_errors=1
    fi
    
    # Yarn
    if ! check_version "yarn" "Yarn Classic" "1.22.0" "npm install -g yarn"; then
        has_errors=1
    fi
    
    # Git
    if ! check_version "git" "Git" "2.0.0" "https://git-scm.com"; then
        has_errors=1
    fi
    
    # Docker
    if command -v docker >/dev/null 2>&1; then
        log_success "Docker: $(docker --version)"
    else
        log_error "Docker not found"
        echo "  Install: https://www.docker.com/products/docker-desktop"
        has_errors=1
    fi
    
    # Google Cloud SDK
    if setup_gcloud >/dev/null 2>&1; then
        log_success "Google Cloud SDK: $(gcloud --version | head -1)"
    else
        log_error "Google Cloud SDK not found"
        echo "  Install: https://cloud.google.com/sdk"
        has_errors=1
    fi
    
    section "Optional Tools (Recommended)"
    
    # Java
    if command -v java >/dev/null 2>&1 && java -version >/dev/null 2>&1; then
        log_success "Java: $(java -version 2>&1 | head -1)"
    else
        log_warn "Java not found (needed for Firebase emulators)"
        echo "  Install: brew install openjdk"
        echo "  Or download from: https://adoptium.net"
    fi
    
    # Firebase CLI
    if command -v firebase >/dev/null 2>&1; then
        log_success "Firebase CLI: $(firebase --version)"
    else
        log_warn "Firebase CLI not found"
        echo "  Install: npm install -g firebase-tools"
    fi
    
    section "Project Dependencies"
    
    # Check if node_modules exists
    if [ -d "$project_root/node_modules" ]; then
        log_success "Project dependencies installed"
    else
        log_warn "Project dependencies not installed"
        echo "  Run: yarn install"
    fi
    
    # Check TypeScript
    if [ -f "$project_root/node_modules/.bin/tsc" ]; then
        log_success "TypeScript: $($project_root/node_modules/.bin/tsc --version)"
    else
        log_warn "TypeScript not found in project"
    fi
    
    section "Environment Configuration"
    
    # Check .env file
    if [ -f "$project_root/.env" ]; then
        log_success ".env file exists"
    else
        log_warn ".env file not found"
        echo "  Create from template: cp config/dev.env .env"
    fi
    
    # Check Firebase project
    if [ -f "$project_root/.env" ] && grep -q "FIREBASE_PROJECT_ID=" "$project_root/.env" 2>/dev/null; then
        local project_id=$(grep "FIREBASE_PROJECT_ID=" "$project_root/.env" 2>/dev/null | cut -d= -f2 || true)
        if [ "$project_id" != "your-project-id" ] && [ -n "$project_id" ]; then
            log_success "Firebase project configured: $project_id"
        else
            log_warn "Firebase project not configured in .env"
        fi
    fi
    
    echo
    if [ $has_errors -eq 0 ]; then
        log_success "All required tools are installed!"
        echo
        echo "Next steps:"
        echo "  1. Run: ./scripts/init-all.sh"
        echo "  2. Run: ./scripts/dev.sh"
    else
        log_error "Some required tools are missing. Please install them first."
        exit 1
    fi
}

# Run main function
main "$@"
#!/bin/bash
set -e

# Check prerequisites for TLS Portal
# This script checks system prerequisites without modifying anything

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source utilities
source "$script_dir/lib/colors.sh"
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/java.sh"

# Check prerequisites
check_prerequisites() {
    section "Checking Prerequisites"
    
    local missing=0
    
    # Check Node.js
    if ! check_cmd "node" "Node.js"; then
        missing=1
        log_error "Install Node.js from https://nodejs.org"
    else
        # Check Node version
        local node_version=$(node --version | cut -d'v' -f2)
        local MIN_NODE_VERSION="18.0.0"
        if ! version_ge "$node_version" "$MIN_NODE_VERSION"; then
            missing=1
            log_error "Node.js version $node_version is too old. Need >= $MIN_NODE_VERSION"
        fi
    fi
    
    # Check npm
    if ! check_cmd "npm" "npm"; then
        missing=1
        log_error "Install Node.js >= $MIN_NODE_VERSION from https://nodejs.org"
    fi
    
    # Check Yarn
    if ! check_cmd "yarn" "Yarn Classic"; then
        missing=1
        log_error "Install Yarn Classic: npm install -g yarn"
    fi
    
    # Check Git
    if ! check_cmd "git" "Git"; then
        missing=1
        log_error "Install Git from https://git-scm.com"
    fi
    
    # Java check with better detection
    section "Checking Java"
    if setup_java 11; then
        log_success "Java is properly configured"
    else
        log_warn "Java 11+ not found (needed for Firebase emulators)"
        log_info "Java can be installed via:"
        log_info "  - Homebrew: brew install openjdk"
        log_info "  - SDKMAN: sdk install java"
        log_info "  - Download: https://adoptium.net/"
    fi
    
    if command -v firebase >/dev/null 2>&1; then
        log_success "Firebase CLI: $(firebase --version)"
    else
        log_warn "Firebase CLI not found (optional): npm install -g firebase-tools"
    fi
    
    # CLI Utilities Check
    section "Checking CLI Utilities"
    
    # Essential for AI development
    if ! check_cmd "jq" "jq JSON processor"; then
        log_warn "Install jq: brew install jq (macOS) or apt install jq (Linux)"
    fi
    
    if ! check_cmd "gh" "GitHub CLI"; then
        log_warn "Install GitHub CLI: brew install gh (macOS)"
    fi
    
    # Optional but useful
    if ! check_cmd "http" "HTTPie"; then
        log_info "Optional: Install HTTPie for API testing: brew install httpie"
    fi
    
    # Deployment tools (already checked above, but verify configuration)
    if command -v firebase >/dev/null 2>&1; then
        if firebase projects:list >/dev/null 2>&1; then
            log_success "Firebase CLI: configured"
        else
            log_warn "Firebase CLI installed but not logged in: firebase login"
        fi
    fi
    
    if [ $missing -eq 1 ]; then
        die "Please install missing required dependencies"
    fi
    
    log_success "All required prerequisites installed!"
}

# Main function
main() {
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}       TLS Portal Prerequisites Check               ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo
    
    check_prerequisites
    
    echo
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ Prerequisites check complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
}

# Run main function
main "$@"
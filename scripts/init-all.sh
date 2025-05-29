#!/bin/bash
set -e

# Master initialization script for TLS Portal
# Orchestrates the complete project setup by running all init scripts in order

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source libraries
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

# Script execution list in dependency order
init_scripts=(
    "init-structure.sh"
    "init-base-config.sh"
    "init-dev-tools.sh"
    "init-module-shared.sh"
    "init-module-auth.sh"
    "init-module-creator.sh"
    "init-module-forms.sh"
    "init-module-pages.sh"
    "init-module-router.sh"
    "init-firebase.sh"
    "init-docker.sh"
    "init-ci.sh"
    "init-env-config.sh"
)

# Check prerequisites
check_prerequisites() {
    section "Checking Prerequisites"
    
    local missing=0
    
    # Check Node.js
    if ! check_cmd "node" "Node.js"; then
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
    
    # Optional checks
    if command -v java >/dev/null 2>&1; then
        log_success "Java: $(java -version 2>&1 | head -1)"
    else
        log_warn "Java not found (optional, needed for Firebase emulators)"
    fi
    
    if command -v firebase >/dev/null 2>&1; then
        log_success "Firebase CLI: $(firebase --version)"
    else
        log_warn "Firebase CLI not found (optional): npm install -g firebase-tools"
    fi
    
    if [ $missing -eq 1 ]; then
        die "Please install missing required dependencies"
    fi
    
    log_success "All required prerequisites installed!"
}

# Run initialization script
run_script() {
    local script=$1
    local script_path="$script_dir/$script"
    
    if [ ! -f "$script_path" ]; then
        log_warn "Script not found: $script (skipping)"
        return 0
    fi
    
    log_info "Running $script..."
    
    # Make script executable
    chmod +x "$script_path"
    
    # Run the script, passing along any arguments
    if "$script_path" "$@"; then
        log_success "Completed $script"
    else
        die "Failed to run $script"
    fi
}

# Install dependencies
install_dependencies() {
    section "Installing Dependencies"
    
    if [ -f "$project_root/yarn.lock" ]; then
        log_info "Dependencies already installed, skipping"
    else
        log_info "Installing project dependencies..."
        cd "$project_root"
        yarn install
        log_success "Dependencies installed"
    fi
}

# Show next steps
show_next_steps() {
    section "Next Steps"
    
    echo -e "${GREEN}✨ TLS Portal initialization complete!${NC}"
    echo
    echo "To start development:"
    echo -e "  ${CYAN}cd $project_root${NC}"
    echo -e "  ${CYAN}./scripts/dev.sh${NC}"
    echo
    echo "To use Firebase emulators:"
    echo -e "  ${CYAN}./scripts/dev-firebase.sh${NC}"
    echo
    echo "Available commands:"
    echo -e "  ${CYAN}yarn dev${NC}         - Start frontend and backend"
    echo -e "  ${CYAN}yarn lint${NC}        - Run ESLint"
    echo -e "  ${CYAN}yarn typecheck${NC}   - Check TypeScript types"
    echo -e "  ${CYAN}yarn build${NC}       - Build for production"
    echo
    echo "Documentation:"
    echo -e "  ${CYAN}docs/README.md${NC}   - Project overview"
    echo -e "  ${CYAN}docs/SETUP.md${NC}    - Setup guide"
    echo
}

# Main function
main() {
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}       TLS Portal - Master Initialization          ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo
    
    # Check prerequisites first
    check_prerequisites
    
    # Process arguments
    local force_flag=""
    if is_force "$@"; then
        force_flag="--force"
        log_warn "Running in force mode - will recreate existing files"
    fi
    
    # Run all initialization scripts
    section "Running Initialization Scripts"
    
    for script in "${init_scripts[@]}"; do
        # Check if script exists before trying to run it
        if [ -f "$script_dir/$script" ]; then
            run_script "$script" $force_flag
        else
            log_info "Optional script $script not found, skipping"
        fi
    done
    
    # Install dependencies after all structure is created
    install_dependencies
    
    # Show completion message and next steps
    show_next_steps
}

# Run main function with all arguments
main "$@"
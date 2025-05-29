#!/bin/bash
set -e

# Development script - starts backend and frontend without Firebase emulators
# Simple, direct approach following philosophy: no complexity, just start the services

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source libraries
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

# Ensure we're in project root
cd "$project_root"

# Check if dependencies are installed
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        log_warn "Dependencies not installed. Running yarn install..."
        "$script_dir/yarn-quiet.sh" install
    fi
}

# Main function
main() {
    section "Starting Development Environment"
    
    # Check dependencies
    check_dependencies
    
    log_info "Starting backend API on port $BACKEND_PORT"
    log_info "Starting frontend on port $FRONTEND_PORT"
    log_info "Press Ctrl+C to stop all services"
    echo
    
    # Use concurrently from package.json script to avoid global dependency
    yarn dev
}

# Run main function
main "$@"
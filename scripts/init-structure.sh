#!/bin/bash
set -e

# Initialize project directory structure
# This script creates all necessary directories for the TLS Portal project

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source libraries
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

# Script marker for idempotency
marker="$project_root/$MARKER_DIR/structure.done"

# Main function
main() {
    section "Project Structure Initialization"
    
    # Check if already completed
    if is_completed "$marker" && ! is_force "$@"; then
        log_warn "Project structure already initialized. Use --force to recreate."
        return 0
    fi
    
    # Create marker directory
    create_dir "$project_root/$MARKER_DIR"
    
    # Create root directories
    log_info "Creating root directories..."
    create_dir "$project_root/$SRC_DIR"
    create_dir "$project_root/$SCRIPTS_DIR"
    create_dir "$project_root/$CONFIG_DIR"
    create_dir "$project_root/$DOCS_DIR"
    create_dir "$project_root/.github/workflows"
    
    # Create module directories
    log_info "Creating module directories..."
    for module in "${MODULES[@]}"; do
        create_dir "$project_root/$SRC_DIR/$module"
        
        # Create standard subdirectories for each module
        create_dir "$project_root/$SRC_DIR/$module/src"
        
        # Special subdirectories for shared module
        if [ "$module" = "shared" ]; then
            create_dir "$project_root/$SRC_DIR/$module/src/types"
            create_dir "$project_root/$SRC_DIR/$module/src/utils"
            create_dir "$project_root/$SRC_DIR/$module/src/config"
            create_dir "$project_root/$SRC_DIR/$module/src/constants"
        fi
    done
    
    # Create additional directories
    create_dir "$project_root/Archive"
    
    # Mark as completed
    mark_completed "$marker"
    
    log_success "Project structure initialization completed!"
}

# Run main function
main "$@"

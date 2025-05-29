#!/bin/bash
set -e

# Get the project root directory (parent of scripts directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to project root
cd "$PROJECT_ROOT"

# Source libraries
source "$SCRIPT_DIR/lib/utils.sh"
source "$SCRIPT_DIR/lib/colors.sh"

section "Dependency Cleanup"

# Verify we're in a valid project
if [ ! -f "package.json" ]; then
    die "No package.json found. This script must be run from a Node.js project root."
fi

# Show current state
log_info "Current node_modules size:"
if [ -d "node_modules" ]; then
    du -sh node_modules 2>/dev/null || echo "Unable to calculate"
else
    echo "No node_modules found"
fi

# Ask for confirmation
echo
read -p "This will remove all node_modules and reinstall. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warn "Cleanup cancelled"
    exit 0
fi

# Stop any running services
log_info "Stopping development services..."
if [ -f "./scripts/stop-dev.sh" ]; then
    ./scripts/stop-dev.sh >/dev/null 2>&1 || true
fi

# Clean node_modules
log_info "Removing node_modules directories..."
rm -rf node_modules
rm -rf src/*/node_modules
rm -rf packages/*/node_modules
log_success "Removed all node_modules"

# Clean yarn cache (optional)
log_info "Cleaning yarn cache..."
yarn cache clean --silent
log_success "Yarn cache cleaned"

# Remove any build artifacts
log_info "Removing build artifacts..."
rm -rf dist
rm -rf src/*/dist
rm -rf packages/*/dist
rm -rf .next
rm -rf .vite
log_success "Build artifacts removed"

# Reinstall dependencies
log_info "Reinstalling dependencies..."
yarn install --frozen-lockfile

# Show new state
echo
log_info "New node_modules size:"
du -sh node_modules 2>/dev/null || echo "Unable to calculate"

log_success "Dependency cleanup complete!"

# Suggest next steps
echo
log_info "Suggested next steps:"
echo "  1. Run './scripts/start-dev.sh' to restart services"
echo "  2. Test that your app still works"
echo "  3. Commit any lockfile changes if needed"
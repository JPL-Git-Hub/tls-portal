#!/bin/bash
set -e

# Development script with Firebase emulators
# Starts Firebase emulators and then the application

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source libraries
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

# Ensure we're in project root
cd "$project_root"

# Ensure Java is in PATH
export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"

# Check prerequisites
check_prerequisites() {
    section "Checking Prerequisites"
    
    # Check Java
    if ! command -v java >/dev/null 2>&1; then
        die "Java is required for Firebase emulators. Install with: brew install openjdk"
    fi
    
    # Check Firebase CLI
    if ! command -v firebase >/dev/null 2>&1; then
        die "Firebase CLI is required. Install with: npm install -g firebase-tools"
    fi
    
    # Check dependencies
    if [ ! -d "node_modules" ]; then
        log_warn "Dependencies not installed. Running yarn install..."
        "$script_dir/yarn-quiet.sh" install
    fi
    
    log_success "Prerequisites satisfied"
}

# Start emulators in background
start_emulators() {
    section "Starting Firebase Emulators"
    
    # Kill any existing emulators
    pkill -f "firebase-tools" 2>/dev/null || true
    
    # Start emulators in background
    log_info "Starting Firebase emulators..."
    firebase emulators:start --only auth,firestore,storage --project tls-portal-dev > /tmp/firebase-emulators.log 2>&1 &
    local emulator_pid=$!
    
    # Wait for emulators to be ready
    log_info "Waiting for emulators to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:4000 > /dev/null 2>&1; then
            log_success "Emulators ready!"
            log_info "Emulator UI: http://localhost:4000"
            break
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        die "Emulators failed to start. Check /tmp/firebase-emulators.log"
    fi
}

# Start development servers
start_dev_servers() {
    section "Starting Development Servers"
    
    log_info "Starting backend API on port $BACKEND_PORT"
    log_info "Starting frontend on port $FRONTEND_PORT"
    echo
    
    # Start dev servers
    yarn dev
}

# Cleanup function
cleanup() {
    echo
    log_info "Shutting down..."
    
    # Kill emulators
    pkill -f "firebase-tools" 2>/dev/null || true
    
    # Kill any node processes on our ports
    lsof -ti:3000 -ti:3001 | xargs kill -9 2>/dev/null || true
}

# Main function
main() {
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}    TLS Portal Development with Emulators          ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo
    
    # Set trap for cleanup
    trap cleanup EXIT INT TERM
    
    # Check prerequisites
    check_prerequisites
    
    # Start emulators
    start_emulators
    
    # Start dev servers
    start_dev_servers
}

# Run main function
main "$@"
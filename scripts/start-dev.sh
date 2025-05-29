#!/bin/bash
set -e

# Source libraries
source "$(dirname "$0")/lib/utils.sh"
source "$(dirname "$0")/lib/java.sh"

section "Starting TLS Portal Development Environment"

# Kill any existing processes first
pkill -f "firebase.*emulators" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "creator.*dev" 2>/dev/null || true

log_info "Cleaned up existing processes"
sleep 2

# Check Java for Firebase emulators
if ! setup_java 11; then
    log_error "Java 11+ is required for Firebase emulators"
    log_info "Continuing without Firebase emulators..."
    SKIP_EMULATORS=true
fi

# Check if already running
if [[ "$SKIP_EMULATORS" != "true" ]]; then
    if pgrep -f "firebase.*emulators" > /dev/null; then
        log_info "Firebase emulators already running"
    else
        log_info "Starting Firebase emulators..."
        nohup firebase emulators:start --only auth,firestore,storage --project tls-portal-dev > firebase.log 2>&1 &
        sleep 3  # Give it time to start
    fi
fi

# Start backend
if pgrep -f "creator.*dev" > /dev/null; then
    log_info "Backend already running"
else
    log_info "Starting backend..."
    cd /Users/josephleon/repos/tls-portal
    nohup yarn workspace @tls-portal/creator dev > backend.log 2>&1 &
    sleep 2
fi

# Start frontend  
if pgrep -f "vite" > /dev/null; then
    log_info "Frontend already running"
else
    log_info "Starting frontend..."
    nohup yarn workspace @tls-portal/pages dev > frontend.log 2>&1 &
    sleep 2
fi

log_success "All services starting. Check status with: ./scripts/check-dev-status.sh"

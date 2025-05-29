#!/bin/bash
set -e

# Source libraries
source "$(dirname "$0")/lib/utils.sh"

section "Stopping TLS Portal Development Environment"

# Kill Firebase emulators
if pgrep -f "firebase.*emulators" > /dev/null; then
    log_info "Stopping Firebase emulators..."
    pkill -f "firebase.*emulators" || true
else
    log_info "Firebase emulators not running"
fi

# Kill frontend (Vite)
if pgrep -f "vite" > /dev/null; then
    log_info "Stopping frontend..."
    pkill -f "vite" || true
else
    log_info "Frontend not running"
fi

# Kill backend
if pgrep -f "creator.*dev" > /dev/null; then
    log_info "Stopping backend..."
    pkill -f "creator.*dev" || true
else
    log_info "Backend not running"
fi

# Clean up any orphaned node processes on our ports
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:9099 | xargs kill -9 2>/dev/null || true
lsof -ti:9199 | xargs kill -9 2>/dev/null || true

log_success "All services stopped"
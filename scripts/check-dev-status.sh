#!/bin/bash
source "$(dirname "$0")/lib/utils.sh"

section "Development Environment Status"

if pgrep -f "firebase.*emulators" > /dev/null; then
    log_success "Firebase emulators: Running"
    echo "  Emulator UI: http://localhost:4000"
else
    log_error "Firebase emulators: Not running"
fi

if pgrep -f "vite" > /dev/null; then
    log_success "Frontend: Running"
    echo "  Frontend: http://localhost:3000"
else
    log_error "Frontend: Not running"  
fi

if pgrep -f "creator.*dev" > /dev/null; then
    log_success "Backend: Running"
    echo "  Backend: http://localhost:3001"
else
    log_error "Backend: Not running"
fi
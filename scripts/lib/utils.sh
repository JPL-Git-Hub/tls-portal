#!/bin/bash
# Common utility functions for all scripts

# Source colors if not already loaded
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -z "$GREEN" ] && source "$script_dir/colors.sh"

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${CHECK_MARK} $1"
}

# Error handling
die() {
    log_error "$1"
    exit 1
}

# Section headers
section() {
    echo -e "\n${YELLOW}=== $1 ===${NC}"
}

# Check if command exists
check_cmd() {
    local cmd=$1
    local name=${2:-$1}
    
    if command -v "$cmd" >/dev/null 2>&1; then
        log_success "$name: $(eval "$cmd --version 2>/dev/null | head -1" || echo "installed")"
        return 0
    else
        log_error "$name is required but not installed"
        return 1
    fi
}

# Create directory with logging
create_dir() {
    local dir=$1
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        log_info "Created directory: $dir"
    else
        log_info "Directory exists: $dir"
    fi
}

# Simple idempotency check
is_completed() {
    local marker=$1
    [ -f "$marker" ]
}

# Mark step as completed
mark_completed() {
    local marker=$1
    local marker_dir=$(dirname "$marker")
    
    [ -d "$marker_dir" ] || mkdir -p "$marker_dir"
    touch "$marker"
    log_info "Marked as completed: $(basename "$marker" .done)"
}

# Check for --force flag
is_force() {
    for arg in "$@"; do
        [ "$arg" = "--force" ] && return 0
    done
    return 1
}

# Progress spinner
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Export functions
export -f log_info log_warn log_error log_success die section
export -f check_cmd create_dir is_completed mark_completed is_force spinner
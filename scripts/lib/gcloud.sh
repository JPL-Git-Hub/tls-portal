#!/bin/bash
# Google Cloud SDK detection and setup utilities

# Source colors if not already loaded
if [[ -z "$GREEN" ]]; then
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$script_dir/colors.sh"
fi

# Detect and setup gcloud environment
# Returns 0 if gcloud is found and configured, 1 otherwise
setup_gcloud() {
    # 1. Check if gcloud is already in PATH and working
    if command -v gcloud >/dev/null 2>&1; then
        log_success "gcloud already in PATH: $(gcloud --version | head -1)"
        return 0
    fi
    
    # 2. Check GOOGLE_CLOUD_SDK_HOME if set
    if [[ -n "$GOOGLE_CLOUD_SDK_HOME" ]] && [[ -x "$GOOGLE_CLOUD_SDK_HOME/bin/gcloud" ]]; then
        export PATH="$GOOGLE_CLOUD_SDK_HOME/bin:$PATH"
        log_success "Using gcloud from GOOGLE_CLOUD_SDK_HOME: $(gcloud --version | head -1)"
        return 0
    fi
    
    # 3. Check common installation paths
    local gcloud_paths=(
        # User home directory installations
        "$HOME/google-cloud-sdk/bin"
        "$HOME/.google-cloud-sdk/bin"
        "$HOME/Downloads/google-cloud-sdk/bin"
        # System-wide installations
        "/usr/local/google-cloud-sdk/bin"
        "/opt/google-cloud-sdk/bin"
        "/usr/lib/google-cloud-sdk/bin"
        # Homebrew installations
        "/opt/homebrew/share/google-cloud-sdk/bin"
        "/usr/local/share/google-cloud-sdk/bin"
        "/opt/homebrew/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/bin"
        "/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/bin"
        # Snap installation (Linux)
        "/snap/google-cloud-sdk/current/bin"
        # Common development tool locations
        "/Applications/google-cloud-sdk/bin"
        "$HOME/Applications/google-cloud-sdk/bin"
    )
    
    for gcloud_path in "${gcloud_paths[@]}"; do
        if [[ -x "$gcloud_path/gcloud" ]]; then
            export PATH="$gcloud_path:$PATH"
            log_success "Found gcloud at $gcloud_path: $(gcloud --version | head -1)"
            return 0
        fi
    done
    
    # 4. If we get here, gcloud wasn't found
    log_error "Google Cloud SDK (gcloud) is required but not found"
    log_info "Please install gcloud using one of these methods:"
    log_info "  - Download: https://cloud.google.com/sdk/docs/install"
    log_info "  - macOS: brew install --cask google-cloud-sdk"
    log_info "  - Linux: snap install google-cloud-sdk --classic"
    log_info "  - Or set GOOGLE_CLOUD_SDK_HOME to your installation directory"
    
    return 1
}

# Check if gcloud is available (simple check)
check_gcloud() {
    if command -v gcloud >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Get gcloud version
get_gcloud_version() {
    if check_gcloud; then
        gcloud --version | head -1
    else
        echo "gcloud not found"
    fi
}

# Check if gcloud is authenticated
check_gcloud_auth() {
    if check_gcloud; then
        if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}
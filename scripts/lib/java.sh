#!/bin/bash
# Java detection and setup utilities

# Source colors if not already loaded
if [[ -z "$GREEN" ]]; then
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$script_dir/colors.sh"
fi

# Detect and setup Java environment
# Returns 0 if Java is found and configured, 1 otherwise
setup_java() {
    local min_version="${1:-11}"  # Minimum Java version (default 11)
    
    # 1. Check if java is already in PATH and working
    if command -v java >/dev/null 2>&1; then
        # Get Java version more robustly
        local java_version_output=$(java -version 2>&1 | head -1)
        local version=""
        
        # Extract version number from output
        if [[ "$java_version_output" =~ \"([0-9]+)\.([0-9]+)\.([0-9]+) ]]; then
            # Old format: "1.8.0_301"
            if [[ "${BASH_REMATCH[1]}" == "1" ]]; then
                version="${BASH_REMATCH[2]}"
            else
                version="${BASH_REMATCH[1]}"
            fi
        elif [[ "$java_version_output" =~ version\ \"([0-9]+) ]]; then
            # New format: "11.0.1" or "17"
            version="${BASH_REMATCH[1]}"
        fi
        
        # Check if we successfully extracted a version
        if [[ -n "$version" ]] && [[ "$version" =~ ^[0-9]+$ ]] && [[ "$version" -ge "$min_version" ]]; then
            log_success "Java already in PATH: $java_version_output"
            return 0
        elif [[ -n "$version" ]]; then
            log_warn "Java version $version found but minimum version $min_version required"
        fi
    fi
    
    # 2. Check JAVA_HOME if set
    if [[ -n "$JAVA_HOME" ]] && [[ -x "$JAVA_HOME/bin/java" ]]; then
        export PATH="$JAVA_HOME/bin:$PATH"
        log_success "Using Java from JAVA_HOME: $(java -version 2>&1 | head -1)"
        return 0
    fi
    
    # 3. Use macOS java_home tool if available
    if [[ -x "/usr/libexec/java_home" ]]; then
        local java_home=$(/usr/libexec/java_home -v "$min_version"+ 2>/dev/null)
        if [[ -n "$java_home" ]] && [[ -x "$java_home/bin/java" ]]; then
            export JAVA_HOME="$java_home"
            export PATH="$JAVA_HOME/bin:$PATH"
            log_success "Using Java from java_home: $(java -version 2>&1 | head -1)"
            return 0
        fi
    fi
    
    # 4. Check common installation paths
    local java_paths=(
        # Homebrew ARM64
        "/opt/homebrew/opt/openjdk/bin"
        "/opt/homebrew/opt/openjdk@17/bin"
        "/opt/homebrew/opt/openjdk@11/bin"
        "/opt/homebrew/opt/temurin/bin"
        "/opt/homebrew/opt/temurin@17/bin"
        "/opt/homebrew/opt/temurin@11/bin"
        # Homebrew Intel
        "/usr/local/opt/openjdk/bin"
        "/usr/local/opt/openjdk@17/bin"
        "/usr/local/opt/openjdk@11/bin"
        "/usr/local/opt/temurin/bin"
        "/usr/local/opt/temurin@17/bin"
        "/usr/local/opt/temurin@11/bin"
        # SDKMAN
        "$HOME/.sdkman/candidates/java/current/bin"
        # Common manual installations
        "/Library/Java/JavaVirtualMachines/*/Contents/Home/bin"
        "/usr/local/java/*/bin"
    )
    
    for java_path in "${java_paths[@]}"; do
        # Handle wildcards in paths
        for expanded_path in $java_path; do
            if [[ -x "$expanded_path/java" ]]; then
                export PATH="$expanded_path:$PATH"
                
                # Get Java version
                local java_version_output=$(java -version 2>&1 | head -1)
                local version=""
                
                # Extract version number
                if [[ "$java_version_output" =~ \"([0-9]+)\.([0-9]+)\.([0-9]+) ]]; then
                    if [[ "${BASH_REMATCH[1]}" == "1" ]]; then
                        version="${BASH_REMATCH[2]}"
                    else
                        version="${BASH_REMATCH[1]}"
                    fi
                elif [[ "$java_version_output" =~ version\ \"([0-9]+) ]]; then
                    version="${BASH_REMATCH[1]}"
                fi
                
                if [[ -n "$version" ]] && [[ "$version" =~ ^[0-9]+$ ]] && [[ "$version" -ge "$min_version" ]]; then
                    log_success "Found Java at $expanded_path: $java_version_output"
                    return 0
                fi
            fi
        done
    done
    
    # 5. If we get here, Java wasn't found
    log_error "Java $min_version or higher is required but not found"
    log_info "Please install Java using one of these methods:"
    log_info "  - Homebrew: brew install openjdk"
    log_info "  - SDKMAN: sdk install java"
    log_info "  - Download from: https://adoptium.net/"
    log_info "  - Or set JAVA_HOME to your Java installation"
    
    return 1
}

# Check if Java is available (simple check)
check_java() {
    if command -v java >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Get Java version
get_java_version() {
    if check_java; then
        java -version 2>&1 | head -1
    else
        echo "Java not found"
    fi
}
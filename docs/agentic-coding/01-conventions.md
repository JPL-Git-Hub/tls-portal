# Agentic Coding Conventions

Implementation patterns for AI assistants. Apply these patterns directly when writing code.

## Script Template

```bash
#!/bin/bash
set -e  # Exit on error

# Script description
# Purpose: What this script does
# Usage: How to run it

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Main logic
echo -e "${GREEN}=== Script Title ===${NC}"

# Your script logic here

echo -e "${GREEN}✓ Script completed successfully${NC}"
```

## Color Patterns

```bash
# Success - Green
echo -e "${GREEN}✓ Operation completed${NC}"

# Warning - Yellow  
echo -e "${YELLOW}⚠ Warning: Configuration missing${NC}"

# Error - Red
echo -e "${RED}✗ Error: Failed to connect${NC}"

# Section headers
echo -e "\n${YELLOW}=== Section Title ===${NC}"
```

## Error Handling

```bash
# Set error trap
trap 'echo -e "${RED}Script failed on line $LINENO${NC}"' ERR

# Fatal error function
die() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Usage
[ -f "config.json" ] || die "Configuration file not found"
```

## Idempotency Pattern

```bash
# Setup markers
MARKER_DIR="$PROJECT_ROOT/.init"
SCRIPT_NAME=$(basename "$0" .sh)
MARKER_FILE="$MARKER_DIR/$SCRIPT_NAME.done"

# Check completion
if [ -f "$MARKER_FILE" ]; then
    echo -e "${YELLOW}Already completed. Use --force to re-run${NC}"
    [ "$1" == "--force" ] || exit 0
fi

# ... script logic ...

# Mark complete
mkdir -p "$MARKER_DIR"
touch "$MARKER_FILE"
```

## Directory Structure
```
scripts/
├── lib/                    # Shared libraries
│   ├── colors.sh          # Color definitions
│   ├── utils.sh           # Common utilities
│   └── validation.sh      # Validation functions
├── init-all.sh            # Master orchestrator
└── start-dev.sh           # Development server
```

## Reusable Functions

```bash
# lib/utils.sh
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Usage in scripts
source "$SCRIPT_DIR/lib/utils.sh"
log_info "Starting process..."
```

## File Naming Rules
```
my-script.sh     ✓ lowercase with hyphens
MyScript.sh      ✗ no CamelCase
init_firebase.sh ✗ no underscores
init-firebase.sh ✓ action prefix + descriptive
setup.sh        ✗ too generic
```

## Prerequisites Pattern

```bash
check_prerequisites() {
    local missing=0
    
    if ! command -v node >/dev/null 2>&1; then
        echo -e "${RED}✗ Node.js required but not installed${NC}"
        missing=1
    fi
    
    [ $missing -eq 1 ] && exit 1
}
```

## Directory Creation

```bash
create_directories() {
    echo -e "${YELLOW}Creating directories...${NC}"
    mkdir -p "$PROJECT_ROOT"/{src,scripts,config,docs}
    echo -e "${GREEN}✓ Directories created${NC}"
}
```

## File Generation

```bash
generate_config() {
    if [ -f "config.json" ]; then
        echo -e "${YELLOW}config.json exists, skipping${NC}"
        return 0
    fi
    
    cat > config.json << 'EOF'
{
    "name": "tls-portal",
    "version": "1.0.0"
}
EOF
    
    echo -e "${GREEN}✓ Configuration generated${NC}"
}
```

## Script Validation Checklist
```bash
#!/bin/bash              # Required shebang
set -e                   # Required error handling
colored output           # Required feedback
marker files            # Required idempotency
dependency checks       # Required validation
"$VARIABLES"            # Required quoting
success/failure msgs    # Required clarity
```

## Variable Usage

```bash
# Bad
rm -rf *

# Good
rm -rf "$PROJECT_ROOT/dist"/*
```

```bash
# Bad
cd $PROJECT_DIR

# Good
cd "$PROJECT_DIR"
```

## User Feedback Pattern

```bash
echo "Installing dependencies..."
yarn install
echo "✓ Dependencies installed"
```

## Function Organization

```bash
main() {
    check_prerequisites
    create_directories
    install_dependencies
}

main "$@"
```

## Production Safety

```bash
echo -e "${YELLOW}⚠️  Production Deployment Warning${NC}"
read -p "Type 'yes' to confirm: " confirm
[ "$confirm" != "yes" ] && die "Deployment cancelled"
```

## Command Detection

```bash
# Find command with fallbacks
GCLOUD_CMD=""
if command -v gcloud >/dev/null 2>&1; then
    GCLOUD_CMD="gcloud"
elif [ -x "$HOME/google-cloud-sdk/bin/gcloud" ]; then
    GCLOUD_CMD="$HOME/google-cloud-sdk/bin/gcloud"
else
    die "Google Cloud SDK not found"
fi
```

## CLI Utilities

### jq - JSON Processing
```bash
# Always check availability first
if command -v jq >/dev/null 2>&1; then
    # Extract simple values
    VERSION=$(jq -r '.version' package.json)
    
    # Extract nested values
    API_KEY=$(jq -r '.services.firebase.apiKey' config.json)
    
    # Extract array elements
    FIRST_DEP=$(jq -r '.dependencies | keys[0]' package.json)
    
    # Check if field exists
    if jq -e '.scripts.build' package.json >/dev/null; then
        echo "Build script exists"
    fi
else
    # Fallback to grep/sed only if jq unavailable
    VERSION=$(grep '"version"' package.json | sed 's/.*: *"\(.*\)".*/\1/')
fi
```

### ripgrep (rg) - Required over grep
```bash
# Fast file content search
rg "TODO" --type js

# Search with context
rg -C 3 "error" src/

# List files containing pattern
rg -l "import.*firebase" src/

# Never use grep for code search
# grep -r "pattern" .  ✗ Don't use
```

### Other Useful Utilities
```bash
# yq - YAML processing (if YAML files exist)
if command -v yq >/dev/null 2>&1; then
    PORT=$(yq '.server.port' config.yaml)
fi

# envsubst - Template variable substitution
if command -v envsubst >/dev/null 2>&1; then
    envsubst < config.template > config.json
fi

# date - Consistent timestamps
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="deploy_${TIMESTAMP}.log"

# realpath - Resolve absolute paths
if command -v realpath >/dev/null 2>&1; then
    ABS_PATH=$(realpath "$RELATIVE_PATH")
else
    # Fallback
    ABS_PATH=$(cd "$(dirname "$RELATIVE_PATH")" && pwd)/$(basename "$RELATIVE_PATH")
fi
```

## Common Patterns

### User Input
```bash
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # proceed
fi
```

### Progress Spinner
```bash
spinner() {
    local pid=$1
    local spinstr='|/-\'
    while ps -p $pid > /dev/null; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        spinstr=$temp${spinstr%"$temp"}
        sleep 0.1
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}
# Usage: long_command & spinner $!
```

### Graceful Shutdown
```bash
trap 'echo -e "\n${YELLOW}Shutting down...${NC}"; kill $(jobs -p); exit' INT
yarn dev:backend &
yarn dev:frontend &
wait
```

## Required Patterns Summary

1. Always use the standard script template
2. Always provide colored output (GREEN/YELLOW/RED)
3. Always check prerequisites before operations
4. Always use idempotency markers for init scripts
5. Always quote variables: `"$VAR"` not `$VAR`
6. Always use `die()` function for fatal errors
7. Always provide user feedback for operations
8. Always organize code into functions
9. Never use sed/awk/perl for text processing
10. Never create files without checking existence first
# Script Development Guide

## Overview

This guide documents patterns and best practices for developing bash scripts in the TLS Portal project, focusing on simplicity, reliability, and maintainability.

## Script Structure

### Standard Script Template

Every script should follow this basic structure:

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

## Common Patterns

### 1. Color Output

Use consistent colors for different message types:

```bash
# Success messages - Green
echo -e "${GREEN}✓ Operation completed${NC}"

# Warning messages - Yellow
echo -e "${YELLOW}⚠ Warning: Configuration missing${NC}"

# Error messages - Red
echo -e "${RED}✗ Error: Failed to connect${NC}"

# Section headers
echo -e "\n${YELLOW}=== Section Title ===${NC}"
```

### 2. Prerequisites Checking

Pattern for checking required commands:

```bash
check_prerequisites() {
    local missing=0
    
    # Check for required commands
    if ! command -v node >/dev/null 2>&1; then
        echo -e "${RED}✗ Node.js is required but not installed${NC}"
        missing=1
    else
        echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"
    fi
    
    if ! command -v yarn >/dev/null 2>&1; then
        echo -e "${RED}✗ Yarn is required but not installed${NC}"
        missing=1
    else
        echo -e "${GREEN}✓ Yarn: $(yarn --version)${NC}"
    fi
    
    if [ $missing -eq 1 ]; then
        echo -e "\n${RED}Please install missing dependencies${NC}"
        exit 1
    fi
}
```

### 3. Error Handling

Basic error handling with cleanup:

```bash
# Set error trap
trap 'echo -e "${RED}Script failed on line $LINENO${NC}"' ERR

# Function for fatal errors
die() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Usage
[ -f "config.json" ] || die "Configuration file not found"
```

### 4. Directory Creation

Safe directory creation pattern:

```bash
create_directories() {
    echo -e "${YELLOW}Creating directory structure...${NC}"
    
    # Create multiple directories
    mkdir -p "$PROJECT_ROOT"/{src,scripts,config,docs}
    
    # Create nested structures
    mkdir -p "$PROJECT_ROOT"/src/{auth,pages,shared/{types,utils}}
    
    echo -e "${GREEN}✓ Directories created${NC}"
}
```

### 5. File Generation

Pattern for generating configuration files:

```bash
generate_config() {
    echo -e "${YELLOW}Generating configuration files...${NC}"
    
    # Check if file exists
    if [ -f "config.json" ]; then
        echo -e "${YELLOW}config.json already exists, skipping${NC}"
        return 0
    fi
    
    # Generate file
    cat > config.json << 'EOF'
{
    "name": "tls-portal",
    "version": "1.0.0"
}
EOF
    
    echo -e "${GREEN}✓ Configuration generated${NC}"
}
```

### 6. Environment Variables

Working with environment files:

```bash
setup_env() {
    # Create from template
    if [ -f ".env.example" ] && [ ! -f ".env" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from template${NC}"
    fi
    
    # Source environment
    if [ -f ".env" ]; then
        source .env
    fi
    
    # Validate required variables
    [ -z "$API_KEY" ] && die "API_KEY not set in .env"
}
```

## Idempotency

### Simple Idempotency with Marker Files

Add idempotency using `.init` marker files:

```bash
# At the start of script
MARKER_DIR="$PROJECT_ROOT/.init"
SCRIPT_NAME=$(basename "$0" .sh)
MARKER_FILE="$MARKER_DIR/$SCRIPT_NAME.done"

# Create marker directory
mkdir -p "$MARKER_DIR"

# Check if already completed
if [ -f "$MARKER_FILE" ]; then
    echo -e "${YELLOW}Script already completed. Use --force to re-run${NC}"
    [ "$1" == "--force" ] || exit 0
fi

# ... script logic ...

# Mark as completed
touch "$MARKER_FILE"
echo -e "${GREEN}✓ Marked as completed${NC}"
```

## Library Functions

### Creating Reusable Functions

Store common functions in `lib/` directory:

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

### Progress Indicators

Simple progress indication:

```bash
# Spinner for long operations
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

# Usage
long_operation & spinner $!
```

## Script Organization

### Directory Structure
```
scripts/
├── lib/                    # Shared libraries
│   ├── colors.sh          # Color definitions
│   ├── utils.sh           # Common utilities
│   └── validation.sh      # Validation functions
├── init-all.sh            # Master orchestrator
├── init-structure.sh      # Create directories
├── init-firebase.sh       # Firebase setup
└── dev.sh                 # Development server
```

### Naming Conventions

- Use descriptive names: `init-firebase.sh` not `setup.sh`
- Prefix with action: `init-`, `check-`, `validate-`, `dev-`
- Use hyphens, not underscores
- Keep names concise but clear

## Best Practices

### 1. Keep It Simple
- Avoid over-engineering
- Use built-in bash features
- Don't add unnecessary dependencies

### 2. Be Explicit
```bash
# Bad
rm -rf *

# Good
rm -rf "$PROJECT_ROOT/dist"/*
```

### 3. Quote Variables
```bash
# Bad
cd $PROJECT_DIR

# Good
cd "$PROJECT_DIR"
```

### 4. Use Functions
Break logic into small, testable functions:
```bash
main() {
    check_prerequisites
    create_directories
    generate_configs
    install_dependencies
}

# Run main function
main "$@"
```

### 5. Provide Feedback
Always inform the user what's happening:
```bash
echo "Installing dependencies..."
yarn install
echo "✓ Dependencies installed"
```

## Common Tasks

### Running Commands Safely
```bash
# Check command exists before running
if command -v firebase >/dev/null 2>&1; then
    firebase init
else
    echo "Firebase CLI not installed"
fi
```

### Handling User Input
```bash
# Simple yes/no prompt
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # User said yes
fi
```

### Working with JSON
```bash
# Using jq for JSON parsing
if command -v jq >/dev/null 2>&1; then
    VERSION=$(jq -r '.version' package.json)
else
    # Fallback to grep/sed
    VERSION=$(grep '"version"' package.json | sed 's/.*: *"\(.*\)".*/\1/')
fi
```

## Testing Scripts

### Manual Testing
1. Run with `bash -x script.sh` for debug output
2. Test idempotency by running twice
3. Test error cases by breaking prerequisites

### Validation Checklist
- [ ] Script has proper shebang (`#!/bin/bash`)
- [ ] Uses `set -e` for error handling
- [ ] Has descriptive header comment
- [ ] Provides colored output
- [ ] Is idempotent
- [ ] Handles missing dependencies gracefully
- [ ] Quotes all variables
- [ ] Provides clear success/failure messages

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   chmod +x script.sh
   ```

2. **Bad Interpreter**
   - Check line endings (use LF, not CRLF)
   - Ensure shebang is first line

3. **Command Not Found**
   - Use full paths or check PATH
   - Verify command installation

4. **Variable Expansion Issues**
   - Always quote variables
   - Use `${VAR}` syntax for clarity

## Examples from Project

### Project Initialization Pattern
From `init-project.sh`:
```bash
# Configuration at top
PROJECT_NAME="tls-portal"
PROJECT_DIR="/Users/josephleon/repos/$PROJECT_NAME"

# Clear section headers
echo -e "${GREEN}=== TLS Portal Project Initialization ===${NC}"

# Step-by-step progress
echo -e "\n${YELLOW}Checking prerequisites...${NC}"
# ... checks ...

echo -e "\n${YELLOW}Creating project structure...${NC}"
# ... creation ...
```

### Graceful Shutdown
From development scripts:
```bash
# Trap Ctrl+C
trap 'echo -e "\n${YELLOW}Shutting down...${NC}"; kill $(jobs -p); exit' INT

# Start background processes
yarn dev:backend &
yarn dev:frontend &

# Wait for all background jobs
wait
```

## Deployment Evolution Patterns

### What We Learned
- Single production environment (YAGNI - removed staging)
- Direct Cloud Run deployment with confirmation prompts
- Hardcoded gcloud path handling for local SDK installations

### Why This Works
- Eliminates staging complexity that wasn't needed
- User confirmation prevents accidental production deploys
- Flexible gcloud detection handles different install methods

### Implementation Pattern
```bash
# Find gcloud command with fallback to common locations
GCLOUD_CMD=""
if command -v gcloud >/dev/null 2>&1; then
    GCLOUD_CMD="gcloud"
elif [ -x "/Users/josephleon/google-cloud-sdk/bin/gcloud" ]; then
    GCLOUD_CMD="/Users/josephleon/google-cloud-sdk/bin/gcloud"
else
    die "Google Cloud SDK not found. Install from https://cloud.google.com/sdk"
fi

# Production deployment confirmation
echo -e "${YELLOW}⚠️  Production Deployment Warning${NC}"
echo "You are about to deploy to PRODUCTION."
read -p "Are you sure? (type 'yes' to confirm): " confirm
if [ "$confirm" != "yes" ]; then
    die "Production deployment cancelled"
fi
```

### Gotchas
- Requires manual "yes" confirmation for production safety
- Hard-coded service account email format assumption
- gcloud SDK installation path varies by platform

This guide emphasizes simplicity and pragmatism, avoiding complex tooling in favor of straightforward bash scripting that's easy to understand and maintain.
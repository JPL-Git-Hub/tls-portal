#!/bin/bash
set -e

# Initialize development tools configuration
# Creates .eslintrc.js, .prettierrc, and .editorconfig

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source libraries
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

# Script marker for idempotency
marker="$project_root/$MARKER_DIR/dev-tools.done"

# Create .eslintrc.js
create_eslintrc() {
    local file="$project_root/.eslintrc.js"
    
    if [ -f "$file" ]; then
        log_info ".eslintrc.js already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    node: true,
    es2020: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    
    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    
    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn'
  },
  ignorePatterns: ['dist', 'build', 'node_modules', '*.config.js']
};
EOF
    
    log_success "Created .eslintrc.js"
}

# Create .prettierrc
create_prettierrc() {
    local file="$project_root/.prettierrc"
    
    if [ -f "$file" ]; then
        log_info ".prettierrc already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
EOF
    
    log_success "Created .prettierrc"
}

# Create .editorconfig
create_editorconfig() {
    local file="$project_root/.editorconfig"
    
    if [ -f "$file" ]; then
        log_info ".editorconfig already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
# EditorConfig is awesome: https://EditorConfig.org

# top-most EditorConfig file
root = true

# Unix-style newlines with a newline ending every file
[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

# Markdown files
[*.md]
trim_trailing_whitespace = false

# Package files
[{package.json,*.yml}]
indent_size = 2

# Makefiles
[Makefile]
indent_style = tab
EOF
    
    log_success "Created .editorconfig"
}

# Main function
main() {
    section "Development Tools Initialization"
    
    # Check if already completed
    if is_completed "$marker" && ! is_force "$@"; then
        log_warn "Development tools already initialized. Use --force to recreate."
        return 0
    fi
    
    # Create configuration files
    create_eslintrc
    create_prettierrc
    create_editorconfig
    
    # Mark as completed
    mark_completed "$marker"
    
    log_success "Development tools initialization completed!"
}

# Run main function
main "$@"

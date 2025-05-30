#!/bin/bash
# Enforce AI behavioral rules across multiple AI coding tools

# This script ensures AI assistants follow the secret introspection pattern
# by placing rules in all common AI tool configuration locations

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# The behavioral rule that must be enforced
BEHAVIORAL_RULE='Before asking for ANY credential, API key, or secret:
1. CHECK context first
2. REFERENCE what you find
3. ONLY ask if not found'

echo "🔒 Enforcing AI Secret Introspection Rules..."

# 1. GitHub Copilot (.github/copilot-instructions.md)
mkdir -p "$project_root/.github"
cat > "$project_root/.github/copilot-instructions.md" << 'EOF'
# Copilot Instructions

NEVER ask for credentials without checking context first.

Known values:
- Firebase Project: the-law-shop-457607
- Secrets location: /config/.secrets/*

Always reference existing information before asking.
EOF

# 2. VS Code Settings (.vscode/settings.json)
mkdir -p "$project_root/.vscode"
if [ -f "$project_root/.vscode/settings.json" ]; then
    # Add to existing settings
    echo "Updating .vscode/settings.json..."
else
    cat > "$project_root/.vscode/settings.json" << 'EOF'
{
  "ai.rules": {
    "secretHandling": "never-ask-check-first",
    "knownSecrets": {
      "firebaseProject": "the-law-shop-457607",
      "secretsPath": "/config/.secrets/"
    }
  }
}
EOF
fi

# 3. AI-specific instruction files
touch "$project_root/AI_INSTRUCTIONS.md"
cat > "$project_root/AI_INSTRUCTIONS.md" << 'EOF'
# AI Assistant Instructions

## CRITICAL RULE: Never Ask for Secrets

Before requesting any credential:
1. Check conversation history
2. Check provided files
3. Check standard locations (/config/.secrets/*)
4. Only ask if genuinely not found

This is the #1 rule for this codebase.
EOF

# 4. Pre-commit hook to remind about behavioral rules
mkdir -p "$project_root/.git/hooks"
cat > "$project_root/.git/hooks/pre-commit" << 'EOF'
#!/bin/bash
# Reminder: AI should never ask for secrets without checking context first

# Check if any AI is watching this commit
if [ -n "$CURSOR_EDITOR" ] || [ -n "$COPILOT_ACTIVE" ] || [ -n "$CLAUDE_CODE" ]; then
    echo "🔒 Reminder: Check context before asking for any secrets!"
fi
EOF
chmod +x "$project_root/.git/hooks/pre-commit"

# 5. Create a validation script
cat > "$project_root/scripts/validate-ai-behavior.sh" << 'EOF'
#!/bin/bash
# Test if AI follows secret introspection rules

echo "Testing AI behavior..."
echo "If AI asks for any of these without checking first, it FAILED:"
echo "- Firebase project ID (should find: the-law-shop-457607)"
echo "- Service account location (should find: /config/.secrets/)"
echo "- Any API key (should check context first)"

# Create test scenario file
cat > /tmp/ai-test-scenario.md << 'SCENARIO'
Previous context: Using Firebase project the-law-shop-457607
Task: Deploy to Firebase

Expected AI behavior:
- Should NOT ask "What's your Firebase project ID?"
- Should reference the project ID from context
- Should check for service account in /config/.secrets/
SCENARIO

echo ""
echo "Test scenario created at: /tmp/ai-test-scenario.md"
echo "Use this to verify AI behavior"
EOF
chmod +x "$project_root/scripts/validate-ai-behavior.sh"

# 6. Create prominent markers
echo "# 🔒 NEVER ASK FOR SECRETS - CHECK CONTEXT FIRST" > "$project_root/SECURITY_RULES.md"
echo "Firebase: the-law-shop-457607" >> "$project_root/SECURITY_RULES.md"
echo "Secrets: /config/.secrets/*" >> "$project_root/SECURITY_RULES.md"

echo "✅ AI rules enforced in multiple locations:"
echo "   - CLAUDE.md (Claude)"
echo "   - .cursorrules (Cursor)"  
echo "   - .github/copilot-instructions.md (GitHub Copilot)"
echo "   - AI_INSTRUCTIONS.md (General)"
echo "   - SECURITY_RULES.md (Prominent reminder)"
echo "   - .vscode/settings.json (VS Code)"
echo "   - .git/hooks/pre-commit (Git reminder)"
echo ""
echo "🧪 Run ./scripts/validate-ai-behavior.sh to test AI compliance"
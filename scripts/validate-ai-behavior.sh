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

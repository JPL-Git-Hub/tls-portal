#!/bin/bash
# Check for TODO/FIXME/HACK comments in source code
# This script is intentionally kept for manual checks even though warnings are silenced

echo "Checking for TODO/FIXME/HACK comments..."
echo "Note: These warnings are silenced in ESLint. See config/quieted-errors.md"
echo ""

# Search only in source files, excluding node_modules and build directories
grep -rn "TODO\|FIXME\|HACK" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=build \
  . 2>/dev/null | head -20

count=$(grep -r "TODO\|FIXME\|HACK" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=build \
  . 2>/dev/null | wc -l)

echo ""
echo "Total TODO/FIXME/HACK comments: $count"
echo ""
echo "These are tracked in task management. Run 'yarn todo:read' to see tasks."
#!/bin/bash
# Generate AI context report including quieted errors and TODOs
# This can be piped to Claude via MCP server or included in AI instructions

set -e

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"
output_file="$project_root/.ai-context/current-state.md"

# Create AI context directory
mkdir -p "$project_root/.ai-context"

# Generate the report
cat > "$output_file" << 'EOF'
# AI Context Report
Generated: $(date)

## Quieted Errors & TODOs

EOF

# Add quieted errors content
if [ -f "$project_root/config/quieted-errors.md" ]; then
    echo "### From Quieted Errors File:" >> "$output_file"
    cat "$project_root/config/quieted-errors.md" >> "$output_file"
    echo "" >> "$output_file"
fi

# Search for actual TODOs
echo "### Current TODO/FIXME/HACK in Source:" >> "$output_file"
echo '```' >> "$output_file"
grep -rn "TODO\|FIXME\|HACK" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=build \
  "$project_root" 2>/dev/null || echo "No TODOs found in source" >> "$output_file"
echo '```' >> "$output_file"

# Add current task list if available
echo "" >> "$output_file"
echo "### Current Task List:" >> "$output_file"
echo "Run 'yarn todo:read' or check TodoRead tool for current tasks" >> "$output_file"

# Add any linting errors that are suppressed
echo "" >> "$output_file"
echo "### Suppressed Linting Rules:" >> "$output_file"
if [ -f "$project_root/.eslintrc.json" ]; then
    echo '```json' >> "$output_file"
    grep -A2 -B2 '"off"' "$project_root/.eslintrc.json" 2>/dev/null || echo "No rules turned off" >> "$output_file"
    echo '```' >> "$output_file"
fi

echo "" >> "$output_file"
echo "---" >> "$output_file"
echo "This report is auto-generated for AI context awareness" >> "$output_file"

echo "AI context report generated at: $output_file"
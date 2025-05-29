#!/bin/bash
set -e

echo "🚀 Testing Frontend Only"
echo "======================="

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_dir"

# Check if node_modules exists in pages
if [ ! -d "src/pages/node_modules" ]; then
  echo "❌ Pages node_modules missing. Running yarn install..."
  yarn install
fi

# Start frontend
echo "Starting frontend on port 3000..."
cd src/pages
npx vite --host
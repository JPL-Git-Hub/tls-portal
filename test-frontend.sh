#!/bin/bash
set -e

echo "🚀 Testing Frontend Only"
echo "======================="

cd /Users/josephleon/repos/tls-portal

# Check if node_modules exists in pages
if [ ! -d "src/pages/node_modules" ]; then
  echo "❌ Pages node_modules missing. Running yarn install..."
  yarn install
fi

# Start frontend
echo "Starting frontend on port 3000..."
cd src/pages
npx vite --host
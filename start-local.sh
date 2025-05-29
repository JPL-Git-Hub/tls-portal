#!/bin/bash
set -e

echo "🚀 Starting TLS Portal Local Development Environment"
echo "=================================================="

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_dir"

# Parse command line arguments
NO_BROWSER=false
for arg in "$@"; do
  case $arg in
    --no-browser)
      NO_BROWSER=true
      shift
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --no-browser    Don't open browser automatically"
      echo "  --help          Show this help message"
      exit 0
      ;;
  esac
done

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source Java utilities
source "$SCRIPT_DIR/scripts/lib/utils.sh"
source "$SCRIPT_DIR/scripts/lib/java.sh"

# Setup Java environment
if ! setup_java 11; then
  echo "❌ Java 11 or higher is required for Firebase emulators"
  exit 1
fi

# Validate environment
echo "🔍 Validating environment..."
if [ ! -f .env ]; then
  echo "❌ Missing .env file. Creating from template..."
  cat > .env << EOF
NODE_ENV=development
PORT=3001
FIREBASE_PROJECT_ID=the-law-shop-457607
ALLOWED_ORIGINS=http://localhost:3000
DOMAIN=localhost

# Firebase Emulator Settings
USE_EMULATOR=true
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
EOF
  echo "✅ Created .env file with default values"
fi

# Check required environment variables
source .env
if [ -z "$FIREBASE_PROJECT_ID" ]; then
  echo "❌ FIREBASE_PROJECT_ID not set in .env"
  exit 1
fi

# Step 1: Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "firebase emulators" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
lsof -ti:3000 -ti:3001 -ti:4000 -ti:8080 -ti:9099 -ti:9199 | xargs kill -9 2>/dev/null || true
sleep 2

# Step 2: Start Firebase emulators
echo "🔥 Starting Firebase emulators..."
firebase emulators:start --only auth,firestore,storage > firebase-emulators.log 2>&1 &
EMULATOR_PID=$!

# Wait for emulators to be ready
echo "⏳ Waiting for emulators to start..."
MAX_WAIT=30
WAIT=0
while [ $WAIT -lt $MAX_WAIT ]; do
  if curl -s http://localhost:4000 > /dev/null 2>&1; then
    echo "✅ Emulators ready!"
    break
  fi
  sleep 1
  WAIT=$((WAIT + 1))
done

if [ $WAIT -eq $MAX_WAIT ]; then
  echo "❌ Emulators failed to start. Check firebase-emulators.log"
  exit 1
fi

# Step 3: Start dev servers
echo "🚀 Starting development servers..."
yarn dev &
DEV_PID=$!

# Wait for servers to be ready
echo "⏳ Waiting for servers to start..."
WAIT=0
while [ $WAIT -lt $MAX_WAIT ]; do
  if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend ready!"
    break
  fi
  sleep 1
  WAIT=$((WAIT + 1))
done

echo ""
echo "✨ Everything is ready!"
echo ""
echo "📝 Access points:"
echo "  - Frontend:     http://localhost:3000"
echo "  - Backend API:  http://localhost:3001"
echo "  - Emulator UI:  http://localhost:4000"
echo ""

# Open browser if not disabled
if [ "$NO_BROWSER" = false ]; then
  echo "🌐 Opening browser..."
  # Wait a moment for frontend to fully initialize
  sleep 2
  
  # Cross-platform browser opening
  if command -v open >/dev/null 2>&1; then
    # macOS
    open "http://localhost:3000"
  elif command -v xdg-open >/dev/null 2>&1; then
    # Linux
    xdg-open "http://localhost:3000"
  elif command -v start >/dev/null 2>&1; then
    # Windows (Git Bash)
    start "http://localhost:3000"
  else
    echo "⚠️  Could not open browser automatically. Please open http://localhost:3000 manually."
  fi
fi

echo "🛑 Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
  echo ""
  echo "🛑 Shutting down..."
  kill $EMULATOR_PID 2>/dev/null || true
  kill $DEV_PID 2>/dev/null || true
  pkill -f "firebase emulators" 2>/dev/null || true
  pkill -f "nodemon" 2>/dev/null || true
  pkill -f "vite" 2>/dev/null || true
  echo "👋 Goodbye!"
}

# Set up cleanup on exit
trap cleanup EXIT INT TERM

# Keep script running
wait
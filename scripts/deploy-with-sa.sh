#!/bin/bash
set -e

# Deploy using existing service account credentials
cd "$(dirname "$0")/.."

echo "🚀 Deploying to Firebase (removing That-Which-Shall-Not-Be-Named)..."

# Set up credentials
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/gcloud/legacy_credentials/josephleon@thelawshop.com/adc.json"

# Build
echo "📦 Building clean version..."
cd src/pages && yarn build && cd ../..

# Deploy with firebase using service account
echo "☁️ Deploying to Firebase Hosting..."
npx firebase-tools deploy --only hosting --project the-law-shop-457607

echo "✅ Deployed! The site is now clean."
echo "🔄 Clear Cloudflare cache if needed"
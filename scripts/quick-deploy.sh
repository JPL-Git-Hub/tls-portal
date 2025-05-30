#!/bin/bash
set -e

# Quick deploy without Firebase CLI drama
cd "$(dirname "$0")/.."

echo "🚀 Deploying to thelawshop.com (removing Tally)..."

# 1. Build
echo "📦 Building..."
cd src/pages && yarn build

# 2. Copy to tls-public
echo "📁 Copying to tls-public..."
mkdir -p /Users/josephleon/repos/tls-public
cp -r dist/* /Users/josephleon/repos/tls-public/

# 3. Create a simple deploy using gsutil (part of gcloud)
echo "☁️  Uploading to Google Cloud Storage..."
gsutil -m rsync -r -d dist/ gs://the-law-shop-457607.appspot.com/

echo "✅ Deployed! Tally is gone from thelawshop.com"
echo "🔄 Clear Cloudflare cache if needed"
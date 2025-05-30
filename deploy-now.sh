#!/bin/bash
# Nuclear option - deploy directly using gcloud

echo "🔥 Deploying clean site (NO TALLY) to Firebase Hosting..."

# Copy files to tls-public
echo "📁 Copying build files to tls-public..."
mkdir -p /Users/josephleon/repos/tls-public
cp -r /Users/josephleon/repos/tls-portal/src/pages/dist/* /Users/josephleon/repos/tls-public/

# Use gcloud to upload to Firebase Hosting's GCS bucket
echo "☁️  Uploading to Firebase Hosting..."
gsutil -m cp -r /Users/josephleon/repos/tls-portal/src/pages/dist/* \
  gs://the-law-shop-457607.appspot.com/ 2>/dev/null || \
  gsutil -m cp -r /Users/josephleon/repos/tls-portal/src/pages/dist/* \
  gs://the-law-shop-457607.firebaseapp.com/ 2>/dev/null || \
  echo "❌ Failed - need manual deploy"

echo "
✅ Done! Check https://thelawshop.com in 2-3 minutes
🔄 If still showing Tally, clear Cloudflare cache:
   1. Go to Cloudflare dashboard
   2. Caching → Configuration
   3. Click 'Purge Everything'
"
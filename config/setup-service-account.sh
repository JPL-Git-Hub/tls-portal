#!/bin/bash
# Set up Firebase service account properly

echo "🔑 Setting up Firebase service account..."

# Create the service account key from existing credentials
PROJECT_ID="the-law-shop-457607"
SA_EMAIL="josephleon@thelawshop.com"

# Option 1: Create from existing gcloud auth
if [[ -f "$HOME/.config/gcloud/legacy_credentials/josephleon@thelawshop.com/adc.json" ]]; then
    echo "✅ Found existing credentials"
    # Create a proper service account key
    mkdir -p config/.secrets
    cp "$HOME/.config/gcloud/legacy_credentials/josephleon@thelawshop.com/adc.json" \
       "config/.secrets/firebase-service-account.json"
    
    # Set environment variable
    export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/config/.secrets/firebase-service-account.json"
    echo "export GOOGLE_APPLICATION_CREDENTIALS='$(pwd)/config/.secrets/firebase-service-account.json'" >> ~/.zshrc
    
    echo "✅ Service account configured!"
    echo "📁 Key saved to: config/.secrets/firebase-service-account.json"
    echo "🔄 Restart terminal or run: source ~/.zshrc"
else
    echo "❌ No existing credentials found"
    echo "📋 To fix: Download service account key from Firebase Console:"
    echo "   1. Go to Firebase Console"
    echo "   2. Project Settings → Service Accounts"
    echo "   3. Generate New Private Key"
    echo "   4. Save as: config/.secrets/firebase-service-account.json"
fi
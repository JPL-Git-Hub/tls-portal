#!/bin/bash
set -e

# Deployment script for TLS Portal
# Simple production deployment - no staging needed (YAGNI)

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source libraries
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

# Configuration
PROD_PROJECT="tls-portal-prod"
REGION="us-central1"
SERVICE_NAME="tls-portal"

# Usage function
usage() {
    echo "Usage: $0 prod"
    echo "  prod - Deploy to production environment"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    section "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker >/dev/null 2>&1; then
        die "Docker is required but not installed"
    fi
    
    # Check gcloud
    if ! command -v gcloud >/dev/null 2>&1; then
        die "Google Cloud SDK is required but not installed"
    fi
    
    log_success "Prerequisites satisfied"
}

# Build container
build_container() {
    section "Building Docker Container"
    
    cd "$project_root"
    
    # Build the container
    log_info "Building container..."
    docker build -t $SERVICE_NAME:latest . || die "Docker build failed"
    
    log_success "Container built successfully"
}

# Deploy to production
deploy_production() {
    section "Deploying to Production"
    
    # Confirm production deployment
    echo -e "${YELLOW}⚠️  Production Deployment Warning${NC}"
    echo "You are about to deploy to PRODUCTION."
    read -p "Are you sure? (type 'yes' to confirm): " confirm
    if [ "$confirm" != "yes" ]; then
        die "Production deployment cancelled"
    fi
    
    # Tag for production
    local image_tag="gcr.io/$PROD_PROJECT/$SERVICE_NAME:latest"
    docker tag $SERVICE_NAME:latest $image_tag
    
    # Push to registry
    log_info "Pushing to Google Container Registry..."
    docker push $image_tag || die "Failed to push image"
    
    # Deploy to Cloud Run
    log_info "Deploying to Cloud Run..."
    gcloud run deploy $SERVICE_NAME \
        --image $image_tag \
        --platform managed \
        --region $REGION \
        --project $PROD_PROJECT \
        --allow-unauthenticated \
        --service-account="$SERVICE_NAME@$PROD_PROJECT.iam.gserviceaccount.com" \
        --min-instances 1 \
        --max-instances 100 \
        --set-env-vars="NODE_ENV=production,FIREBASE_PROJECT_ID=$PROD_PROJECT,DOMAIN=thelawshop.com" \
        --set-secrets="FIREBASE_SERVICE_ACCOUNT=firebase-service-account:latest" \
        --memory=512Mi \
        --cpu=1 \
        || die "Cloud Run deployment failed"
    
    # Get service URL
    local service_url=$(gcloud run services describe $SERVICE_NAME \
        --platform managed \
        --region $REGION \
        --project $PROD_PROJECT \
        --format 'value(status.url)')
    
    log_success "Deployed to production: $service_url"
    log_info "Remember to update Cloudflare DNS if needed"
}

# Health check
health_check() {
    local url=$1
    section "Running Health Check"
    
    log_info "Checking $url/health..."
    
    # Wait for service to be ready
    sleep 5
    
    # Check health endpoint
    if curl -s "$url/health" | grep -q "healthy"; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
    fi
}

# Main function
main() {
    local environment=$1
    
    if [ -z "$environment" ] || [ "$environment" != "prod" ]; then
        usage
    fi
    
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}       TLS Portal Production Deployment             ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo
    
    check_prerequisites
    build_container
    deploy_production
    
    log_success "Deployment completed!"
}

# Run main function
main "$@"
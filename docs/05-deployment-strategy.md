# TLS Portal Deployment Strategy

## Overview

This document defines the deployment strategy for the TLS Portal system, clarifying the deployment targets, environments, and processes to eliminate confusion between local and remote deployments.

## Deployment Environments

### 1. Local Development (Firebase Emulator)
**Purpose**: Development and testing without cloud costs
**Target**: Local machine with Firebase emulators
**Scripts**: `./scripts/dev-firebase.sh`, `./scripts/start-emulators.sh`
**Access**: http://localhost:3000 (app), http://localhost:4000 (emulator UI)

### 2. Staging Environment
**Purpose**: Integration testing and client previews
**Target**: Google Cloud Run + Firebase services
**Access**: https://staging-tls-portal-*.run.app

### 3. Production Environment
**Purpose**: Live client portals
**Target**: Google Cloud Run + Firebase services
**Domain**: https://*.thelawshop.com

## Service Architecture

### Frontend Application (React)
- **Local**: Vite dev server on port 3000
- **Remote**: Served by Express from Cloud Run container
- **Why**: Simplified deployment, better performance, unified routing

### Backend API (Express)
- **Local**: Node.js server on port 3001
- **Remote**: Cloud Run container with auto-scaling
- **Why**: Serverless scaling, integrated monitoring, cost efficiency

### Firebase Services
- **Firestore**: Document database for client data
- **Authentication**: User authentication and session management
- **Storage**: Document and file storage (future)
- **Local Alternative**: Firebase emulators for all services

## Deployment Targets Clarification

### Why Cloud Run Instead of Firebase Hosting?

1. **Monolith Architecture**: Our modular monolith design requires server-side processing
2. **Subdomain Routing**: Dynamic subdomain handling needs server logic
3. **API Integration**: Backend and frontend in single container simplifies deployment
4. **Cost Efficiency**: Pay-per-request model ideal for multiple low-traffic portals

### When to Use Firebase Services

- **Firestore**: Always - for data persistence
- **Authentication**: Always - for user management
- **Hosting**: Never - Cloud Run serves all HTTP traffic
- **Functions**: Never - Express handles all API logic

## Environment Configuration

### Environment Variables Strategy

```bash
# Local Development (.env)
FIREBASE_PROJECT_ID=the-law-shop-457607
USE_EMULATOR=true
FIRESTORE_EMULATOR_HOST=localhost:8080
AUTH_EMULATOR_HOST=localhost:9099

# Staging (.env.staging)
FIREBASE_PROJECT_ID=tls-portal-staging
USE_EMULATOR=false
GOOGLE_CLOUD_PROJECT=tls-portal-staging

# Production (.env.production)
FIREBASE_PROJECT_ID=tls-portal-prod
USE_EMULATOR=false
GOOGLE_CLOUD_PROJECT=tls-portal-prod
```

### Secrets Management

- **Local**: .env files (git-ignored)
- **Remote**: Google Secret Manager
- **Access**: Service account with minimal permissions

## DNS and Domain Configuration

### Cloudflare Requirements

**Production deployment requires Cloudflare for DNS management:**

1. **Domain Setup**
   - Point `thelawshop.com` to Cloudflare nameservers
   - Configure wildcard subdomain (`*.thelawshop.com`) to point to Cloud Run load balancer
   - Enable Cloudflare proxy for DDoS protection and SSL

2. **SSL/TLS Configuration**
   - Use Cloudflare's Universal SSL for automatic HTTPS
   - Set SSL/TLS encryption mode to "Full (strict)"
   - Enable "Always Use HTTPS" and HSTS

3. **Subdomain Routing**
   - Wildcard DNS record: `*.thelawshop.com` → Cloud Run service IP
   - Cloud Run handles subdomain routing via express-subdomain
   - Each client portal accessible at `[subdomain].thelawshop.com`

4. **Performance & Security**
   - Enable Cloudflare caching for static assets
   - Configure firewall rules for rate limiting
   - Set up page rules for subdomain handling

## Deployment Process

### Local Development Workflow

```bash
# Start everything locally
./scripts/dev-firebase.sh

# Or start components separately
./scripts/start-emulators.sh  # Firebase emulators only
./scripts/dev.sh              # App without emulators
```

### Staging Deployment Workflow

```bash
# 1. Build container
yarn docker:build

# 2. Tag for staging
docker tag tls-portal:latest gcr.io/tls-portal-staging/tls-portal:latest

# 3. Push to registry
docker push gcr.io/tls-portal-staging/tls-portal:latest

# 4. Deploy to Cloud Run
gcloud run deploy tls-portal \
  --image gcr.io/tls-portal-staging/tls-portal:latest \
  --region us-central1 \
  --project tls-portal-staging
```

### Production Deployment Workflow

```bash
# 1. Tag staging image for production
docker tag gcr.io/tls-portal-staging/tls-portal:stable \
           gcr.io/tls-portal-prod/tls-portal:latest

# 2. Push to production registry
docker push gcr.io/tls-portal-prod/tls-portal:latest

# 3. Deploy to Cloud Run
gcloud run deploy tls-portal \
  --image gcr.io/tls-portal-prod/tls-portal:latest \
  --region us-central1 \
  --project tls-portal-prod \
  --min-instances 1 \
  --max-instances 100
```

## Recommended Script Improvements

### 1. Unified Deployment Script
Create `scripts/deploy.sh` that handles all environments:

```bash
# Usage examples:
./scripts/deploy.sh local     # Start local with emulators
./scripts/deploy.sh staging   # Deploy to staging
./scripts/deploy.sh prod      # Deploy to production

# Features to include:
- Environment validation
- Prerequisites checking
- Automatic project switching
- Build verification
- Deployment confirmation
- Rollback capability
```

### 2. Environment Switcher
Create `scripts/switch-env.sh` to manage configurations:

```bash
# Usage:
./scripts/switch-env.sh staging

# Should handle:
- Copy appropriate .env file
- Update gcloud project
- Set Firebase project
- Verify credentials
```

### 3. Health Check Script
Create `scripts/health-check.sh` for post-deployment validation:

```bash
# Check all services are running
- Frontend accessibility
- API health endpoint
- Firebase connectivity
- Subdomain routing
```

## CI/CD Pipeline Recommendations

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]     # Auto-deploy to staging
    tags: ['v*']         # Auto-deploy to production

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/main'
    steps:
      - Build and test
      - Deploy to staging
      - Run health checks
      
  deploy-production:
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - Build and test
      - Deploy to production
      - Run health checks
      - Create release notes
```

## Common Pitfalls to Avoid

1. **Don't Mix Environments**
   - Never use production Firebase project with emulators
   - Always verify project ID before deployment
   - Use separate service accounts per environment

2. **Don't Deploy Without Testing**
   - Always run `yarn test` before deployment
   - Verify build completes successfully
   - Check environment variables are set

3. **Don't Forget Secrets**
   - Update Secret Manager before deploying new features
   - Rotate secrets regularly
   - Never commit secrets to repository

4. **Don't Skip Health Checks**
   - Always verify deployment succeeded
   - Test subdomain routing works
   - Confirm Firebase connectivity

## Migration Path

### Current State → Target State

1. **Phase 1**: Document current manual process (this document)
2. **Phase 2**: Create unified deployment script
3. **Phase 3**: Implement staging environment
4. **Phase 4**: Add CI/CD automation
5. **Phase 5**: Implement monitoring and alerts

## Monitoring and Observability

### Key Metrics to Track
- Cloud Run request latency
- Firebase operation costs
- Active portal count
- Error rates by service

### Recommended Tools
- Google Cloud Monitoring for infrastructure
- Firebase Performance Monitoring for client-side
- Error tracking with Cloud Error Reporting
- Custom dashboards for business metrics

## Security Considerations

1. **Network Security**
   - Cloud Run services only accept HTTPS
   - Firebase Security Rules enforce tenant isolation
   - CORS configured for subdomain access only

2. **Access Control**
   - Separate service accounts per environment
   - Minimal IAM permissions
   - Regular access audits

3. **Secret Rotation**
   - Quarterly rotation for all secrets
   - Automated alerts for expiring certificates
   - Version tracking in Secret Manager

## Cost Optimization

1. **Cloud Run Settings**
   - Min instances: 0 (staging), 1 (production)
   - Max instances: Based on portal count
   - CPU allocation: Only during request processing

2. **Firebase Optimization**
   - Firestore indexes for common queries
   - Security rules to prevent excessive reads
   - Monitoring for unusual usage patterns

## Future Considerations

1. **Multi-Region Deployment**
   - Deploy to multiple regions for lower latency
   - Use Cloud Load Balancing for traffic distribution
   - Implement data replication strategy

2. **Blue-Green Deployments**
   - Zero-downtime deployments
   - Instant rollback capability
   - A/B testing support

3. **Infrastructure as Code**
   - Terraform for Cloud resources
   - Automated environment provisioning
   - Version-controlled infrastructure

## Conclusion

This deployment strategy prioritizes:
- **Clarity**: Clear separation between local and remote deployments
- **Safety**: Multiple environments with proper isolation
- **Efficiency**: Automated processes where possible
- **Scalability**: Architecture that grows with portal count

Following this strategy will eliminate deployment confusion and establish a reliable, repeatable deployment process.

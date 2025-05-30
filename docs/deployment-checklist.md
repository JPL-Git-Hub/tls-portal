# Production Deployment Checklist

## Pre-Deployment Requirements

### 1. Environment Configuration ✓
- [x] Production environment file (`config/prod.env`)
- [x] Frontend production config (`src/pages/.env.production`)
- [ ] Update Firebase web API key in `.env.production`
- [ ] Set production JWT secret in Google Secrets Manager

### 2. Secrets & Credentials
- [x] Firebase service account (`config/.secrets/firebase-service-account.json`)
- [ ] Stripe production keys (`config/.secrets/stripe-keys.env`)
  ```bash
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_PUBLISHABLE_KEY=pk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- [ ] Cloudflare API credentials (`config/.secrets/cloudflare.env`)
  ```bash
  CLOUDFLARE_API_TOKEN=...
  CLOUDFLARE_ZONE_ID=...
  ```
- [ ] SendGrid API key (`config/.secrets/sendgrid.env`)

### 3. Firebase Configuration
- [x] Firebase project created (`the-law-shop-457607`)
- [x] Firestore rules defined
- [ ] Firestore indexes deployed
- [ ] Firebase Authentication enabled
- [ ] Firebase Storage rules configured
- [ ] Cloud Functions billing enabled

### 4. Domain & DNS
- [ ] Domain verified in Firebase Hosting
- [ ] Cloudflare DNS configured
- [ ] SSL certificate active
- [ ] Wildcard subdomain setup (`*.thelawshop.com`)

### 5. Code Readiness
- [ ] All tests passing
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Loading states for all async operations
- [ ] Mobile responsive design verified

### 6. Security
- [x] Firestore security rules reviewed
- [ ] API rate limiting configured
- [ ] CORS settings verified
- [ ] Input validation on all forms
- [ ] XSS protection verified

## Deployment Steps

### 1. Initial Setup (One-time)
```bash
# Set up Cloudflare DNS
./scripts/setup-cloudflare.sh

# Verify Firebase project
firebase projects:list

# Add custom domain to Firebase Hosting
firebase hosting:channel:deploy production
```

### 2. Deploy Application
```bash
# Run production deployment
./scripts/deploy-production.sh

# This will:
# - Build frontend with production config
# - Deploy Cloud Functions
# - Deploy Firestore rules & indexes
# - Deploy to Firebase Hosting
# - Clear Cloudflare cache
```

### 3. Post-Deployment Verification
- [ ] Main site accessible at https://thelawshop.com
- [ ] Client portals accessible (e.g., https://acme.thelawshop.com)
- [ ] Login functionality working
- [ ] Document upload working
- [ ] Payment processing functional
- [ ] Email notifications sending

### 4. Monitoring Setup
- [ ] Firebase Performance Monitoring enabled
- [ ] Error reporting configured (Sentry/Firebase Crashlytics)
- [ ] Google Analytics configured
- [ ] Uptime monitoring active

## Rollback Plan

If issues arise:

1. **Quick Rollback**
   ```bash
   # Revert to previous Firebase Hosting version
   firebase hosting:rollback
   ```

2. **Full Rollback**
   ```bash
   # Checkout previous git tag
   git checkout tags/v1.0.0
   
   # Redeploy
   ./scripts/deploy-production.sh
   ```

## Production Access

### Firebase Console
- Project: https://console.firebase.google.com/project/the-law-shop-457607
- Hosting: https://console.firebase.google.com/project/the-law-shop-457607/hosting
- Functions: https://console.firebase.google.com/project/the-law-shop-457607/functions
- Firestore: https://console.firebase.google.com/project/the-law-shop-457607/firestore

### Monitoring
- Performance: https://console.firebase.google.com/project/the-law-shop-457607/performance
- Analytics: https://analytics.google.com/
- Cloudflare: https://dash.cloudflare.com/

## Emergency Contacts

- Firebase Support: https://firebase.google.com/support
- Cloudflare Support: https://support.cloudflare.com/
- Stripe Support: https://support.stripe.com/

## Notes

- Always deploy during low-traffic hours
- Monitor error rates for 30 minutes post-deployment
- Keep deployment logs for audit trail
- Update status page if you have one
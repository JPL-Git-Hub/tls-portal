# Cloudflare DNS Setup

## When Cloudflare Updates Happen

Cloudflare DNS is automatically updated:
1. After successful Cloud Run deployment
2. When running `./scripts/google-cloud-deploy.sh prod`

## Required Secrets

Before deployment, ensure these secrets exist in Google Secrets Manager:

```bash
# Get your Zone ID from Cloudflare dashboard
# Domain Overview > API section (right sidebar)
CLOUDFLARE_ZONE_ID=your-zone-id

# Create API token at https://dash.cloudflare.com/profile/api-tokens
# Required permissions: Zone:DNS:Edit
CLOUDFLARE_API_TOKEN=your-api-token
```

## Adding Secrets

```bash
# Push secrets to Google Secrets Manager
./scripts/sync-secrets.sh push
```

## DNS Records

### Managed by Scripts:
- `*.portal.thelawshop.com` → Points to Cloud Run (backend API)

### Managed Separately:
- `portal.thelawshop.com` → Points to Firebase Hosting (frontend)
- This is updated when you run `./scripts/firebase-hosting-deploy.sh`

## Manual Update

If needed, update DNS manually:
```bash
./scripts/update-cloudflare-dns.sh
```

## Troubleshooting

**DNS not updating?**
- Check secrets exist: `gcloud secrets list --project=the-law-shop-457607`
- Verify API token has DNS edit permissions
- Check Zone ID matches your domain

**SSL issues?**
- Cloudflare proxy is enabled (orange cloud)
- SSL mode should be "Full" in Cloudflare dashboard
# Cloudflare + Firebase Hosting: Cache Management

## How It Works

When using Cloudflare in front of Firebase Hosting:

1. **User requests** → Cloudflare Edge → Firebase Hosting
2. **Cloudflare caches** static assets at edge locations worldwide
3. **Updates require** cache purging to show immediately

## Testing Cache Purge

### 1. Deploy to Firebase
```bash
./scripts/deploy-production.sh
```

### 2. Purge Cloudflare Cache
```bash
# Purge everything (recommended after deployment)
./scripts/purge-cloudflare-cache.sh all

# Purge just homepage
./scripts/purge-cloudflare-cache.sh home

# Purge specific URLs
./scripts/purge-cloudflare-cache.sh urls https://thelawshop.com/billing
```

### 3. Verify Update

**Method 1: Browser Check**
- Open incognito/private window
- Visit https://thelawshop.com
- Should see updated content within 30-120 seconds

**Method 2: Direct Firebase Check**
- Visit https://the-law-shop-457607.web.app
- This bypasses Cloudflare entirely
- Compare with main domain

**Method 3: Cache Headers**
```bash
# Check cache status
curl -I https://thelawshop.com | grep -E "(cf-cache-status|age|date)"

# cf-cache-status: HIT = cached, MISS = fresh from origin
# age: seconds since cached
```

## Cache Behavior

### Default Caching
- HTML: 2 hours (can be customized)
- JS/CSS: 1 year (with hashed filenames)
- Images: 1 month
- API calls: Not cached

### After Purge
- All edge locations marked as stale
- Next request fetches fresh from Firebase
- New content propagates globally

## Troubleshooting

### Content Not Updating?

1. **Check Firebase directly**
   ```bash
   curl https://the-law-shop-457607.web.app
   ```

2. **Verify Cloudflare purge worked**
   ```bash
   # Should return success
   ./scripts/purge-cloudflare-cache.sh all
   ```

3. **Check browser cache**
   - Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (PC)
   - Or use incognito mode

4. **Check Cloudflare settings**
   - Dashboard → Caching → Configuration
   - Ensure "Cache Level" is Standard
   - Check Page Rules for overrides

### Recommended Page Rules

1. **Cache Everything for Assets**
   - URL: `*thelawshop.com/assets/*`
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month

2. **Bypass Cache for API**
   - URL: `*thelawshop.com/api/*`
   - Cache Level: Bypass

3. **Short Cache for HTML**
   - URL: `*thelawshop.com/*.html`
   - Cache Level: Standard
   - Browser Cache TTL: 2 hours

## Automation

The deployment script automatically purges cache:
```bash
./scripts/deploy-production.sh
# Deploys to Firebase
# Then purges Cloudflare cache
# Shows verification steps
```

## Best Practices

1. **Always purge after deployment** - Ensures users see latest
2. **Use versioned assets** - JS/CSS with hash in filename
3. **Set appropriate TTLs** - Balance performance vs freshness
4. **Monitor cache hit ratio** - Cloudflare Analytics
5. **Test in incognito** - Avoids local browser cache

## Quick Commands

```bash
# Full deployment with cache purge
./scripts/deploy-production.sh

# Just purge cache
./scripts/purge-cloudflare-cache.sh all

# Check if content is cached
curl -I https://thelawshop.com | grep cf-cache-status
```
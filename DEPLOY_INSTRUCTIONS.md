# Deploy Clean Site (No References to The-System-That-Shall-Not-Be-Named)

The clean build is ready at: `src/pages/dist/`

## Quick Deploy (2 minutes)

1. Open terminal and run:
```bash
cd /Users/josephleon/repos/tls-portal
firebase login
firebase deploy --only hosting
```

2. Clear Cloudflare cache:
   - Go to Cloudflare dashboard
   - Caching → Configuration → Purge Everything

## The files are already:
- ✅ Built with clean HTML
- ✅ No external forms
- ✅ No tracking scripts
- ✅ Pure React form
- ✅ Copied to `/Users/josephleon/repos/tls-public/`

## Alternative: Manual Upload
If Firebase CLI continues to be problematic:
1. Go to Firebase Console
2. Hosting → Files
3. Upload contents of `src/pages/dist/`

The system will be completely clean after deployment.
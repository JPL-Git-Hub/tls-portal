# TLS Portal

Client portal system for law firms.

## Start Here

```bash
./scripts/init-all.sh        # First time setup
./scripts/firebase-dev-env.sh  # Start local development
```

## Docs

Everything is in the `docs/` folder.

## Deploy

```bash
git push origin main                     # Deploys automatically via GitHub Actions
```

For manual deployment (emergency only):
```bash
./scripts/google-cloud-deploy.sh prod --force
```

**Use Yarn only**. Never use npm.
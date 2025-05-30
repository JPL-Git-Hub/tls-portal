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
./scripts/firebase-hosting-deploy.sh     # Frontend to portal.thelawshop.com
./scripts/google-cloud-deploy.sh prod    # Backend API to *.portal.thelawshop.com
```

**Use Yarn only**. Never use npm.
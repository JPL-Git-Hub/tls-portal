# Configuration Management Guide

## Overview

This project uses a DRY (Don't Repeat Yourself) approach to configuration management. We have one template that defines all required variables, which is then used to create environment-specific config files.

## File Structure

```
config/
├── env.template            # Master template defining all required variables
├── dev.env                 # Development environment values
├── prod.env                # Production environment values
└── secrets-values.template # Template for Google Secrets Manager
```

## How It Works

### 1. Single Template Pattern

`env.template` serves as the single source of truth for what configuration variables the application needs:

```bash
# From env.template
NODE_ENV=development|staging|production
PORT=3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
```

### 2. Environment-Specific Files

Copy `env.template` to create environment-specific files:

#### Development (dev.env)
```bash
NODE_ENV=development
PORT=3000
FIREBASE_PROJECT_ID=tls-portal-dev
FIREBASE_API_KEY=test-api-key-123
```

#### Production (prod.env)
```bash
NODE_ENV=production
PORT=8080
FIREBASE_PROJECT_ID=tls-portal-prod
FIREBASE_API_KEY=real-api-key-456
```

### 3. Why This Pattern?

- **DRY Principle**: One template maintains the list of required variables
- **No Redundancy**: Avoids having `dev.env.template` and `prod.env.template`
- **Clear Structure**: Same variables in each environment, different values
- **Easy Onboarding**: New developers copy one template, not multiple

## Usage

### Setting Up a New Environment

1. Copy the template:
   ```bash
   cp config/env.template config/dev.env
   ```

2. Edit with your environment-specific values:
   ```bash
   vim config/dev.env
   ```

3. Never commit the actual `.env` files (they're in `.gitignore`)

### Adding New Variables

1. Add to `env.template` with a descriptive placeholder:
   ```bash
   NEW_API_URL=https://api-domain.com
   ```

2. Update all environment files (`dev.env`, `prod.env`) with actual values

3. Document the variable in this guide

## Variable Types

### Public Configuration
Safe to store in `.env` files:
- Port numbers
- Public API endpoints
- Feature flags
- Timeout values

### Sensitive Secrets
Should use Google Secrets Manager in production:
- API keys
- Database passwords
- JWT secrets
- Private keys

## Best Practices

1. **Use Descriptive Names**: `DATABASE_URL` not `DB`
2. **Include Units**: `TIMEOUT_SECONDS=30` not `TIMEOUT=30`
3. **Group Related Variables**: All Firebase config together
4. **Comment Complex Values**: Explain format or options
5. **Never Commit Secrets**: Always use `.gitignore`

## Common Patterns

### URL Configuration
```bash
# Template
API_BASE_URL=http://localhost:3001|https://api.example.com

# Dev
API_BASE_URL=http://localhost:3001

# Prod
API_BASE_URL=https://api.thelawshop.com
```

### Feature Flags
```bash
# Template
ENABLE_DEBUG=true|false

# Dev
ENABLE_DEBUG=true

# Prod
ENABLE_DEBUG=false
```

### Service Configuration
```bash
# Template
REDIS_HOST=localhost|redis.example.com
REDIS_PORT=6379

# Dev
REDIS_HOST=localhost
REDIS_PORT=6379

# Prod
REDIS_HOST=redis.thelawshop.com
REDIS_PORT=6379
```

## Security Notes

1. **`.env` files are gitignored** - Never force commit them
2. **Use placeholders in templates** - No real values
3. **Rotate secrets regularly** - Especially API keys
4. **Use Google Secrets Manager** - For production secrets
5. **Limit access** - Only devs who need prod access get `prod.env`

## Troubleshooting

### Missing Variable Errors
- Check you've copied all variables from `env.template`
- Ensure no typos in variable names
- Verify the file is named correctly (`.env` not `.env.txt`)

### Wrong Environment Loading
- Check `NODE_ENV` is set correctly
- Verify the correct `.env` file is being loaded
- Look for hardcoded values overriding env vars

This configuration pattern keeps our setup DRY, clear, and maintainable.
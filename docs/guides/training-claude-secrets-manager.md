# Training Claude to Use gcloud secrets

## The Problem
Claude often asks for secrets instead of checking `gcloud secrets list` first, even when credentials might already be stored there.

## Training Techniques

### 1. **Behavioral Reinforcement in CLAUDE.md**
Add explicit instructions that gcloud secrets is the PRIMARY source:

```markdown
**ALWAYS run gcloud secrets list FIRST before asking for any secret:**
- Project: `the-law-shop-457607`
- Pattern: Need secret → gcloud secrets list → Use it → Never ask
```

### 2. **Concrete Examples**
Show the exact commands Claude should use:

```bash
# Instead of: "What's your Cloudflare API token?"
# Claude should:
gcloud secrets list --project="the-law-shop-457607" | grep -i cloudflare
gcloud secrets versions access latest --secret="CLOUDFLARE_API_TOKEN" --project="the-law-shop-457607"
```

### 3. **Create Helper Scripts**
Make it easier for Claude to check secrets:

```bash
#!/bin/bash
# scripts/check-secret.sh
SECRET_NAME=$1
PROJECT_ID="the-law-shop-457607"

if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" >/dev/null 2>&1; then
    echo "Secret exists! Retrieving..."
    gcloud secrets versions access latest --secret="$SECRET_NAME" --project="$PROJECT_ID"
else
    echo "Secret not found. Add with:"
    echo "echo -n 'value' | gcloud secrets create $SECRET_NAME --data-file=- --project=$PROJECT_ID"
fi
```

### 4. **Update Scripts to Auto-Check**
Modify existing scripts to always try gcloud secrets first:

```bash
# In any script needing secrets:
fetch_from_gcloud_secrets() {
    local secret_name=$1
    if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" >/dev/null 2>&1; then
        gcloud secrets versions access latest --secret="$secret_name" --project="$PROJECT_ID"
    fi
}

# Try gcloud secrets first
CLOUDFLARE_API_TOKEN=$(fetch_from_gcloud_secrets "CLOUDFLARE_API_TOKEN")
```

### 5. **Feedback Loop**
When Claude forgets to check Secrets Manager:

**User**: "Check gcloud secrets first"
**Claude**: "You're right! Let me check gcloud secrets..."
```bash
gcloud secrets list --project="the-law-shop-457607"
```

### 6. **Pattern Recognition**
Help Claude recognize triggers:

- "Deploy" → Run `gcloud secrets list` for deployment secrets
- "Cloudflare" → Check `gcloud secrets list` for CLOUDFLARE_*
- "Stripe" → Check `gcloud secrets list` for STRIPE_*
- "Email" → Check `gcloud secrets list` for SENDGRID_* or GWS_*

### 7. **Success Reinforcement**
When Claude successfully uses gcloud secrets, acknowledge it:
- "Good - you checked gcloud secrets first!"
- This reinforces the correct behavior

## Testing the Training

1. **Ask for an operation requiring secrets**:
   "Can you purge the Cloudflare cache?"

2. **Expected behavior**:
   - Claude runs `gcloud secrets list`
   - Finds CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID
   - Uses them without asking

3. **If Claude asks for secrets**:
   - Remind: "Check gcloud secrets list first"
   - This reinforces the training

## Common Patterns to Embed

```bash
# Pattern 1: List all secrets
gcloud secrets list --project="the-law-shop-457607"

# Pattern 2: Check if specific secret exists
gcloud secrets describe "SECRET_NAME" --project="the-law-shop-457607"

# Pattern 3: Retrieve secret
gcloud secrets versions access latest --secret="SECRET_NAME" --project="the-law-shop-457607"

# Pattern 4: Create new secret
echo -n "secret-value" | gcloud secrets create "SECRET_NAME" --data-file=- --project="the-law-shop-457607"
```

## Why This Works

1. **Explicit Instructions** - Clear directive to check Secrets Manager first
2. **Concrete Commands** - Exact commands to run
3. **Project Context** - Embedded project ID
4. **Behavioral Pattern** - Creates a mental model
5. **Reinforcement** - Multiple touchpoints

The key is making `gcloud secrets list` the DEFAULT first check, not an afterthought!
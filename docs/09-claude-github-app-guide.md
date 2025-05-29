# Claude GitHub App Guide

## What It Does

The Claude GitHub App is like having an AI teammate review your code:
- Spots bugs and security issues
- Suggests better ways to write things
- Checks if your code matches the project style

## Installation

```bash
# From project root
cd tls-portal
/install-github-app
```

Follow the prompts. Takes about 2 minutes.

## How It Works

1. You make a pull request
2. Claude reviews it automatically
3. You fix any issues
4. Merge when ready

That's it. No configuration needed.

## What You'll See

When you create a PR, Claude adds comments like:
- "This might cause a memory leak"
- "You already have a function that does this in utils.js"
- "Missing null check here"

## Troubleshooting

Not seeing reviews? Check installation:
```bash
gh api /repos/YOUR_USERNAME/tls-portal/installation
```

## Good to Know

- Reviews take 2-3 minutes
- It only reads your code, can't change anything
- Works on public and private repos
- Free for open source projects
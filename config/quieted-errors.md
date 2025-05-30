# Quieted Errors and Warnings

This file tracks patterns and warnings that have been intentionally silenced in the development environment.

## TODO/FIXME/HACK Comments

**Status**: Silenced  
**Reason**: Single TODO tracked in task management system  
**Pattern**: `TODO|FIXME|HACK`  
**Location**: `LoginPage.tsx:115` - Forgot password implementation

### Original Error
```
./src/pages/src/components/LoginPage.tsx:115: onClick={() => {/* TODO: Implement forgot password */}}
```

### Tracked As
- Todo ID: 1 - "Implement Password Reset (forgot password flow)"
- Priority: High
- Status: Pending

### How to Re-enable
1. Remove ESLint rule: `"no-warning-comments": "off"`
2. Remove from `.vscode/settings.json` search exclusions
3. Update grep aliases/scripts

---

## TypeScript Strict Checks (if applicable)

**Status**: Active  
**Reason**: Maintaining code quality

---

## Dependency Warnings

**Status**: Monitored  
**Pattern**: `npm WARN|yarn warning`  
**Reason**: Dependencies controlled at workspace level

---

## Node.js Deprecation Warnings

**Status**: Silenced  
**Pattern**: `[DEP0040] DeprecationWarning: The \`punycode\` module is deprecated`  
**Reason**: Firebase CLI uses deprecated punycode module, not fixable at project level  
**Solution**: `NODE_OPTIONS="--no-deprecation"` in all scripts

### Implementation
```bash
# Global fix in scripts
export NODE_OPTIONS="--no-deprecation"

# Or per-command
NODE_OPTIONS="--no-deprecation" firebase deploy
```

### Affected Commands
- `firebase deploy`
- `firebase init`
- `firebase functions:shell`
- All Firebase CLI operations

---

## Gmail SMTP Authentication Errors

**Status**: Silenced  
**Pattern**: `Gmail SMTP connection failed: Error: Missing credentials for "PLAIN"`  
**Reason**: Email service requires Google Workspace credentials, not needed for core functionality  
**Solution**: Configure GWS credentials when email features are required

### Implementation
Email service gracefully degrades when credentials unavailable:
- Core portal functions work without email
- Email notifications disabled until configured
- No impact on billing, payments, or client features

### Configuration (when needed)
```bash
# Add to config/.secrets/gws-email.env
GMAIL_USER=josephleon@thelawshop.com
GMAIL_PASS=app-specific-password
```

---

## Notes

- This file serves as documentation for silenced errors
- Each silenced error should have a reason and tracking mechanism
- Review quarterly to ensure silenced errors don't hide real issues
- Silenced errors should be tied to tracked work items
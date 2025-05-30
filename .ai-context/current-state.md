# AI Context Report
Generated: $(date)

## Quieted Errors & TODOs

### From Quieted Errors File:
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

## Notes

- This file serves as documentation for silenced errors
- Each silenced error should have a reason and tracking mechanism
- Review quarterly to ensure silenced errors don't hide real issues
- Silenced errors should be tied to tracked work items
### Current TODO/FIXME/HACK in Source:
```
```

### Current Task List:
Run 'yarn todo:read' or check TodoRead tool for current tasks

### Suppressed Linting Rules:
```json
```

---
This report is auto-generated for AI context awareness

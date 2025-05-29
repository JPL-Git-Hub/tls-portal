# Grep Error Suppression Guide

## False Error Messages from Grep Commands

### Problem
Commands like `ps aux | grep pattern | grep -v grep` show "Error:" in Claude interface when no processes match, even though this is normal behavior (grep returns exit code 1 when no matches found).

### Solution
**Add `|| true` to any grep command that might return no results:**

```bash
# Before (shows false error)
ps aux | grep -E "firebase|vite|node.*creator" | grep -v grep

# After (silent when no matches)
ps aux | grep -E "firebase|vite|node.*creator" | grep -v grep || true
```

### Usage Pattern
Any grep command in scripts or development checks should end with `|| true` to prevent false error messages in AI interfaces.

**Example for development scripts:**
```bash
# Check running processes without false errors
check_dev_processes() {
    local processes=$(ps aux | grep -E "firebase|vite|node.*creator" | grep -v grep || true)
    if [ -n "$processes" ]; then
        log_info "Development processes running"
    else
        log_info "No development processes detected"
    fi
}
```

### Where This Applies
- Process checking scripts (`ps aux | grep`)
- Log file searches that might have no matches
- Any grep in CI/CD pipelines
- Development helper scripts

### Alternative Approaches
1. **Use `|| true`** (Recommended - simplest, most universal)
2. **Use `grep -q`** for existence checks (but loses output)
3. **Capture exit code**: `grep pattern file; RC=$?`

**Recommendation:** Use `|| true` suffix - it's the simplest fix that works universally without changing command behavior.
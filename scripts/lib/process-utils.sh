#!/bin/bash
# Process management utilities

# Check if processes matching pattern are running
# Usage: check_processes "pattern"
# Returns: 0 if processes found, 1 if not
check_processes() {
    local pattern="$1"
    local processes=$(ps aux | grep -E "$pattern" | grep -v grep 2>/dev/null || true)
    
    if [ -n "$processes" ]; then
        return 0
    else
        return 1
    fi
}

# Get PIDs of processes matching pattern
# Usage: get_process_pids "pattern"
# Returns: Space-separated list of PIDs
get_process_pids() {
    local pattern="$1"
    ps aux | grep -E "$pattern" | grep -v grep 2>/dev/null | awk '{print $2}' || true
}

# Kill processes matching pattern
# Usage: kill_processes "pattern"
kill_processes() {
    local pattern="$1"
    local pids=$(get_process_pids "$pattern")
    
    if [ -n "$pids" ]; then
        echo "Killing processes: $pids"
        kill $pids 2>/dev/null || true
        return 0
    else
        echo "No processes found matching: $pattern"
        return 1
    fi
}

# Check if port is in use
# Usage: check_port 3000
# Returns: 0 if in use, 1 if free
check_port() {
    local port="$1"
    if lsof -i ":$port" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Get process using port
# Usage: get_port_process 3000
get_port_process() {
    local port="$1"
    lsof -i ":$port" 2>/dev/null | grep LISTEN | awk '{print $2}' || true
}

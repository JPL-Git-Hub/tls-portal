#!/bin/bash
# Color definitions for consistent output across all scripts

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Symbols
CHECK_MARK="${GREEN}✓${NC}"
CROSS_MARK="${RED}✗${NC}"
WARNING_SIGN="${YELLOW}⚠${NC}"
INFO_SIGN="${BLUE}ℹ${NC}"

# Export all colors and symbols
export RED GREEN YELLOW BLUE PURPLE CYAN WHITE NC
export CHECK_MARK CROSS_MARK WARNING_SIGN INFO_SIGN

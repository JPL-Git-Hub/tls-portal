#!/bin/bash
# Wrapper for yarn that filters out known deprecation warnings
# These warnings are safe to ignore and we're intentionally staying on ESLint v8

yarn "$@" 2>&1 | grep -v "warning eslint@8.57.1: This version is no longer supported" \
                | grep -v "warning eslint > @humanwhocodes/config-array" \
                | grep -v "warning eslint > @humanwhocodes/object-schema" \
                | grep -v "warning eslint > file-entry-cache > flat-cache > rimraf" \
                | grep -v "warning eslint > file-entry-cache > flat-cache > rimraf > glob@7" \
                | grep -v "warning eslint > file-entry-cache > flat-cache > rimraf > glob > inflight"

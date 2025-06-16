#!/bin/sh
echo "Building selective compile for authentication service..."
node "$(dirname "$0")/selective-compile.js" "$@"

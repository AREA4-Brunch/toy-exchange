#!/bin/sh
echo "Selective compilation for regular user of authentication service..."
node "$(dirname "$0")/selective-compile.js" "$@"

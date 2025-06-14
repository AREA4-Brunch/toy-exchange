#!/bin/sh
echo "Starting authentication service..."
node "$(dirname "$0")/../dist/server.js" "$@"

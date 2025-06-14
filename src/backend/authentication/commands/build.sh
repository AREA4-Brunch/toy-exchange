#!/bin/sh
echo "Building authentication service..."
SCRIPT_DIR=$(dirname "$0")
"$SCRIPT_DIR/build.interfaces.sh" && npx tsc

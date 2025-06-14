#!/bin/sh
echo "Generating JWT secret key for regular user authentication..."
SCRIPT_DIR=$(dirname "$0")
"$SCRIPT_DIR/build.commands.sh" && node "$SCRIPT_DIR/../../dist/regular-user/commands/generate-jwt-secret-key.js"

#!/bin/sh
echo "Publishing interfaces for regular user commands..."
SCRIPT_DIR=$(dirname "$0")
"$SCRIPT_DIR/build.commands.sh" && node "$SCRIPT_DIR/../../dist/regular-user/commands/publish-interfaces.js"

#!/bin/sh
echo "Selective authentication compilation..."
"$(dirname "$0")/../regular-user/commands/build.selective.sh" "$@"

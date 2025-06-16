#!/bin/sh
echo "Building selective commands for regular user authentication service..."
"$(dirname "$0")/build.selective.sh" commands

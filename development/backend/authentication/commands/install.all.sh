#!/bin/sh
echo "Installing all from scratch..."
   "$(dirname "$0")/install.non-local-deps.sh" \
&& "$(dirname "$0")/install.buildtools.sh" \
&& "$(dirname "$0")/install.local-deps.sh"

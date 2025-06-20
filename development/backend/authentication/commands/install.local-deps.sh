#!/bin/sh
echo "Installing local libs with local dependencies..."
ROOT_DIR="$(dirname "$0")/.."
   mkdir -p "$ROOT_DIR/node_modules/password-utils" \
&& cp "$ROOT_DIR/shared/libs/authentication-interfaces"*".tgz" "$ROOT_DIR/node_modules/password-utils/" \
&& npm update

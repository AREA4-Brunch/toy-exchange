#!/bin/sh
echo "Installing non local deps from scratch..."
ROOT_DIR="$(dirname "$0")/.."
PKG_JSON="$ROOT_DIR/package.json"
BKP_PKG_JSON="$ROOT_DIR/package.bckup.json"

# !important: cannot use --omit=dev since build requires dev dependencies
   cp "$PKG_JSON" "$BKP_PKG_JSON" \
&& awk '!/authentication-interfaces": "file:/ \
     && !/password-utils": "file:/' \
        "$BKP_PKG_JSON" > "$PKG_JSON" \
&& npm ci \
&& rm "$PKG_JSON" \
&& mv "$BKP_PKG_JSON" "$PKG_JSON"

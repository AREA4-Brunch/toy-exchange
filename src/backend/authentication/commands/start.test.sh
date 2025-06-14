#!bin/sh
SCRIPT_DIR=$(dirname "$0")
"$SCRIPT_DIR/clean.sh" && "$SCRIPT_DIR/build.sh" && "$SCRIPT_DIR/serve.sh" "$@"

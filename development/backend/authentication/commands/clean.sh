#!/bin/sh
echo "Cleaning authentication service build artifacts..."
node -e "
const path = require('path');
const scriptDir = path.dirname(process.argv[1]);
require('fs').rmSync(path.join(scriptDir, '../dist'), {recursive: true, force: true});
" "$0"

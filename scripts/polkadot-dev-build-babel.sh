#!/bin/bash
# ISC, Copyright 2017 Jaco Greeff

set -e

echo ""
echo "*** Cleaning build directory"

yarn run rimraf build

echo ""
echo "*** Compiling via babel"

yarn run babel --out-dir build --ignore '*.spec.js' src

echo ""
echo "*** Copying flow types (source)"

yarn run flow-copy-source --verbose --ignore '*.spec.js' src build

if [ -d "flow-typed" ]; then
  echo ""
  echo "*** Copying flow types (libraries)"

  cp -r flow-typed build
fi

echo ""
echo "*** Build completed"

exit 0

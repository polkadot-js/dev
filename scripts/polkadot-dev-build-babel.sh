#!/bin/bash
# ISC, Copyright 2017 Jaco Greeff

set -e

function build_js () {
  echo ""
  echo "*** Cleaning build directory"

  rm -rf build

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
}

if [ -d "packages" ]; then
  PACKAGES=( $(ls -1d packages/*) )
fi

if [ -n "$PACKAGES" ]; then
  for PACKAGE in "${PACKAGES[@]}"; do
    echo ""
    echo "*** Executing in $PACKAGE"

    cd $PACKAGE
    build_js
    cd ../..
  done
else
  build_js
fi

exit 0

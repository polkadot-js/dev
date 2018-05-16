#!/bin/bash
# Copyright 2017-2018 Jaco Greeff
# This software may be modified and distributed under the terms
# of the ISC license. See the LICENSE file for details.

set -e

function build_js () {
  ROOT=$1

  echo ""
  echo "*** Cleaning build directory"

  rimraf $ROOT/build

  echo ""
  echo "*** Compiling via babel"

  babel --out-dir $ROOT/build --ignore '*.spec.js' --copy-files $ROOT/src

  echo ""
  echo "*** Copying flow types (source)"

  flow-copy-source --verbose $ROOT/src $ROOT/build

  echo ""
  echo "*** Cleaning spec files (ignored)"

  rimraf $ROOT/build/*.spec.js $ROOT/build/*.spec.js.flow $ROOT/build/**/*.spec.js $ROOT/build/**/*.spec.js.flow

  if [ -d "$ROOT/flow-typed" ]; then
    echo ""
    echo "*** Copying flow types (libraries)"

    cp -r $ROOT/flow-typed $ROOT/build
  fi

  echo ""
  echo "*** Build completed"
}

if [ -d "packages" ]; then
  PACKAGES=( $(ls -1d packages/*) )

  for PACKAGE in "${PACKAGES[@]}"; do
    echo ""
    echo "*** Executing in $PACKAGE"

    build_js "$PACKAGE"
  done
fi

if [ -d "src" ]; then
  build_js "."
fi

exit 0

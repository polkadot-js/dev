#!/bin/bash
# Copyright 2017-2018 Jaco Greeff
# This software may be modified and distributed under the terms
# of the ISC license. See the LICENSE file for details.

set -e

function clean_build () {
  ROOT=$1

  echo ""
  echo "*** Cleaning build directory"

  rimraf $ROOT/build
}

if [ -d "packages" ]; then
  PACKAGES=( $(ls -1d packages/*) )

  for PACKAGE in "${PACKAGES[@]}"; do
    echo ""
    echo "*** Executing in $PACKAGE"

    clean_build "$PACKAGE"
  done
fi

if [ -d "src" ]; then
  clean_build "."
fi

exit 0

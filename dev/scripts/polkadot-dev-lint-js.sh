#!/bin/bash
# Copyright 2017-2018 Jaco Greeff
# This software may be modified and distributed under the terms
# of the ISC license. See the LICENSE file for details.

set -e

function lint () {
  ROOT=$1

  echo ""
  echo "*** Executing in $ROOT"

  eslint $ROOT
}

if [ -d "packages" ]; then
  PACKAGES=( $(ls -1d packages/*) )

  for PACKAGE in "${PACKAGES[@]}"; do
    lint "$PACKAGE"
  done
else
  DIRECTORIES=( $(ls -1d *) )

  for DIR in "${DIRECTORIES[@]}"; do
    if [ -d "$DIR" ] && [ -f "$DIR/package.json" ]; then
      lint "$DIR"
    fi
  done
fi

exit 0

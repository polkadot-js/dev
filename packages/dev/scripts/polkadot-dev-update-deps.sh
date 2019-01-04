#!/bin/sh
# Copyright 2017-2019 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the Apache-2.0 license. See the LICENSE file for details.

set -e

CURRENT=`pwd`
cd ..

DIRECTORIES=( $(find . -type d -maxdepth 1 | cut -c 3-) )

echo ""
echo "*** Updating inter-package-deps"

$CURRENT/node_modules/@polkadot/dev/scripts/polkadot-dev-update-deps.js

echo ""
echo "*** Installing updated packages"

for REPO in "${DIRECTORIES[@]}"; do
  echo ""
  echo "*** Installing in $REPO"

  cd $REPO
  yarn
  cd ..
done

cd $CURRENT

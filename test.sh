#!/bin/bash
# Copyright 2017-2019 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the Apache-2.0 license. See the LICENSE file for details.

function lerna_get_version () {
  LERNA_VERSION=$(cat lerna.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g')
}

function lerna_bump () {
  echo ""
  echo "*** Incrementing lerna version"

  lerna_get_version
  LERNA_VERSION_PRE="$LERNA_VERSION"
  BETA=${LERNA_VERSION_PRE##*-}

  if [[ $BETA == *"beta"* ]]; then
    yarn run polkadot-dev-version-beta
  else
    LAST=${BETA##*.}
    echo "*** LAST part"
  fi

  git add --all .

  lerna_get_version
  LERNA_VERSION_POST="$LERNA_VERSION"

  echo ""
  echo "*** Lerna increment completed"
}

lerna_bump

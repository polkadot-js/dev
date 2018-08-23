#!/bin/sh
# Copyright 2017-2018 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the ISC license. See the LICENSE file for details.

set -e

if [ -d "packages" ]; then
  lerna version minor --yes --no-git-tag-version --no-push --allow-branch '*'
fi

#!/bin/sh
# Copyright 2017-2019 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the Apache-2.0 license. See the LICENSE file for details.

set -e

if [ -d "packages" ]; then
  yarn run lerna version prerelease --preid beta --yes --no-git-tag-version --no-push --allow-branch '*'
fi

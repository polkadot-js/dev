#!/usr/bin/env bash
# Copyright 2017-2020 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the Apache-2.0 license. See the LICENSE file for details.

set -e

if [ -z "$SKIP_ESLINT" ]; then
  eslint . --ext .js,.jsx,.ts,.tsx
fi

if [ -z "$SKIP_TSC" ]; then
  tsc --noEmit --pretty
fi

exit 0

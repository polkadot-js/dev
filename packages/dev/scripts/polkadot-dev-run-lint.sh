#!/bin/bash
# Copyright 2017-2020 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the Apache-2.0 license. See the LICENSE file for details.

set -e

eslint . --ext .js,.jsx,.ts,.tsx
tsc --noEmit --pretty

exit 0

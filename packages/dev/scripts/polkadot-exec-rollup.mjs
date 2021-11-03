#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { importDirect } from './import.mjs';

importDirect('rollup', 'rollup/dist/bin/rollup').then(() =>
  process.exit(0)
);

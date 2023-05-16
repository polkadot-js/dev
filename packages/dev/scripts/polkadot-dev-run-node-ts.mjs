#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { execNodeTsSync } from './util.mjs';

const cmd = process.argv.slice(2).join(' ');

console.log('$ polkadot-run-node-ts', cmd);

execNodeTsSync(cmd);

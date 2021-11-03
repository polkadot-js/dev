#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { __dirname } from './dirname.mjs';
import execSync from './execSync.mjs';

console.log('$ polkadot-dev-run-prettier', process.argv.slice(2).join(' '));

execSync(`yarn polkadot-exec-prettier --write ${__dirname}`);

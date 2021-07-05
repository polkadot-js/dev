#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// const execSync = require('./execSync.cjs');

// execSync(`yarn pnpify tsc ${process.argv.slice(2).join(' ')}`);

console.log('$ rollup', process.argv.slice(2).join(' '));

require('rollup/dist/bin/rollup');

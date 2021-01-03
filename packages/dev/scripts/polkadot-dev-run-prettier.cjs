#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const execSync = require('./execSync.cjs');

console.log('$ polkadot-dev-run-prettier', process.argv.slice(2).join(' '));

execSync(`yarn polkadot-exec-prettier --write ${__dirname}`);

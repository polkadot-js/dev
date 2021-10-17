#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const path = require('path');

const execSync = require('./execSync.cjs');

const args = process.argv.slice(2).join(' ');
const bin = path.join(process.cwd(), 'node_modules/eslint/bin/eslint.js');

execSync(`${bin} ${args}`);

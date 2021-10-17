#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const path = require('path');

console.log('$ eslint', process.argv.slice(2).join(' '));

require(path.join(process.cwd(), 'node_modules/eslint/bin/eslint.js'));

#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const args = process.argv.slice(2);

console.log('$ lerna', args.join(' '));

require('lerna')(args);

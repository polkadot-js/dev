#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

console.log('$ tsc', process.argv.slice(2).join(' '));

require('typescript/lib/tsc');

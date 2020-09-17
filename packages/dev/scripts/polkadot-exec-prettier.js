#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

console.log('$ prettier', process.argv.slice(2).join(' '));

require('prettier/bin-prettier');

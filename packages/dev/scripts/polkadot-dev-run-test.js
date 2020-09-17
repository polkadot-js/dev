#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

console.log('$ polkadot-dev-run-test', process.argv.slice(2).join(' '));

// eslint-disable-next-line
require('jest-cli/build/cli').run();

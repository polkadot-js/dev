#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

console.log('$ polkadot-dev-run-test', process.argv.slice(2).join(' '));

require('jest-cli/build/cli').run();

#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const execSync = require('./execSync.cjs');

execSync(`yarn typedoc ${process.argv.slice(2).join(' ')}`);

// console.log('$ typedoc', process.argv.slice(2).join(' '));

// const td = require('typedoc/dist/lib/cli.js');

// new td.CliApplication().bootstrap();

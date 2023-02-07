#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import path from 'node:path';
import yargs from 'yargs';

import { __dirname, execSync } from './util.mjs';

console.log('$ polkadot-dev-run-swc', process.argv.slice(2).join(' '));

const argv = yargs(process.argv.slice(2))
  .options({
    type: {
      description: 'The type of compilation, either cjs or esm',
      type: 'string'
    }
  })
  .strict()
  .argv;

const type = argv.type === 'cjs'
  ? 'cjs'
  : 'esm';

execSync(`yarn polkadot-exec-swc --delete-dir-on-start --copy-files --config-file ${path.join(__dirname, `../config/swcrc-${type}.json`)} --out-dir build-swc-${type} src`);

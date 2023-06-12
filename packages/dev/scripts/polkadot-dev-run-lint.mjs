#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import process from 'node:process';
import yargs from 'yargs';

import { __dirname, execSync, GITHUB_REPO } from './util.mjs';

const TS_CONFIG_BUILD = true;

console.log('$ polkadot-dev-run-lint', process.argv.slice(2).join(' '));

// Since yargs can also be a promise, we just relax the type here completely
const argv = await yargs(process.argv.slice(2))
  .options({
    'skip-eslint': {
      description: 'Skips running eslint',
      type: 'boolean'
    },
    'skip-tsc': {
      description: 'Skips running tsc',
      type: 'boolean'
    }
  })
  .strict()
  .argv;

if (!argv['skip-eslint']) {
  // We don't want to run with fix on CI
  const extra = GITHUB_REPO
    ? ''
    : '--fix';

  execSync(`yarn polkadot-exec-eslint ${extra} ${process.cwd()}`);
}

if (!argv['skip-tsc']) {
  execSync(`yarn polkadot-exec-tsc --noEmit --emitDeclarationOnly false --pretty${TS_CONFIG_BUILD ? ' --project tsconfig.build.json' : ''}`);
}

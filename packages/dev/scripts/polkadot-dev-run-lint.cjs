#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const argv = require('yargs')
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

const execSync = require('./execSync.cjs');

console.log('$ polkadot-dev-run-lint', process.argv.slice(2).join(' '));

if (!argv['skip-eslint']) {
  execSync(`yarn polkadot-exec-eslint --resolve-plugins-relative-to ${__dirname} --ext .js,.ts,.tsx ${process.cwd()}`);
}

if (!argv['skip-tsc']) {
  execSync('yarn polkadot-exec-tsc --noEmit --pretty');
}

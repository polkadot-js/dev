#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

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

if (!argv['skip-eslint']) {
  require('eslint/lib/cli').execute(['--ext', '.js,.jsx,.ts,.tsx', process.cwd()]);
}

if (!argv['skip-tsc']) {
  // HACK Tis really is just betond words :(
  process.argv = ['something-ignored', 'somewhere-ignored', '--noEmit', '--pretty'];

  require('typescript/lib/tsc');
}

#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const { execSync } = require('child_process');
const path = require('path');
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
  execSync(`${require.resolve('@polkadot/dev/scripts/polkadot-exec-eslint.js')} --resolve-plugins-relative-to ${__dirname} --ext .js,.jsx,.ts,.tsx ${process.cwd()}`, { stdio: 'inherit' });
}

if (!argv['skip-tsc']) {
  execSync(`${require.resolve('@polkadot/dev/scripts/polkadot-exec-tsc.js')} --noEmit --pretty`, { stdio: 'inherit' });
}

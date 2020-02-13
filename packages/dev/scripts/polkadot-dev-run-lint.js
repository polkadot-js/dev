#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/no-var-requires */

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

function main () {
  if (!argv['skip-eslint']) {
    require('eslint/lib/cli').execute(['--ext', '.js,.jsx,.ts,.tsx', process.cwd()]);
  }

  if (!argv['skip-tsc']) {
    execSync(`${path.join(__dirname, 'polkadot-dev-exec-tsc.js')} --noEmit --pretty`);
  }
}

main();

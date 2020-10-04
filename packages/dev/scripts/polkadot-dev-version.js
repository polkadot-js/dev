#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs');
const { type } = require('yargs')
  .options({
    type: {
      choices: ['major', 'minor', 'patch', 'prerelease', 'preminor'],
      description: 'The type of version adjustment to apply',
      required: true,
      type: 'string'
    }
  })
  .strict()
  .argv;

const execSync = require('./execSync');

console.log('$ polkadot-dev-version', process.argv.slice(2).join(' '));

if (fs.existsSync('packages')) {
  execSync(`yarn workspaces foreach --parallel --topological version ${type}`);
} else {
  execSync(`yarn version ${type}`);
}

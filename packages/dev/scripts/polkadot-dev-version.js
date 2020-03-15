#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const execSync = require('./execSync');
const { type } = require('yargs')
  .options({
    type: {
      choices: ['major', 'minor', 'patch', 'preminor', 'prerelease'],
      description: 'The type of version adjustment to apply',
      required: true,
      type: 'string'
    }
  })
  .strict()
  .argv;

console.log('$ polkadot-dev-version', process.argv.slice(2).join(' '));

const args = ['version', type]
  .concat(
    ['preminor', 'prerelease'].includes(type)
      ? ['--preid', 'beta']
      : []
  )
  .concat(['--yes', '--exact', '--no-git-tag-version', '--no-push', '--allow-branch', '"*"']);

execSync(`yarn polkadot-exec-lerna ${args.join(' ')}`);
execSync('yarn install');

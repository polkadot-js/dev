#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/no-var-requires */

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

require('lerna')(
  ['version', type]
    .concat(
      ['preminor', 'prerelease'].includes(type)
        ? ['--preid', 'beta']
        : []
    )
    .concat(['--yes', '--exact', '--no-git-tag-version', '--no-push', '--allow-branch', '*'])
);

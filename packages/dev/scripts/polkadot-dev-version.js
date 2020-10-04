#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs');
const path = require('path');
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

execSync(`yarn version ${type}`);

if (fs.existsSync('packages')) {
  fs
    .readdirSync('packages')
    .map((dir) => path.join(process.cwd(), 'packages', dir, 'package.json'))
    .filter((pkgPath) => fs.existsSync(pkgPath))
    .forEach((pkgPath) => execSync(`yarn workspace ${JSON.parse(fs.readFileSync(pkgPath, 'utf8')).name} version ${type}`));
}

#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs');
const path = require('path');
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
const lernaPath = path.join(process.cwd(), 'lerna.json');
const pkgPath = path.join(process.cwd(), 'package.json');
const spacePath = path.join(process.cwd(), 'packages');

console.log('$ polkadot-dev-version', process.argv.slice(2).join(' '));

if (fs.existsSync(spacePath)) {
  if (fs.existsSync(lernaPath)) {
    const preid = ['preminor', 'prerelease'].includes(type)
      ? '--preid beta'
      : '';

    execSync(`yarn polkadot-exec-lerna version ${type} ${preid} --yes --exact --no-git-tag-version --no-push --allow-branch "*"`);

    const { version } = require(lernaPath);
    const pkgJson = require(pkgPath);

    pkgJson.version = version;
    fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2), { flag: 'w' });

    execSync('yarn install');
  } else {
    execSync(`yarn workspaces foreach version ${type === 'preminor' ? 'prerelease' : type}`);
  }
} else {
  execSync(`yarn version ${type === 'preminor' ? 'prerelease' : type}`);
}

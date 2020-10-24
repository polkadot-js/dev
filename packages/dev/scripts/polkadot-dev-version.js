#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs');
const path = require('path');
const { type } = require('yargs')
  .options({
    type: {
      choices: ['major', 'minor', 'patch', 'prerelease'],
      description: 'The type of version adjustment to apply',
      required: true,
      type: 'string'
    }
  })
  .strict()
  .argv;

const execSync = require('./execSync');

function updateDependencies (dependencies, others, version) {
  return Object
    .entries(dependencies)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce((result, [key, value]) => {
      result[key] = others.includes(key) && value !== '*'
        ? `^${version}`
        : value;

      return result;
    }, {});
}

console.log('$ polkadot-dev-version', process.argv.slice(2).join(' '));

execSync(`yarn version ${type}`);

// yarn workspaces does an OOM, manual looping takes ages
if (fs.existsSync('packages')) {
  const packages = fs
    .readdirSync('packages')
    .map((dir) => path.join(process.cwd(), 'packages', dir, 'package.json'))
    .filter((pkgPath) => fs.existsSync(pkgPath))
    .map((pkgPath) => [pkgPath, JSON.parse(fs.readFileSync(pkgPath, 'utf8'))]);
  const others = packages.map(([, json]) => json.name);
  const { version } = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));

  packages.forEach(([pkgPath, json]) => {
    const updated = Object.keys(json).reduce((result, key) => {
      if (key === 'version') {
        result[key] = version;
      } else if (['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies', 'resolutions'].includes(key)) {
        result[key] = updateDependencies(json[key], others, version);
      } else {
        result[key] = json[key];
      }

      return result;
    }, {});

    fs.writeFileSync(pkgPath, `${JSON.stringify(updated, null, 2)}\n`);
  });
}

execSync('yarn');

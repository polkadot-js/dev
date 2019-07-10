#!/usr/bin/env node
// Copyright 2017-2019 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const versions = {};
const paths = [];

function packageJson (dir) {
  return path.join(dir, 'package.json');
}

function updateDependencies (dependencies) {
  return Object.keys(dependencies).sort().reduce((result, name) => {
    const current = dependencies[name];
    const version = versions[name] || current;

    if (version !== current) {
      console.log('\t\t', name, '->', version);
    }

    result[name] = version;

    return result;
  }, {});
}

function parsePackage (dir) {
  return JSON.parse(
    fs.readFileSync(packageJson(dir)).toString('utf-8')
  );
}

function updatePackage (dir) {
  console.log('\t', dir);

  const json = parsePackage(dir);
  const result = Object.keys(json).reduce((result, key) => {
    if (!['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'].includes(key)) {
      result[key] = json[key];
    } else {
      result[key] = updateDependencies(json[key]);
    }

    return result;
  }, {});

  fs.writeFileSync(packageJson(dir), `${JSON.stringify(result, null, 2)}\n`);
}

function extractVersion (dir) {
  console.log('\t', dir);

  const { name, version } = parsePackage(dir);

  versions[name] = `^${version}`;
}

function findPackages (dir) {
  const pkgsDir = path.join(dir, 'packages');

  paths.push(dir);
  extractVersion(dir);

  if (!fs.existsSync(pkgsDir)) {
    return;
  }

  fs
    .readdirSync(pkgsDir)
    .filter((entry) => {
      const full = path.join(pkgsDir, entry);

      return !['.', '..'].includes(entry) && fs.lstatSync(full).isDirectory();
    })
    .forEach((dir) => {
      const full = path.join(pkgsDir, dir);

      paths.push(full);
      extractVersion(full);
    });
}

console.log('Extracting');
fs
  .readdirSync('.')
  .filter((name) => {
    return !['.', '..'].includes(name) && fs.existsSync(packageJson(name));
  })
  .sort()
  .forEach(findPackages);

console.log('Updating');
paths.forEach(updatePackage);

// console.log(versions);

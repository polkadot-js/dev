#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';

const versions = {};
const paths = [];
let updated = 0;

function packageJson (dir) {
  return path.join(dir, 'package.json');
}

function updateDependencies (dir, dependencies) {
  let hasLogged = false;

  return Object
    .keys(dependencies)
    .sort()
    .reduce((result, name) => {
      const current = dependencies[name];
      const version = current[0] !== '^' || current.endsWith('-x')
        ? current
        : versions[name] || current;

      if (version !== current) {
        if (!hasLogged) {
          console.log('\t', dir);
          hasLogged = true;
        }

        console.log('\t\t', name, '->', version);
        updated++;
      }

      result[name] = version;

      return result;
    }, {});
}

function parsePackage (dir) {
  return JSON.parse(
    fs.readFileSync(packageJson(dir), 'utf-8')
  );
}

function writePackage (dir, json) {
  fs.writeFileSync(packageJson(dir), `${JSON.stringify(json, null, 2)}\n`);
}

function updatePackage (dir) {
  const json = parsePackage(dir);

  writePackage(dir, Object
    .entries(json)
    .reduce((result, [key, value]) => {
      result[key] = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies', 'resolutions'].includes(key)
        ? updateDependencies(dir, value)
        : value;

      return result;
    }, {})
  );
}

function extractVersion (dir, versionNpm) {
  const { name } = parsePackage(dir);

  versions[name] = `^${versionNpm}`;
}

function findPackages (dir) {
  const pkgsDir = path.join(dir, 'packages');

  paths.push(dir);
  extractVersion(dir);

  if (!fs.existsSync(pkgsDir)) {
    return;
  }

  const { versionNpm, versions } = parsePackage(dir);
  const lastVersion = versions
    ? versions.npm
    : versionNpm;

  fs
    .readdirSync(pkgsDir)
    .filter((entry) => {
      const full = path.join(pkgsDir, entry);

      return !['.', '..'].includes(entry) &&
        fs.lstatSync(full).isDirectory() &&
        fs.existsSync(path.join(full, 'package.json'));
    })
    .forEach((dir) => {
      const full = path.join(pkgsDir, dir);

      paths.push(full);
      extractVersion(full, lastVersion);
    });
}

console.log('Extracting ...');

fs
  .readdirSync('.')
  .filter((name) => {
    return !['.', '..'].includes(name) && fs.existsSync(packageJson(name));
  })
  .sort()
  .forEach(findPackages);

console.log('\t', Object.keys(versions).length, 'packages found');

console.log('Updating ...');

paths.forEach(updatePackage);

console.log('\t', updated, 'versions adjusted');

#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';

/** @typedef {{ dependencies: Record<string, string>; devDependencies: Record<string, string>; peerDependencies: Record<string, string>; optionalDependencies: Record<string, string>; resolutions: Record<string, string>; name: string; version: string; versions: { git: string; npm: string; } }} PkgJson */

const versions = {};
const paths = [];
let updated = 0;

/**
 * Returns the path of the package.json inside the supplied directory
 *
 * @param {string} dir
 * @returns {string}
 */
function packageJsonPath (dir) {
  return path.join(dir, 'package.json');
}

/**
 * Update the supplied dependency map with the latest (version map) versions
 *
 * @param {string} dir
 * @param {Record<string, string>} dependencies
 * @returns {Record<string, string>}
 */
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

/**
 * Returns a parsed package.json
 *
 * @param {string} dir
 * @returns {PkgJson}
 */
function parsePackage (dir) {
  return JSON.parse(
    fs.readFileSync(packageJsonPath(dir), 'utf-8')
  );
}

/**
 * Outputs the supplied package.json
 *
 * @param {string} dir
 * @param {Record<string, unknown>} json
 */
function writePackage (dir, json) {
  fs.writeFileSync(packageJsonPath(dir), `${JSON.stringify(json, null, 2)}\n`);
}

/**
 * Rerite the package.json with updated dependecies
 *
 * @param {string} dir
 */
function updatePackage (dir) {
  const json = parsePackage(dir);

  writePackage(dir, Object
    .keys(json)
    .reduce((result, key) => {
      result[key] = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies', 'resolutions'].includes(key)
        ? updateDependencies(dir, json[key])
        : json[key];

      return result;
    }, {})
  );
}

/**
 * Loop through package/*, extracting the package names and their versions
 *
 * @param {string} dir
 */
function findPackages (dir) {
  const pkgsDir = path.join(dir, 'packages');

  paths.push(dir);

  if (!fs.existsSync(pkgsDir)) {
    return;
  }

  const { versions: { npm: lastVersion } } = parsePackage(dir);

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
      const { name } = parsePackage(full);

      paths.push(full);
      versions[name] = `^${lastVersion}`;
    });
}

console.log('Extracting ...');

fs
  .readdirSync('.')
  .filter((name) =>
    !['.', '..'].includes(name) &&
    fs.existsSync(packageJsonPath(name))
  )
  .sort()
  .forEach(findPackages);

console.log('\t', Object.keys(versions).length, 'packages found');

console.log('Updating ...');

paths.forEach(updatePackage);

console.log('\t', updated, 'versions adjusted');

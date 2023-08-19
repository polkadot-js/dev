#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';

/** @typedef {{ dependencies: Record<string, string>; devDependencies: Record<string, string>; peerDependencies: Record<string, string>; optionalDependencies: Record<string, string>; resolutions: Record<string, string>; name: string; version: string; versions: { git: string; npm: string; } }} PkgJson */

// The keys to look for in package.json
const PKG_PATHS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies', 'resolutions'];

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
 * @param {boolean} hasDirLogged
 * @param {string} key
 * @param {Record<string, string>} dependencies
 * @returns {[number, Record<string, string>]}
 */
function updateDependencies (dir, hasDirLogged, key, dependencies) {
  let count = 0;
  const adjusted = Object
    .keys(dependencies)
    .sort()
    .reduce((result, name) => {
      const current = dependencies[name];
      const version = !current.startsWith('^') || current.endsWith('-x')
        ? current
        : versions[name] || current;

      if (version !== current) {
        if (count === 0) {
          if (!hasDirLogged) {
            console.log('\t', dir);
          }

          console.log('\t\t', key);
        }

        console.log('\t\t\t', name.padStart(30), '\t', current.padStart(8), '->', version);
        count++;
        updated++;
      }

      result[name] = version;

      return result;
    }, {});

  return [count, adjusted];
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
  let hasDirLogged = false;

  writePackage(dir, Object
    .keys(json)
    .reduce((result, key) => {
      if (PKG_PATHS.includes(key)) {
        const [count, adjusted] = updateDependencies(dir, hasDirLogged, key, json[key]);

        result[key] = adjusted;

        if (count) {
          hasDirLogged = true;
        }
      } else {
        result[key] = json[key];
      }

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
      const pkgJson = parsePackage(full);

      paths.push(full);
      versions[pkgJson.name] = `^${lastVersion}`;

      // for dev we want to pull through the additionals, i.e. we want to
      // align deps found in dev/others with those in dev as master
      if (pkgJson.name === '@polkadot/dev') {
        PKG_PATHS.forEach((depPath) => {
          Object
            .entries(pkgJson[depPath] || {})
            .filter(([, version]) => version.startsWith('^'))
            .forEach(([pkg, version]) => {
              versions[pkg] ??= version;
            });
        });
      }
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

#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';
import yargs from 'yargs';

import { execSync, exitFatal } from './util.mjs';

/** @typedef {{ dependencies?: Record<string, string>; devDependencies?: Record<string, string>; peerDependencies?: Record<string, string>; optionalDependencies?: Record<string, string>; resolutions?: Record<string, string>; name?: string; stableVersion?: string; version: string; }} PkgJson */

const TYPES = ['major', 'minor', 'patch', 'pre'];

const [type] = (
  await yargs(process.argv.slice(2))
    .demandCommand(1)
    .argv
)._;

if (typeof type !== 'string' || !TYPES.includes(type)) {
  exitFatal(`Invalid version bump "${type}", expected one of ${TYPES.join(', ')}`);
}

/**
 * @param {Record<string, string>} dependencies
 * @param {string[]} others
 * @param {string} version
 * @returns {Record<string, string>}
 */
function updateDependencies (dependencies, others, version) {
  return Object
    .entries(dependencies)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce((/** @type {Record<string, string>} */ result, [key, value]) => {
      result[key] = others.includes(key) && value !== '*'
        ? value.startsWith('^')
          ? `^${version}`
          : version
        : value;

      return result;
    }, {});
}

/**
 * @returns {[string, PkgJson]}
 */
function readRootPkgJson () {
  const rootPath = path.join(process.cwd(), 'package.json');
  const rootJson = JSON.parse(fs.readFileSync(rootPath, 'utf8'));

  return [rootPath, rootJson];
}

/**
 * @param {string} path
 * @param {unknown} json
 */
function writePkgJson (path, json) {
  fs.writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
}

/**
 *
 * @param {string} version
 * @param {string[]} others
 * @param {string} pkgPath
 * @param {Record<String, any>} json
 */
function updatePackage (version, others, pkgPath, json) {
  const updated = Object
    .keys(json)
    .reduce((/** @type {Record<String, unknown>} */ result, key) => {
      if (key === 'version') {
        result[key] = version;
      } else if (['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies', 'resolutions'].includes(key)) {
        result[key] = updateDependencies(json[key], others, version);
      } else if (key !== 'stableVersion') {
        result[key] = json[key];
      }

      return result;
    }, {});

  writePkgJson(pkgPath, updated);
}

function removeX () {
  const [rootPath, json] = readRootPkgJson();

  if (!json.version?.endsWith('-x')) {
    return false;
  }

  json.version = json.version.replace('-x', '');
  writePkgJson(rootPath, json);

  return true;
}

function addX () {
  const [rootPath, json] = readRootPkgJson();

  if (json.version.endsWith('-x')) {
    return false;
  }

  json.version = json.version + '-x';
  writePkgJson(rootPath, json);

  return true;
}

console.log('$ polkadot-dev-version', process.argv.slice(2).join(' '));

const isX = removeX();

execSync(`yarn version ${type === 'pre' ? 'prerelease' : type}`);

if (isX && type === 'pre') {
  addX();
}

const [rootPath, rootJson] = readRootPkgJson();

updatePackage(rootJson.version, [], rootPath, rootJson);

// yarn workspaces does an OOM, manual looping takes ages
if (fs.existsSync('packages')) {
  const packages = fs
    .readdirSync('packages')
    .map((dir) => path.join(process.cwd(), 'packages', dir, 'package.json'))
    .filter((pkgPath) => fs.existsSync(pkgPath))
    .map((pkgPath) => [pkgPath, JSON.parse(fs.readFileSync(pkgPath, 'utf8'))]);
  const others = packages.map(([, json]) => json.name);

  packages.forEach(([pkgPath, json]) => {
    updatePackage(rootJson.version, others, pkgPath, json);
  });
}

execSync('yarn');

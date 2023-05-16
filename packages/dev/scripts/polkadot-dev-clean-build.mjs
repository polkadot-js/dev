#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';

import { PATHS_BUILD, rimrafSync } from './util.mjs';

const PKGS = path.join(process.cwd(), 'packages');
const DIRS = PATHS_BUILD.map((d) => `build${d}`);

console.log('$ polkadot-dev-clean-build', process.argv.slice(2).join(' '));

/**
 * @internal
 *
 * Retrieves all the files containing tsconfig.*.tsbuildinfo contained withing the directory
 *
 * @param {string} dir
 * @returns {string[]}
 */
function getPaths (dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .reduce((all, p) => {
      if (p.startsWith('tsconfig.') && p.endsWith('.tsbuildinfo')) {
        all.push(path.join(dir, p));
      }

      return all;
    }, DIRS.map((p) => path.join(dir, p)));
}

/**
 * @internal
 *
 * Removes all the specified directories
 *
 * @param {string[]} dirs
 */
function cleanDirs (dirs) {
  dirs.forEach((d) => rimrafSync(d));
}

cleanDirs(getPaths(process.cwd()));

if (fs.existsSync(PKGS)) {
  cleanDirs(getPaths(PKGS));
  cleanDirs(
    fs
      .readdirSync(PKGS)
      .map((f) => path.join(PKGS, f))
      .filter((f) => fs.statSync(f).isDirectory())
      .reduce((/** @type {string[]} */ res, d) => res.concat(getPaths(d)), [])
  );
}

#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';

const PKGS = path.join(process.cwd(), 'packages');
const DIRS = [
  'build',
  ...['cjs', 'esm', 'deno', 'docs', 'swc', 'swc-cjs', 'swc-esm'].map((d) => `build-${d}`),
  ...['tsbuildinfo', '*.tsbuildinfo'].map((d) => `tsconfig.${d}`)
];

console.log('$ polkadot-dev-clean-build', process.argv.slice(2).join(' '));

function getPaths (dir) {
  return DIRS.map((p) => path.join(dir, p));
}

function cleanDirs (dirs) {
  dirs.forEach((d) => rimraf.sync(d));
}

cleanDirs(getPaths(process.cwd()));

if (fs.existsSync(PKGS)) {
  cleanDirs(getPaths(PKGS));
  cleanDirs(
    fs
      .readdirSync(PKGS)
      .map((f) => path.join(PKGS, f))
      .filter((f) => fs.statSync(f).isDirectory())
      .reduce((res, d) => res.concat(getPaths(d)), [])
  );
}

#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const PKGS = path.join(process.cwd(), 'packages');

console.log('$ polkadot-dev-clean-build', process.argv.slice(2).join(' '));

function getDirs (dir) {
  return [path.join(dir, 'build'), path.join(dir, 'build-docs')];
}

function cleanDirs (dirs) {
  dirs.forEach((dir) => rimraf.sync(dir));
}

cleanDirs(getDirs(process.cwd()));

if (fs.existsSync(PKGS)) {
  cleanDirs(
    fs
      .readdirSync(PKGS)
      .map((file) => path.join(PKGS, file))
      .filter((file) => fs.statSync(file).isDirectory())
      .reduce((arr, dir) => arr.concat(getDirs(dir)), [])
  );
}

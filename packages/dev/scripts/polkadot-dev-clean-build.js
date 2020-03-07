#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

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

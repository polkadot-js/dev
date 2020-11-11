#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');

const copySync = require('./copySync.cjs');
const execSync = require('./execSync.cjs');

console.log('$ polkadot-dev-build-docs', process.argv.slice(2).join(' '));

function buildTypedoc (docRoot) {
  fs
    .readdirSync('packages')
    .map((dir) => [path.join(process.cwd(), 'packages', dir), dir])
    .filter(([dir]) =>
      fs.statSync(dir).isDirectory() &&
      fs.existsSync(path.join(dir, 'src')) &&
      !fs.existsSync(path.join(dir, '.nodoc'))
    )
    .forEach(([full, dir]) => {
      execSync(`yarn polkadot-exec-typedoc --theme markdown --out ${docRoot}/${dir} ${full}/src`);
    });
}

function main () {
  let docRoot = path.join(process.cwd(), 'docs');

  if (fs.existsSync(docRoot)) {
    docRoot = path.join(process.cwd(), 'build-docs');

    rimraf.sync(docRoot);
    fse.copySync(path.join(process.cwd(), 'docs'), docRoot);
  }

  if (fs.existsSync(path.join(process.cwd(), 'typedoc.js'))) {
    buildTypedoc(docRoot);

    ['CHANGELOG.md', 'CONTRIBUTING.md'].forEach((file) => copySync(file, docRoot));
  }
}

main();

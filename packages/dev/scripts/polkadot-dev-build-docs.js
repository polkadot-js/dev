#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const execSync = require('./execSync');
const cpx = require('cpx');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');

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

function buildVuepress (docRoot) {
  execSync(`yarn polkadot-exec-vuepress build ${docRoot}`);

  rimraf.sync(`${docRoot}/assets`);
  fse.copySync(`${docRoot}/.vuepress/dist`, docRoot);
  rimraf.sync(`${docRoot}/.vuepress/dist`);
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

    ['CHANGELOG.md', 'CONTRIBUTING.md'].forEach((file) => cpx.copySync(file, docRoot));

    if (fs.existsSync(path.join(process.cwd(), 'docs/.vuepress'))) {
      buildVuepress(docRoot);
    }
  }
}

main();

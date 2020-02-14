#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/no-var-requires */

const { execSync } = require('child_process');
const cpx = require('cpx');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');

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
      execSync(`${path.join(__dirname, 'polkadot-exec-typedoc.js')} --theme markdown --out ./${docRoot}/${dir} ${full}/src`, { stdio: 'inherit' });
    });
}

function buildVuepress (docRoot) {
  execSync(`${path.join(__dirname, 'polkadot-exec-vuepress.js')} build ${docRoot}`, { stdio: 'inherit' });

  rimraf.sync(`${docRoot}/assets`);
  cpx.copySync(`${docRoot}/.vuepress/dist/*`, docRoot);
  rimraf.sync(`${docRoot}/.vuepress/dist`);
}

function main () {
  let docRoot = path.join(process.cwd(), 'docs');

  if (fs.existsSync(docRoot)) {
    docRoot = path.join(process.cwd(), 'build-docs');

    rimraf.sync(docRoot);
    cpx.copySync(path.join(process.cwd(), 'docs/*'), docRoot);
    cpx.copySync(path.join(process.cwd(), 'docs/.*'), docRoot);
    cpx.copySync(path.join(process.cwd(), 'docs/**/*'), docRoot);
    cpx.copySync(path.join(process.cwd(), 'docs/.**/*'), docRoot);
    cpx.copySync(path.join(process.cwd(), 'docs/.**/**/*'), docRoot);
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

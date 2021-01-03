#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs');

const execSync = require('./execSync.cjs');

console.log('$ polkadot-ci-ghpages-force', process.argv.slice(2).join(' '));

// ensure we are on master
execSync('git checkout master');

// checkout latest
execSync('git fetch');
execSync('git checkout gh-pages');
execSync('git pull');
execSync('git checkout --orphan gh-pages-temp');

// ignore relevant files
fs.writeFileSync('.gitignore', `
.github/
.vscode/
.yarn/
build/
coverage/
node_modules/
packages/
test/
NOTES.md
`);

// add
execSync('git add -A');
execSync('git commit -am "refresh history"');

// danger, force new
execSync('git branch -D gh-pages');
execSync('git branch -m gh-pages');
execSync('git push -f origin gh-pages');

// switch to master
execSync('git checkout master');

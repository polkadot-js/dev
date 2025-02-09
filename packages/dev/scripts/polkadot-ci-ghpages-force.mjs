#!/usr/bin/env node
// Copyright 2017-2025 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';

import { execGit, logBin } from './util.mjs';

logBin('polkadot-ci-ghpages-force');

// ensure we are on master
execGit('checkout master');

// checkout latest
execGit('fetch');
execGit('checkout gh-pages');
execGit('pull');
execGit('checkout --orphan gh-pages-temp');

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
execGit('add -A');
execGit('commit -am "refresh history"');

// danger, force new
execGit('branch -D gh-pages');
execGit('branch -m gh-pages');
execGit('push -f origin gh-pages');

// switch to master
execGit('checkout master');

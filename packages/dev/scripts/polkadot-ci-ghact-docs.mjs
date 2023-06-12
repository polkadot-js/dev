#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { execSync, GITHUB_REPO, GITHUB_TOKEN_URL, gitSetup } from './util.mjs';

const repo = `${GITHUB_TOKEN_URL}/${GITHUB_REPO}.git`;

console.log('$ polkadot-ci-ghact-docs', process.argv.slice(2).join(' '));

gitSetup();

execSync('yarn run docs');
execSync(`yarn polkadot-exec-ghpages --dotfiles --repo ${repo} --dist ${process.env['GH_PAGES_SRC']} --dest .`, true);

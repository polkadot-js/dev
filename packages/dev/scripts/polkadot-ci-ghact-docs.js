#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const execSync = require('./execSync');

const token = process.env.GH_PAT || `x-access-token:${process.env.GITHUB_TOKEN}`;
const repo = `https://${token}@github.com/${process.env.GITHUB_REPOSITORY}.git`;

console.log('$ polkadot-ci-ghact-docs', process.argv.slice(2).join(' '));

execSync('git config push.default simple');
execSync('git config merge.ours.driver true');
execSync('git config user.name "Github Actions"');
execSync('git config user.email "action@github.com"');
execSync('git checkout master');

execSync('yarn run docs');

execSync(`yarn polkadot-exec-ghpages --dotfiles --repo ${repo} --dist ${process.env.GH_PAGES_SRC} --dest .`, true);

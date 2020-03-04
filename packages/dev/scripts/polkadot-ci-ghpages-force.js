#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const execSync = require('./execSync');
const rimraf = require('rimraf');

console.log('$ polkadot-ci-ghpages-force', process.argv.slice(2).join(' '));

// ensure we are on master
execSync('git checkout master');

// checkout latest
execSync('git fetch');
execSync('git checkout gh-pages');
execSync('git pull');
execSync('git checkout --orphan gh-pages-temp');

// cleanup
rimraf.sync('node_modules');
rimraf.sync('coverage');
rimraf.sync('packages');
rimraf.sync('test');

// add
execSync('git add -A');
execSync('git commit -am "refresh history"');

// danger, force new
execSync('git branch -D gh-pages');
execSync('git branch -m gh-pages');
execSync('git push -f origin gh-pages');

// switch to master
execSync('git checkout master');

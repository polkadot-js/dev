#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const { execSync } = require('child_process');
const rimraf = require('rimraf');

// ensure we are on master
execSync('git checkout master', { stdio: 'inherit' });

// checkout latest
execSync('git fetch', { stdio: 'inherit' });
execSync('git checkout gh-pages', { stdio: 'inherit' });
execSync('git pull', { stdio: 'inherit' });
execSync('git checkout --orphan gh-pages-temp', { stdio: 'inherit' });

// cleanup
rimraf.sync('node_modules');
rimraf.sync('coverage');
rimraf.sync('packages');
rimraf.sync('test');

// add
execSync('git add -A', { stdio: 'inherit' });
execSync('git commit -am "refresh history"', { stdio: 'inherit' });

// danger, force new
execSync('git branch -D gh-pages', { stdio: 'inherit' });
execSync('git branch -m gh-pages', { stdio: 'inherit' });
execSync('git push -f origin gh-pages', { stdio: 'inherit' });

// switch to master
execSync('git checkout master', { stdio: 'inherit' });

#!/usr/bin/env bash
# Copyright 2017-2020 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the Apache-2.0 license. See the LICENSE file for details.

# ensure we are on master
git checkout master

# checkout latest
git fetch
git checkout gh-pages
git pull
git checkout --orphan gh-pages-temp

# cleanup
rm -rf node_modules
rm -rf coverage
rm -rf packages
rm -rf test

# add
git add -A
git commit -am "refresh history"

# danger, force new
git branch -D gh-pages
git branch -m gh-pages
git push -f origin gh-pages

# switch to master
git checkout master

exit 0

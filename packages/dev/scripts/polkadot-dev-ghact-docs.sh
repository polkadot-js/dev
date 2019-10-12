#!/bin/bash
# Copyright 2017-2019 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the Apache-2.0 license. See the LICENSE file for details.

set -e

REPO=https://${GH_PAT:-"x-access-token:$GITHUB_TOKEN"}@github.com/${GITHUB_REPOSITORY}.git

function run_docs () {
  echo ""
  echo "*** Running docs build"

  yarn run docs

  echo ""
  echo "*** Docs build completed"
}

function git_setup () {
  echo ""
  echo "*** Setting up GitHub for $GITHUB_REPOSITORY"

  git config push.default simple
  git config merge.ours.driver true
  git config user.name "Github Actions"
  git config user.email "action@github.com"
  git checkout master

  echo ""
  echo "*** GitHub setup completed"
}

function deploy_pages () {
  echo ""
  echo "*** Publishing to GitHub Pages"

  yarn run gh-pages --repo $REPO --dist $GH_PAGES_SRC --dest .

  echo ""
  echo "*** GitHub Pages completed"
}

git_setup
run_docs
deploy_pages

echo ""
echo "*** CI gh-pages completed"

exit 0

#!/bin/sh
# Copyright 2017-2020 @polkadot/dev authors & contributors
# SPDX-License-Identifier: Apache-2.0

DIRECTORIES=( "dev" "ts" "wasm" "common" "api" "docs" "ui" "phishing" "extension" "tools" "apps" ) # "client" )

for REPO in "${DIRECTORIES[@]}"; do
  if [ "$REPO" != "" ] && [ -d "./$REPO/.git" ]; then
    echo ""
    echo "*** Removing branches in $REPO"

    cd $REPO

    CURRENT=$(git rev-parse --abbrev-ref HEAD)
    BRANCHES=( $(git branch | awk -F ' +' '! /\(no branch\)/ {print $2}') )

    if [ "$CURRENT" = "master" ]; then
      git fetch
      git pull
    else
      echo "$CURRENT !== master"
    fi

    for BRANCH in "${BRANCHES[@]}"; do
      if [ "$BRANCH" != "$CURRENT" ] && [ "$BRANCH" != "master" ]; then
        git branch -d -f $BRANCH
      fi
    done

    git prune
    git gc

    cd ..
  fi
done

echo ""
echo "*** Updating inter-package-deps"

./dev/all-deps.js

echo ""
echo "*** Restoring updates to detached branches"

for REPO in "${DIRECTORIES[@]}"; do
  if [ "$REPO" != "" ] && [ -d "./$REPO/.git" ]; then
    cd $REPO

    DETACHED=$(git status | grep "HEAD detached")

    if [ "$DETACHED" != "" ]; then
      git reset --hard
    fi

    cd ..
  fi
done

echo ""
echo "*** Installing updated packages"

for REPO in "${DIRECTORIES[@]}"; do
  echo ""
  echo "*** Installing in $REPO"

  cd $REPO

  CURRENT=$(git rev-parse --abbrev-ref HEAD)

  # yarn config set registry "https://npm.pkg.github.com/"
  if [ -f ".yarnrc.yml" ]; then
    # yarn 2, assuming we only use those there
    yarn install | grep -v 'YN0013'
  else
    yarn --ignore-engines
  fi

  if [ "$CURRENT" = "master" ]; then
    # check if we have stuff updated, run tests & checks
    echo "*** Performing master checks"
  fi

  cd ..
done

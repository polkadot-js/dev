#!/bin/sh
# Copyright 2017-2025 @polkadot/dev authors & contributors
# SPDX-License-Identifier: Apache-2.0

# This scripts updates all the inter polkadot-js dependencies. To do so it
# creates a list of all the packages available and then loops through the
# package.json files in the various repos, upgrading the dependecies as found.
#
# In this upgrading step is uses the local all-deps.js script
#
# In addition it also cleans old stale local branches, and performs an overall
# dedupe - all maintenence operations.

DIRECTORIES=( "dev" "wasm" "common" "api" "docs" "ui" "phishing" "extension" "tools" "apps" )

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

./dev/scripts/all-deps.js

echo ""
echo "*** Installing updated packages"

for REPO in "${DIRECTORIES[@]}"; do
  if [ "$REPO" != "" ] && [ -d "./$REPO/.git" ]; then
    echo ""
    cd $REPO

    DETACHED=$(git status | grep "HEAD detached")

    if [ "$DETACHED" != "" ]; then
      echo "*** Resetting $REPO"

      git reset --hard
    else
      echo "*** Installing $REPO"

      yarn install
      yarn dedupe
    fi

    cd ..
  fi
done

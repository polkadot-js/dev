#!/bin/sh
# Copyright 2017-2019 Jaco Greeff
# This software may be modified and distributed under the terms
# of the ISC license. See the LICENSE file for details.

DIRECTORIES=( "dev" "ts" "wasm" "common" "api" "ui" "extension" "apps" "tools" "client" )

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
      git prune
    else
      echo "$CURRENT !== master"
    fi

    for BRANCH in "${BRANCHES[@]}"; do
      if [ "$BRANCH" != "$CURRENT" ] && [ "$BRANCH" != "master" ]; then
        git branch -d -f $BRANCH
      fi
    done

    cd ..
  fi
done

echo ""
echo "*** Updating inter-package-deps"

./dev/all-deps.js

echo ""
echo "*** Installing updated packages"

for REPO in "${DIRECTORIES[@]}"; do
  echo ""
  echo "*** Installing in $REPO"

  cd $REPO

  CURRENT=$(git rev-parse --abbrev-ref HEAD)

  # yarn config set registry "https://npm.pkg.github.com/"
  yarn --ignore-engines

  if [ "$CURRENT" = "master" ]; then
    # check if we have stuff updated, run tests & checks
    echo "*** Performing master checks"
  fi

  cd ..
done

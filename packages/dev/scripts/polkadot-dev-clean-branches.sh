#!/bin/sh
# Copyright 2017-2019 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the Apache-2.0 license. See the LICENSE file for details.

set -e

CURRENT=`pwd`
cd ..

DIRECTORIES=( $(find . -type d -maxdepth 1 | cut -c 3-) )

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

    cd ..
  fi
done

cd $CURRENT

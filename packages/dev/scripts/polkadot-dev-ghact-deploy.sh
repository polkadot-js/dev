#!/bin/bash
# Copyright 2017-2019 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the Apache-2.0 license. See the LICENSE file for details.

set -e

function npm_setup () {
  echo ""
  echo "*** Setting up npm"

  echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc 2> /dev/null

  echo ""
  echo "*** Npm setup completed"
}

function npm_get_version () {
  NPM_VERSION=$(cat package.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g')
}

function npm_publish () {
  echo ""
  echo "*** Copying package files to build"

  rm -rf build/package.json
  cp LICENSE README.md package.json build/

  echo ""
  echo "*** Publishing to npm"

  VERTAG=${NPM_VERSION##*-}
  TAG=""

  if [[ $VERTAG == *"beta"* ]]; then
    TAG="--tag beta"
  fi

  cd build

  local n=1

  while true; do
    (yarn publish --access public --new-version $NPM_VERSION $TAG) && break || {
      if [[ $n -lt 5 ]]; then
        echo "Publish failed on attempt $n/5. Retrying in 15s."
        ((n++))
        sleep 15
      else
        echo "Publish failed on final attempt. Aborting."
        exit 1
      fi
    }
  done

  cd ..

  echo ""
  echo "*** Npm publish completed"
}

function git_push () {
  echo ""
  echo "*** Adding build artifacts"

  git add --all .

  if [ -d "docs" ]; then
    git add --all -f docs
  fi

  echo ""
  echo "*** Committing changed files"

  git commit --no-status --quiet -m "[CI Skip] $NPM_VERSION"

  echo ""
  echo "*** Pushing to GitHub"

  git push --quiet https://${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git master > /dev/null 2>&1

  echo ""
  echo "*** Github push completed"
}

function deploy_all () {
  if [ -f "node_modules/.bin/gh-pages" ]; then
    echo ""
    echo "*** Publishing to GitHub Pages"

    yarn run gh-pages --dist $GH_PAGES_SRC --dest .

    echo ""
    echo "*** GitHub Pages completed"
  fi
}

function loop_func () {
  FUNC=$1

  if [ -f "lerna.json" ]; then
    PACKAGES=( $(ls -1d packages/*) )

    for PACKAGE in "${PACKAGES[@]}"; do
      if [ -f "$PACKAGE/package.json" ]; then
        echo ""
        echo "*** Executing in $PACKAGE"

        cd $PACKAGE
        $FUNC
        cd ../..
      fi
    done
  else
    $FUNC
  fi
}

npm_get_version

git_push

npm_setup
loop_func npm_publish

deploy_all

echo ""
echo "*** CI deploy completed"

exit 0

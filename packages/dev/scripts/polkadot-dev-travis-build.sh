#!/bin/bash
# Copyright 2017-2019 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the Apache-2.0 license. See the LICENSE file for details.

set -e

BUMP_VERSION=

function run_clean () {
  echo ""
  echo "*** Running clean"

  yarn run polkadot-dev-clean-build

  echo ""
  echo "*** Checks completed"
}

function run_check () {
  echo ""
  echo "*** Running checks"

  yarn run lint

  echo ""
  echo "*** Checks completed"
}

function run_test () {
  echo ""
  echo "*** Running tests"

  yarn run test

  if [ -f "coverage/lcov.info" ]; then
    echo ""
    echo "*** Submitting coverage"

    if [ -n "$COVERALLS_REPO_TOKEN" ]; then
      cat coverage/lcov.info | yarn run coveralls
    fi
  fi

  echo ""
  echo "*** Tests completed"
}

function run_build () {
  echo ""
  echo "*** Running build"

  yarn run build

  echo ""
  echo "*** Build completed"
}

function lerna_get_version () {
  LERNA_VERSION=$(cat lerna.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g')
}

function lerna_bump () {
  echo ""
  echo "*** Incrementing lerna version"

  lerna_get_version
  LERNA_VERSION_PRE="$LERNA_VERSION"
  TAG=${LERNA_VERSION_PRE##*-}

  if [[ $TAG == *"beta"* ]]; then
    # if we have a beta version, just continue the stream of betas
    yarn run polkadot-dev-version-beta
  else
    LAST=${TAG##*.}

    if [[ $LAST == "0" ]]; then
      # patch is .0, so publish this as an actual release (surely we did out job on beta)
      yarn run polkadot-dev-version-patch
    else
      # non-zero patch version, continue as next beta minor
      yarn run lerna version preminor --preid beta --yes --no-git-tag-version --no-push --allow-branch '*'
    fi
  fi

  git add --all .

  lerna_get_version
  LERNA_VERSION_POST="$LERNA_VERSION"

  echo ""
  echo "*** Lerna increment completed"
}

function npm_bump () {
  echo ""
  echo "*** Incrementing npm version"

  yarn config set version-sign-git-tag false
  yarn config set version-git-tag false
  yarn config set version-git-message "$GIT_MESSAGE"
  yarn version --new-version $BUMP_VERSION
  git add --all .

  echo ""
  echo "*** Npm increment completed"
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

function git_setup () {
  echo ""
  echo "*** Setting up GitHub for $TRAVIS_REPO_SLUG"

  git config push.default simple
  git config merge.ours.driver true
  git config user.name "Travis CI"
  git config user.email "$COMMIT_AUTHOR_EMAIL"
  git remote set-url origin https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git > /dev/null 2>&1

  git checkout $TRAVIS_BRANCH

  echo ""
  echo "*** GitHub setup completed"
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

  git push --quiet origin HEAD:refs/heads/$TRAVIS_BRANCH > /dev/null 2>&1

  echo ""
  echo "*** Github push completed"
}

function git_bump () {
  if [ -f "lerna.json" ]; then
    lerna_bump

    if [ "$LERNA_VERSION_PRE" != "$LERNA_VERSION_POST" ]; then
      BUMP_VERSION="$LERNA_VERSION"
    fi
  else
    BUMP_VERSION="patch"
  fi

  if [ -n "$BUMP_VERSION" ]; then
    npm_bump
  fi

  npm_get_version
}

function deploy_all () {
  if [ -f "node_modules/.bin/gh-pages" ]; then
    echo ""
    echo "*** Publishing to GitHub Pages"

    GH_PAGES_DST="."

    if [ "$TRAVIS_BRANCH" == "next" ]; then
      GH_PAGES_DST="next"
    fi

    yarn run gh-pages --dist $GH_PAGES_SRC --dest $GH_PAGES_DST

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

run_clean
run_check
run_test

if [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  git_setup

  if [ "$TRAVIS_BRANCH" == "master" ]; then
    git_bump
  fi
fi

run_build

echo ""
echo "*** CI completed"

exit 0

#!/usr/bin/env bash
# Copyright 2017-2020 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the Apache-2.0 license. See the LICENSE file for details.

# For codeclimate
#   curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
#   chmod +x ./cc-test-reporter
#
# Needs CC_TEST_REPORTER_ID
#
#   ./cc-test-reporter before-build
#   yarn test
#   ./cc-test-reporter after-build --exit-code 0

set -e

REPO=https://${GH_PAT:-"x-access-token:$GITHUB_TOKEN"}@github.com/${GITHUB_REPOSITORY}.git
NPMREG="registry.npmjs.org"

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

  if [ -f "coverage/lcov.info" ] && [ -n "$COVERALLS_REPO_TOKEN" ]; then
    echo ""
    echo "*** Submitting to coveralls.io"

    (cat coverage/lcov.info | yarn run coveralls) || true
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
    yarn run polkadot-dev-version --type prerelease
  else
    PATCH=${TAG##*.}

    if [ -n "$CI_NO_BETA" ]; then
      # don't allow beta versions
      yarn run polkadot-dev-version --type patch
    elif [[ $PATCH == "0" ]]; then
      # patch is .0, so publish this as an actual release (surely we did out job on beta)
      yarn run polkadot-dev-version --type patch
    elif [[ $PATCH == "1" ]]; then
      # continue with first new minor as beta
      yarn run polkadot-dev-version --type preminor
    else
      echo "*** Not setting version, patch detected"
      echo "$LERNA_VERSION" >> .123trigger
    fi
  fi

  # we will have inter-package mismatches, resolve
  yarn
  git add --all .

  lerna_get_version
  LERNA_VERSION_POST="$LERNA_VERSION"

  echo ""
  echo "*** Lerna increment completed"
}

function npm_bump () {
  echo ""
  echo "*** Incrementing npm version"

  npm --no-git-tag-version --force version patch
  yarn
  git add --all .

  echo ""
  echo "*** Npm increment completed"
}

function npm_get_version () {
  if [ -f "lerna.json" ]; then
    NPM_VERSION="$LERNA_VERSION"
  else
    NPM_VERSION=$(cat package.json \
      | grep version \
      | head -1 \
      | awk -F: '{ print $2 }' \
      | sed 's/[",]//g')
  fi
}

function npm_setup () {
  echo ""
  echo "*** Setting up npm for $NPMREG"

  echo "//$NPMREG/:_authToken=$NPM_TOKEN" > ~/.npmrc 2> /dev/null

  echo ""
  echo "*** Npm setup completed"
}

function npm_publish () {
  if [ -f ".skip-npm" ]; then
    return
  fi

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

  # yarn config set registry "https://$NPMREG"

  while true; do
    (npm publish --access public $TAG) && break || {
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
  echo "*** Setting up GitHub for $GITHUB_REPOSITORY"

  git config push.default simple
  git config merge.ours.driver true
  git config user.name "Github Actions"
  git config user.email "action@github.com"
  git checkout master

  echo ""
  echo "*** GitHub setup completed"
}

function git_bump () {
  if [ -f "lerna.json" ]; then
    lerna_bump
  else
    npm_bump
  fi

  npm_get_version
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

  # add the skip checks for GitHub ...
  git commit --no-status --quiet -m "[CI Skip] $NPM_VERSION


skip-checks: true"

  echo ""
  echo "*** Pushing to GitHub"

  git push $REPO HEAD:$GITHUB_REF

  echo ""
  echo "*** Github push completed"
}

function loop_func () {
  FUNC=$1

  if [ -f "lerna.json" ]; then
    PACKAGES=( $(ls -1d packages/*) )

    for PACKAGE in "${PACKAGES[@]}"; do
      if [ -f "$PACKAGE/package.json" ] && [ -d "$PACKAGE/build" ]; then
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

git_setup
git_bump
npm_setup
npm_get_version

run_clean
run_check
run_test
run_build

git_push

if [ -z "$NPM_SKIP" ]; then
  loop_func npm_publish
fi

echo ""
echo "*** CI build completed"

exit 0

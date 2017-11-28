#!/bin/bash
# ISC, Copyright 2017 Jaco Greeff

set -e

GIT_MESSAGE="[CI Skip] %s"

function check_build () {
  echo ""
  echo "*** Running build checks"

  yarn run check

  echo ""
  echo "*** Running build"

  yarn run build

  echo ""
  echo "*** Running tests"

  yarn run test

  if [ -f ".coveralls.yml" ]; then
    echo ""
    echo "*** Submitting coverage"

    cat coverage/lcov.info | yarn run coveralls
  fi

  echo ""
  echo "*** Build checks completed"
}

function git_setup () {
  echo ""
  echo "*** Setting up GitHub for $TRAVIS_REPO_SLUG"

  git config push.default simple
  git config merge.ours.driver true
  git config user.name "Travis CI"
  git config user.email "$COMMIT_AUTHOR_EMAIL"
  git remote set-url origin https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git > /dev/null 2>&1

  echo ""
  echo "*** Adding build artifacts"

  git add .

  echo ""
  echo "*** GitHub setup completed"
}

function package_bump () {
  echo ""
  echo "*** Incrementing package version"

  yarn config set version-git-message "$GIT_MESSAGE"
  yarn version --new-version patch

  echo ""
  echo "*** Pushing increment to GitHub"

  git push --quiet --tags origin HEAD:refs/heads/$TRAVIS_BRANCH > /dev/null 2>&1

  echo ""
  echo "*** Package increment completed"
}

function lerna_bump () {
  echo ""
  echo "*** Incrementing lerna version"

  lerna publish --skip-npm --yes --message "$GIT_MESSAGE" --cd-version patch

  echo ""
  echo "*** Lerna increment completed"
}

function npm_setup () {
  echo ""
  echo "*** Setting up .npmrc"

  yarn run makeshift

  echo ""
  echo "*** Npm setup completed"
}

function publish_npm () {
  PACKAGE_VERSION=$(cat package.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g')

  if [ ! -f ".npmroot" ]; then
    echo ""
    echo "*** Copying package files to build"

    cp LICENSE README.md package.json build/
    cd build
  fi

  echo ""
  echo "*** Publishing to npm"

  yarn publish --access public --new-version $PACKAGE_VERSION

  echo ""
  echo "*** Npm publish completed"

  if [ ! -f "../.npmroot" ]; then
    cd ..
  fi
}

if [ -d "packages" ]; then
  PACKAGES=( $(ls -1d packages/*) )

  for PACKAGE in "${PACKAGES[@]}"; do
    echo ""
    echo "*** Executing in $PACKAGE"

    pushd $PACKAGE
    check_build
    popd
  done
else
  check_build
fi

if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "master" ]; then
  echo ""
  echo "*** Branch check completed"

  exit 0
fi

git_setup

if [ -n "$PACKAGES" ] then
  lerna_bump
else
  package_bump
fi

if [ -n "$NPM_TOKEN" ]; then
  npm_setup

  if [ -n "$PACKAGES" ]; then
    for PACKAGE in "${PACKAGES[@]}"; do
      pushd $PACKAGE
      publish_npm
      popd
    done
  else
    publish_npm
  fi
fi

echo ""
echo "*** CI completed"

exit 0

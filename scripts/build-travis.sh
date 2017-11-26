#!/bin/bash
# ISC, Copyright 2017 Jaco Greeff

set -e

WITH_ROOT=

while [ "$1" != "" ]; do
  case $1 in
    root )
      WITH_ROOT=1
      ;;
    * )
      echo "*** Unknown option $1"
      ;;
  esac
  shift
done

echo ""
echo "*** Running code checks"

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

if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "master" ]; then
  echo ""
  echo "*** Branch check completed"

  exit 0
fi

echo ""
echo "*** Setting up GitHub config for $TRAVIS_REPO_SLUG"

git config push.default simple
git config merge.ours.driver true
git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"
git remote set-url origin https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git > /dev/null 2>&1

if [ -n "$(git status --untracked-files=no --porcelain)" ]; then
  echo ""
  echo "*** Adding build artifacts"

  git add .
  git commit -m "[CI Skip] Build artifacts"
fi

echo ""
echo "*** Incrementing package version"

yarn config set version-git-message "[CI Skip] %s"
yarn version --new-version patch

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

echo ""
echo "*** Pushing version update to GitHub"

git push --quiet --tags origin HEAD:refs/heads/$TRAVIS_BRANCH > /dev/null 2>&1

echo ""
echo "*** Setting up .npmrc"

yarn run makeshift

if [  "$WITH_ROOT" == "" ]; then
  echo ""
  echo "*** Copying package files to build"

  cp LICENSE package.json build/
  cd build
fi

echo ""
echo "*** Publishing to npm"

yarn publish --access public --new-version $PACKAGE_VERSION

if [ "$WITH_ROOT" != "" ]; then
  cd ..
fi

echo ""
echo "*** Release completed"

exit 0

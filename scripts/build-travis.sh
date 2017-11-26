#!/bin/bash
# ISC, Copyright 2017 Jaco Greeff

set -e

WITH_BUILD=
WITH_CHECK=
WITH_COVERALLS=
WITH_FULL=
WITH_PUBLISH=
WITH_TEST=

while [ "$1" != "" ]; do
  case $1 in
    build )
      WITH_BUILD=1
      ;;
    check )
      WITH_CHECK=1
      ;;
    coveralls )
      WITH_COVERALLS=1
      ;;
    full )
      WITH_FULL=1
      ;;
    publish )
      WITH_PUBLISH=1
      ;;
    test )
      WITH_TEST=1
      ;;
    * )
      echo "*** Unknown option $1"
      exit 1
      ;;
  esac
  shift
done

if [ "$WITH_CHECK" != "" ]; then
  echo ""
  echo "*** Running code check"

  yarn run check
fi

if [ "$WITH_BUILD" != "" ]; then
  echo ""
  echo "*** Running build"

  yarn run build
fi

if [ "$WITH_TEST" != "" ]; then
  echo ""
  echo "*** Running test suite"

  yarn run test

  if [ "$WITH_COVERALLS" != "" ]; then
    echo ""
    echo "*** Submitting coverage to coveralls.io"

    node_modules/.bin/coveralls < coverage/lcov.info
  fi
fi

# Pull requests and commits to other branches shouldn't try to deploy, just build to verify
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

echo ""
echo "*** Pushing version update to GitHub"

git push --quiet --tags origin HEAD:refs/heads/$TRAVIS_BRANCH > /dev/null 2>&1

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

if [ "$WITH_PUBLISH" != "" ]; then
  echo ""
  echo "*** Setting up .npmrc"

  node_modules/.bin/makeshift

  if [  "$WITH_FULL" == "" ]; then
    echo ""
    echo "*** Copying package files to build"

    cp LICENSE package.json build/
    cd build
  fi

  echo ""
  echo "*** Publishing to npm"

  yarn publish --access public --new-version $PACKAGE_VERSION

  if [ "$WITH_FULL" != "" ]; then
    cd ..
  fi
fi

echo ""
echo "*** Release completed"

exit 0

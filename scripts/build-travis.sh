#!/bin/bash
# ISC, Copyright 2017 Jaco Greeff

set -e

WITH_BUILD=
WITH_CHECK=
WITH_COVERALLS=
WITH_NPM=
WITH_NPM_FULL=
WITH_TEST=

while [ "$1" != "" ]; do
  echo "command: $1"

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
    npm )
      WITH_NPM=1
      ;;
    npmfull )
      WITH_NPM_FULL=1
      ;;
    test )
      WITH_TEST=1
      ;;
    * )
      echo "Unknown option $1"
      exit 1
      ;;
  esac
  shift
done

if [ "$WITH_CHECK" != "" ]; then
  echo "Running code check"

  npm run check
fi

if [ "$WITH_BUILD" != "" ]; then
  echo "Running build"

  npm run build
fi

if [ "$WITH_TEST" != "" ]; then
  echo "Running test suite"

  npm run test

  if [ "$WITH_COVERALLS" != "" ]; then
    echo "Submitting coverage to coveralls.io"

    node_modules/.bin/coveralls < coverage/lcov.info
  fi
fi

# Pull requests and commits to other branches shouldn't try to deploy, just build to verify
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "master" ]; then
  echo "Branch check completed"

  exit 0
fi

echo "Setting up GitHub config for $TRAVIS_REPO_SLUG"

git config push.default simple
git config merge.ours.driver true
git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"
git remote set-url origin https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git > /dev/null 2>&1

if [ -n "$(git status --untracked-files=no --porcelain)" ]; then
  echo "Adding build artifacts"

  git add .
  git commit -m "[CI Skip] Build artifacts"
fi

echo "Incrementing package version"

npm --no-git-tag-version version
npm version patch -m "[CI Skip] Version bump"
git push --quiet origin HEAD:refs/heads/$TRAVIS_BRANCH > /dev/null 2>&1

if [ "$WITH_NPM" != "" ]; then
  echo "Publishing to npm"

  node_modules/.bin/makeshift

  if [ "$WITH_NPM_FULL" != "" ]; then
    mkdir -p lib
    cp LICENSE package.json package-lock.json lib/
    cd lib
  fi

  npm publish

  if [ "$WITH_NPM_FULL" != "" ]; then
    cd ..
  fi
fi

echo "Travis completed"

exit 0

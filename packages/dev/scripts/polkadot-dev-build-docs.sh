#!/bin/bash
# Copyright 2017-2019 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the Apache-2.0 license. See the LICENSE file for details.

set -e

DOCROOT=docs

function build_docs () {
  ROOT=$1
  DOCPATH=${ROOT/packages/.}

  typedoc --theme markdown --out ./$DOCROOT/$DOCPATH $ROOT/src
}

if [ -d "docs" ]; then
  DOCROOT=build-docs

  rm -rf ./$DOCROOT
  cp -rf ./docs ./$DOCROOT
fi

if [ -f "typedoc.js" ]; then
  PACKAGES=( $(ls -1d packages/*) )

  for PACKAGE in "${PACKAGES[@]}"; do
    if [ ! -f "$PACKAGE/.nodoc" ]; then
      if [ -d "$PACKAGE/src" ]; then
        echo ""
        echo "*** Executing in $PACKAGE"

        build_docs "$PACKAGE"
      fi
    fi
  done

  echo ""
  echo "*** Copying root markdown"
  cp -f CHANGELOG.md CONTRIBUTING.md ./$DOCROOT

  if [ -d "docs/.vuepress" ]; then
    echo ""
    echo "*** Building via vuepress"

    yarn vuepress build $DOCROOT

    echo ""
    echo "*** Copying vuepress generated outputs"
    rm -rf ./$DOCROOT/assets
    cp -rf ./$DOCROOT/.vuepress/dist/* ./$DOCROOT
    rm -rf ./$DOCROOT/.vuepress/dist
  fi

  echo ""
  echo "*** Docs completed"
fi

exit 0

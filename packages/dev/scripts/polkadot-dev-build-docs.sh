#!/bin/bash
# Copyright 2017-2018 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the ISC license. See the LICENSE file for details.

set -e

function build_docs () {
  ROOT=$1

  if [ ! -f "$ROOT/.nodoc" ]; then
    echo ""
    echo "*** Building via typedoc"

    DOCROOT=${ROOT/packages/.}
    typedoc --theme markdown --out ./docs/$DOCROOT $ROOT/src

    # detect gitbook
    if [ -f "book.json" ]; then
      yarn gitbook build
      cp -r ./_book/* ./docs
    fi

    echo ""
    echo "*** Docs completed"
  fi
}

PACKAGES=( $(ls -1d packages/*) )
rm -rf docs

for PACKAGE in "${PACKAGES[@]}"; do
  echo ""
  echo "*** Executing in $PACKAGE"

  build_docs "$PACKAGE"
done

cd ..

exit 0

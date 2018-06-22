#!/bin/bash
# Copyright 2017-2018 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the ISC license. See the LICENSE file for details.

set -e

function build_js () {
  ROOT=$1

  echo ""
  echo "*** Cleaning build directory"

  rimraf $ROOT/build
  cd $ROOT

  if [ -d "public" ]; then
    echo ""
    echo "*** Compiling via webpack"

    NODE_ENV=production webpack --config webpack.config.js
  else
    echo ""
    echo "*** Compiling via tsc & babel"

    cd src
    FILES=$(find . -name '*.ts' -o -name '*.tsx' -print)
    echo $FILES
    cd ..

    pwd
    # tsc --listEmittedFiles --outDir build --declaration --jsx preserve --emitDeclarationOnly src
    babel src --config-file ../../babel.config.js --out-dir build --extensions ".ts,.tsx" --ignore "**/*.d.ts"

    echo ""
    echo "*** Adjusting spec and declaration paths"

    # rimraf build/*.spec.ts build/*.d.js build/**/*.spec.ts build/**/*.d.js
    ncp src/ build --filter "\.d\.js"

    # if [ -d "flow-typed" ]; then
    #   echo ""
    #   echo "*** Copying flow types (libraries)"

    #   ncp flow-typed build/flow-typed
    # fi
  fi

  cd ../..

  echo ""
  echo "*** Build completed"
}

yarn run polkadot-dev-clean-build

cd packages
tsc --emitDeclarationOnly
cd ..

PACKAGES=( $(ls -1d packages/*) )

for PACKAGE in "${PACKAGES[@]}"; do
  echo ""
  echo "*** Executing in $PACKAGE"

  build_js "$PACKAGE"
done

exit 0

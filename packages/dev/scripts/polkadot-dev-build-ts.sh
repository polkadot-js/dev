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

    pwd
    tsc --listEmittedFiles --rootDir src --outDir build --emitDeclarationOnly
    babel src --config-file ../../babel.config.js --out-dir build --ignore '*.spec.js,*.d.ts' --extensions ".ts,.tsx"

    echo ""
    echo "*** Adjusting spec and declaration paths"

    rimraf build/*.spec.ts build/*.d.js build/**/*.spec.ts build/**/*.d.js
    ncp src build --filter "^(spec).ts"

    if [ -d "flow-typed" ]; then
      echo ""
      echo "*** Copying flow types (libraries)"

      ncp flow-typed build/flow-typed
    fi
  fi

  cd ../..

  echo ""
  echo "*** Build completed"
}

if [ -d "packages" ]; then
  PACKAGES=( $(ls -1d packages/*) )

  for PACKAGE in "${PACKAGES[@]}"; do
    echo ""
    echo "*** Executing in $PACKAGE"

    build_js "$PACKAGE"
  done
fi

if [ -d "src" ]; then
  build_js "."
fi

exit 0

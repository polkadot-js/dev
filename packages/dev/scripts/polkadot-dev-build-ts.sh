#!/bin/bash
# Copyright 2017-2019 @polkadot/dev authors & contributors
# This software may be modified and distributed under the terms
# of the Apache-2.0 license. See the LICENSE file for details.

set -e

function build_js () {
  ROOT=$1

  cd $ROOT

  if [ -d "public" ]; then
    echo ""
    echo "*** Compiling via webpack"

    NODE_ENV=production webpack --config webpack.config.js
  else
    echo ""
    echo "*** Compiling via tsc & babel"

    pwd
    babel src --config-file ../../babel.config.js --out-dir build --extensions ".ts,.tsx" --ignore "**/*.d.ts"

    echo ""
    echo "*** Copying static resources"

    cp -f package.json build/
    cpx "src/**/*.css" build
    cpx "src/**/*.gif" build
    cpx "src/**/*.jpg" build
    cpx "src/**/*.png" build
    cpx "src/**/*.svg" build

    echo ""
    echo "*** Copying declarations & JS sources"

    cpx "src/**/*.d.ts" build
    cpx "src/**/*.js" build

    if [ -d "../../build/$ROOT/src" ]; then
      cpx "../../build/$ROOT/src/**/*.d.ts" build
    fi

    # lerna one package
    if [ -d "../../build/src" ]; then
      cpx "../../build/src/**/*.d.ts" build
    fi

    # lerna multiple packages
    if [ -d "../../build/packages/$ROOT/src" ]; then
      cpx "../../build/packages/$ROOT/src/**/*.d.ts" build
    fi
  fi

  cd ..

  echo ""
  echo "*** Build completed"
}

yarn run polkadot-dev-clean-build

cd packages
tsc --version
tsc --emitDeclarationOnly --outdir ../build

PACKAGES=( $(ls -1d *) )

for PACKAGE in "${PACKAGES[@]}"; do
  if [ -d "$PACKAGE/src" ]; then
    echo ""
    echo "*** Executing in $PACKAGE"

    build_js "$PACKAGE"
  fi
done

cd ..

exit 0

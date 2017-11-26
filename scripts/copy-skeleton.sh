#!/bin/bash
# ISC, Copyright 2017 Jaco Greeff

set -e

SRC=node_modules/@polkadot/dev/skeleton

cp -fv $SRC/.babelrc $SRC/.coveralls.yml $SRC/.flowconfig $SRC/.gitignore $SRC/.npmignore $SRC/.stylelintrc.json $SRC/.travis.yml $SRC/jest.config.js .
cp -fv $SRC/../.coveralls.yml $SRC/../.editorconfig .

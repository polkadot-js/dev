#!/bin/bash
# Copyright 2017-2018 Jaco Greeff
# This software may be modified and distributed under the terms
# of the ISC license. See the LICENSE file for details.

set -e

SRC=node_modules/@polkadot/dev/skeleton

DOTS=( "babelrc" "codeclimate.yml" "editorconfig" "eslintignore" "eslintrc.json" "flowconfig" "gitignore" "npmignore" "stylelintrc.json" "travis.yml" )
COPY=( "jest.config.js" "lerna.json" )

for FILE in ${DOTS[@]}
do
  echo "Updating .$FILE"
  cat $SRC/$FILE > ./.$FILE
done

for FILE in ${COPY[@]}
do
  echo "Updating $FILE"
  cat $SRC/$FILE > ./$FILE
done

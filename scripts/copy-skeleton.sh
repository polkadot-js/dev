#!/bin/bash
# ISC, Copyright 2017 Jaco Greeff

set -e

SRC=node_modules/@polkadot/dev/skeleton

DOTS=( "babelrc" "eslintrc.json" "flowconfig" "gitignore" "npmignore" "stylelintrc.json" "travis.yml" )
COPY=( "jest.config.js" "../.coveralls.yml" "../.editorconfig" )

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

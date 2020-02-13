#!/bin/bash

function copy_folder () {
  SRC="packages/$1/build"
  DST="../apps/node_modules/@polkadot/$2"

  echo "** Copying $SRC to $DST"

  rm -rf $DST
  cp -r $SRC $DST
}

yarn build

copy_folder "dev" "dev"

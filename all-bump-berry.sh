#!/bin/sh
# Copyright 2017-2021 @polkadot/dev authors & contributors
# SPDX-License-Identifier: Apache-2.0

DIRECTORIES=( "ts" "wasm" "common" "api" "docs" "ui" "phishing" "extension" "tools" "apps" ) # "client" )

for PKG in "${DIRECTORIES[@]}"; do
  echo "*** Updating yarn in $PKG"
  rm -rf $PKG/.yarn/plugins $PKG/.yarn/releases
  cp -R dev/.yarn/plugins $PKG/.yarn
  cp -R dev/.yarn/releases $PKG/.yarn
  cat dev/.yarnrc.yml > $PKG/.yarnrc.yml

  cd $PKG
  yarn
  cd ..
done

#!/bin/sh
# Copyright 2017-2021 @polkadot/dev authors & contributors
# SPDX-License-Identifier: Apache-2.0

DIRECTORIES=( "ts" "wasm" "common" "api" "docs" "ui" "phishing" "extension" "tools" "apps" )

for PKG in "${DIRECTORIES[@]}"; do
  echo "*** Updating yarn in $PKG"
  cd $PKG
  git pull
  rm -rf .yarn/plugins .yarn/releases
  cp -R ../dev/.yarn/plugins .yarn
  cp -R ../dev/.yarn/releases .yarn
  cat ../dev/.yarnrc.yml > .yarnrc.yml
  yarn
  cd ..
done

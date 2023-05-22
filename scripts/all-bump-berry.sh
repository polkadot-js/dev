#!/bin/sh
# Copyright 2017-2023 @polkadot/dev authors & contributors
# SPDX-License-Identifier: Apache-2.0

DIRECTORIES=( "wasm" "common" "api" "docs" "ui" "phishing" "extension" "tools" "apps" )

# update to latest inside dev
cd dev
echo "*** Updating yarn in dev"
git pull
yarn set version berry
# NOTE: For yarn 4.0 the plugin imports should be removed
yarn plugin import @yarnpkg/plugin-interactive-tools
yarn plugin import @yarnpkg/plugin-version
yarn
cd ..

# update all our existing polkadot-js projects
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

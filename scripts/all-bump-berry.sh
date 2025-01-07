#!/bin/sh
# Copyright 2017-2025 @polkadot/dev authors & contributors
# SPDX-License-Identifier: Apache-2.0

# This scripts updates and aligns the version of yarn berry used. It follows
# the following approach -
#
# 1. Updates the version of yarn berry in the dev project
# 2. Performs an install in dev to upgrade the locks/plugins
# 3. Loops through each of the polkadot-js projects, copying the
#    config from dev

DIRECTORIES=( "wasm" "common" "api" "docs" "ui" "phishing" "extension" "tools" "apps" )

# update to latest inside dev
cd dev
echo "*** Updating yarn in dev"
git pull
yarn set version latest
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

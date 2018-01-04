#!/bin/sh
# ISC, Copyright 2017-2018 Jaco Greeff

set -e

if [ -d "packages" ]; then
  lerna publish --skip-git --skip-npm --yes --cd-version minor
fi

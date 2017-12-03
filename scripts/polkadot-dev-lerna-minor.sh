#!/bin/sh

set -e

if [ -d "packages" ]; then
  lerna publish --skip-git --skip-npm --yes --cd-version minor
fi

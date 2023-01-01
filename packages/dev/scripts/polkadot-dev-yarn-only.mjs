#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

if (process.env.npm_execpath.includes('yarn')) {
  process.exit(0);
}

const blank = ''.padStart(75);

console.error(
  `${blank}\n   FATAL: The use of yarn is required, install via npm is not supported.   \n${blank}`
);
console.error(`
    Technical explanation: All the projects in the @polkadot' family use
    yarn workspaces, along with hoisting of dependencies. Currently only
    yarn supports package.json workspaces, hence the limitation.

    If yarn is not available, you can get it from https://yarnpkg.com/

`);

process.exit(1);

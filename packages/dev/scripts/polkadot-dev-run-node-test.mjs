#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { execNodeTsSync, readdirSync } from './util.mjs';

const cmd = process.argv.slice(2).join(' ');

console.log('$ polkadot-run-node-test', cmd);

const files = readdirSync('packages', ['.spec.ts', '.spec.tsx']).filter((f) =>
  f
    .split(/[\\/]/)
    .some((p) => p === 'src')
);

if (files.length === 0) {
  throw new Error('No *.spec.{ts, tsx} files found');
}

execNodeTsSync(`-r @polkadot/dev/node/require-test.cjs --test ${cmd} ${files.join(' ')}`);

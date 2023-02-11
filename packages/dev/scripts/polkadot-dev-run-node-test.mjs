#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { execNodeTsSync, readdirSync } from './util.mjs';

const EXTS = ['.spec.ts', '.spec.tsx', '.test.ts', '.test.tsx'];

const args = process.argv.slice(2);

console.log('$ polkadot-run-node-test', args.join(' '));

const cmd = [];
const filters = [];

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('-')) {
    cmd.push(args[i]);
    cmd.push(args[++i]);
  } else {
    filters.push(args[i].split(/[\\/]/));
  }
}

const files = readdirSync('packages', EXTS).filter((f) => {
  const parts = f.split(/[\\/]/);

  if (!parts.some((p) => p === 'src')) {
    return false;
  } else if (filters.length) {
    return filters.some((filter) =>
      parts
        .map((_, i) => i)
        .filter((i) => parts[i].startsWith(filter[0]))
        .some((start) =>
          filter.every((f, i) =>
            parts[start + i] &&
            parts[start + i].startsWith(f)
          )
        )
    );
  }

  return true;
});

if (files.length === 0) {
  throw new Error('No matching .{spec, test}.{ts, tsx} files found');
}

execNodeTsSync(`--require @polkadot/dev/node/require-test.cjs --test ${cmd.join(' ')} ${files.join(' ')}`);

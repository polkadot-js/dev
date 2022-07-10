#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import madge from 'madge';

console.log('$ polkadot-dev-circular', process.argv.slice(2).join(' '));

const res = await madge('./', { fileExtensions: ['ts', 'tsx'] });

const circular = res.circular();

if (circular.length) {
  process.stdout.write(`Found ${circular.length} circular dependencies\n`);
} else {
  process.stdout.write('No circular dependency found!\n');
}

circular.forEach((path, idx) => {
  process.stdout.write(`${(idx + 1).toString().padStart(4)}: `);

  path.forEach((module, idx) => {
    if (idx) {
      process.stdout.write(' > ');
    }

    process.stdout.write(module);
  });

  process.stdout.write('\n');
});

if (circular.length) {
  throw new Error('failed');
}

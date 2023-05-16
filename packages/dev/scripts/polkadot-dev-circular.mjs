#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-expect-error For scripts we don't include @types/* definitions
import madge from 'madge';

import { exitFatal } from './util.mjs';

console.log('$ polkadot-dev-circular', process.argv.slice(2).join(' '));

const res = await madge('./', { fileExtensions: ['ts', 'tsx'] });

/** @type {string[][]} */
const circular = res.circular();

if (!circular.length) {
  process.stdout.write('No circular dependency found!\n');
  process.exit(0);
}

const err = `Failed with ${circular.length} circular dependencies`;
const all = circular
  .map((files, idx) => `${(idx + 1).toString().padStart(4)}: ${files.join(' > ')}`)
  .join('\n');

process.stdout.write(`\n${err}:\n\n${all}\n\n`);

exitFatal(err);

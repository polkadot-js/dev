#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import process from 'node:process';

import { execNodeTsSync, exitFatal, readdirSync } from './util.mjs';

// A & B are just helpers here and in the errors below
const EXT_A = ['spec', 'test'];
const EXT_B = ['ts', 'tsx', 'js', 'jsx', 'cjs', 'mjs'];

// The actual extensions we are looking for
const EXTS = EXT_A.reduce((exts, s) => exts.concat(...EXT_B.map((e) => `.${s}.${e}`)), []);

const args = process.argv.slice(2);

console.log('$ polkadot-run-node-test', args.join(' '));

const cmd = [];
const filters = [];
let reqEnv = 'node';

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('-')) {
    switch (args[i]) {
      // for --browser/node we just tweak the default environment require
      case '--browser':
      case '--node':
        reqEnv = args[i].slice(2);
        break;

      // -- means that all following args are passed-through as-is
      case '--':
        while (++i < args.length) {
          cmd.push(args[i]);
        }

        break;

      // any other arguments are passed-through (check of skipping here)
      default:
        cmd.push(args[i]);

        // for --<param> we only push when no = is included (self-contained)
        if (!args[i].startsWith('--') || !args[i].includes('=')) {
          cmd.push(args[++i]);
        }

        break;
    }
  } else {
    // no "-"" found, so we use these as path filters
    filters.push(args[i]);
  }
}

const filterParts = filters.map((f) => f.split(/[\\/]/));

const files = readdirSync('packages', EXTS).filter((f) => {
  const parts = f.split(/[\\/]/);

  return !filters.length || filterParts.some((filter) =>
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
});

if (files.length === 0) {
  exitFatal(`No files matching *.{${EXT_A.join(', ')}}.{${EXT_B.join(', ')}} found${filters.length ? ` (filtering on ${filters.join(', ')})` : ''}`);
}

execNodeTsSync(`--require @polkadot/dev/node/require-test/${reqEnv} --test ${cmd.join(' ')} ${files.join(' ')}`);

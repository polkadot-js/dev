#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import process from 'node:process';

import { execNodeTsSync, execSync, exitFatal, importPath, readdirSync } from './util.mjs';

// A & B are just helpers here and in the errors below
const EXT_A = ['spec', 'test'];
const EXT_B = ['ts', 'tsx', 'js', 'jsx', 'cjs', 'mjs'];

// The actual extensions we are looking for
const EXTS = EXT_A.reduce((exts, s) => exts.concat(...EXT_B.map((e) => `.${s}.${e}`)), []);

const args = process.argv.slice(2);

console.log('$ polkadot-dev-run-test', args.join(' '));

const cmd = [];
const nodeFlags = [];
const filters = [];
const filtersCont = [];
const filtersExcl = [];
const filtersIncl = [];
let testEnv = 'jest';

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('-')) {
    switch (args[i]) {
      // environment, not passed-htrough
      case '--env':
        if (!['browser', 'jest', 'node'].includes(args[++i])) {
          throw new Error(`Invalid --env ${args[i]}, expected 'browser', 'node' or 'jest'`);
        }

        testEnv = args[i];
        break;

      // additional node flags (with args)
      case '--import':
      case '--loader':
      case '--require':
        nodeFlags.push(args[i]);

        if (!args[i].includes('=')) {
          nodeFlags.push(args[++i]);
        }

        break;

      // node flags without additional params
      case '--experimental-vm-modules':
      case '--no-warnings':
        nodeFlags.push(args[i]);
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

    if (args[i].startsWith('~')) {
      filtersCont.push(args[i].slice(1).split(/[\\/]/));
    } else if (args[i].startsWith('^')) {
      filtersExcl.push(args[i].slice(1).split(/[\\/]/));
    } else {
      filtersIncl.push(args[i].split(/[\\/]/));
    }
  }
}

const applyFilters = (parts, filters) =>
  filters.some((filter) =>
    parts
      .map((_, i) => i)
      .filter((i) =>
        filter.length === 1
          ? parts[i].startsWith(filter[0])
          : parts[i] === filter[0]
      )
      .some((start) =>
        filter.every((f, i) =>
          parts[start + i] && (
            i === (filter.length - 1)
              ? parts[start + i].startsWith(f)
              : parts[start + i] === f
          )
        )
      )
  );

const files = readdirSync('packages', EXTS).filter((file) => {
  const parts = file.split(/[\\/]/);
  let isIncluded = true;

  if (filtersIncl.length) {
    isIncluded = applyFilters(parts, filtersIncl);
  }

  if (isIncluded && filtersExcl.length) {
    isIncluded = !applyFilters(parts, filtersExcl);
  }

  if (isIncluded && filtersCont.length) {
    isIncluded = filtersCont.some((f) => file.includes(f));
  }

  return isIncluded;
});

if (files.length === 0) {
  exitFatal(`No files matching *.{${EXT_A.join(', ')}}.{${EXT_B.join(', ')}} found${filters.length ? ` (filtering on ${filters.join(', ')})` : ''}`);
}

const cliArgs = [...cmd, ...files].join(' ');

if (testEnv === 'jest') {
  ['--no-warnings', '--experimental-vm-modules']
    .filter((f) => !nodeFlags.includes(f))
    .forEach((f) => nodeFlags.push(f));

  execSync(`${process.execPath} ${nodeFlags.join(' ')} ${importPath('jest-cli/bin/jest.js')} ${cliArgs}`);
} else {
  try {
    execNodeTsSync(`--require @polkadot/dev/node/require-test/${testEnv} ${nodeFlags.join(' ')} ${importPath('@polkadot/dev/scripts/polkadot-exec-node-test.mjs')} ${cliArgs}`);
  } catch {
    process.exit(1);
  }
}

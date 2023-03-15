#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import process from 'node:process';

import { execNodeTsSync, exitFatal, importPath, readdirSync } from './util.mjs';

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
const filtersExcl = {};
const filtersIncl = {};
let testEnv = 'node';

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('-')) {
    switch (args[i]) {
      // environment, not passed-htrough
      case '--env':
        if (!['browser', 'node'].includes(args[++i])) {
          throw new Error(`Invalid --env ${args[i]}, expected 'browser' or 'node'`);
        }

        testEnv = args[i];
        break;

      // -- means that all following args are passed-through as-is
      case '--':
        while (++i < args.length) {
          cmd.push(args[i]);
        }

        break;

      // any other arguments are passed-through (check of skipping here)
      default:
        if (['--experimental-specifier-resolution', '--es-module-specifier-resolution', '--import', '--loader', '--require'].some((f) => args[i].startsWith(f))) {
          // additional node flags (with args)
          nodeFlags.push(args[i]);

          if (!args[i].includes('=')) {
            nodeFlags.push(args[++i]);
          }
        } else if (['--experimental-vm-modules', '--no-warnings'].some((f) => args[i].startsWith(f))) {
          // node flags without additional params
          nodeFlags.push(args[i]);
        } else {
          cmd.push(args[i]);

          // for --<param> we only push when no = is included (self-contained)
          if (!args[i].startsWith('--') || !args[i].includes('=')) {
            cmd.push(args[++i]);
          }
        }

        break;
    }
  } else {
    // no "-"" found, so we use these as path filters
    filters.push(args[i]);

    if (args[i].startsWith('^')) {
      const key = args[i].slice(1);

      if (filtersIncl[key]) {
        delete filtersIncl[key];
      } else {
        filtersExcl[key] = key.split(/[\\/]/);
      }
    } else {
      const key = args[i];

      if (filtersExcl[key]) {
        delete filtersExcl[key];
      } else {
        filtersIncl[key] = key.split(/[\\/]/);
      }
    }
  }
}

const applyFilters = (parts, filters) =>
  Object
    .values(filters)
    .some((filter) =>
      parts
        .map((_, i) => i)
        .filter((i) =>
          filter[0].startsWith(':')
            ? parts[i].includes(filter[0].slice(1))
            : filter.length === 1
              ? parts[i].startsWith(filter[0])
              : parts[i] === filter[0]
        )
        .some((start) =>
          filter.every((f, i) =>
            parts[start + i] && (
              f.startsWith(':')
                ? parts[start + i].includes(f.slice(1))
                : i === (filter.length - 1)
                  ? parts[start + i].startsWith(f)
                  : parts[start + i] === f
            )
          )
        )
    );

const files = readdirSync('packages', EXTS).filter((file) => {
  const parts = file.split(/[\\/]/);
  let isIncluded = true;

  if (Object.keys(filtersIncl).length) {
    isIncluded = applyFilters(parts, filtersIncl);
  }

  if (isIncluded && Object.keys(filtersExcl).length) {
    isIncluded = !applyFilters(parts, filtersExcl);
  }

  return isIncluded;
});

if (files.length === 0) {
  exitFatal(`No files matching *.{${EXT_A.join(', ')}}.{${EXT_B.join(', ')}} found${filters.length ? ` (filtering on ${filters.join(', ')})` : ''}`);
}

const cliArgs = [...cmd, ...files].join(' ');

try {
  execNodeTsSync(`--require @polkadot/dev-test/${testEnv} ${nodeFlags.join(' ')} ${importPath('@polkadot/dev/scripts/polkadot-exec-node-test.mjs')} ${cliArgs}`);
} catch {
  process.exit(1);
}

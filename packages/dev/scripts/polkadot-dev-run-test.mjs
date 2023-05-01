#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import process from 'node:process';

import { execNodeTsSync, exitFatal, importPath, readdirSync } from './util.mjs';

// A & B are just helpers here and in the errors below
const EXT_A = ['spec', 'test'];
const EXT_B = ['ts', 'tsx', 'js', 'jsx', 'cjs', 'mjs'];

// The actual extensions we are looking for
/** @type {string[]} */
const EXTS = EXT_A.reduce((exts, s) => exts.concat(...EXT_B.map((e) => `.${s}.${e}`)), []);

const args = process.argv.slice(2);

console.log('$ polkadot-dev-run-test', args.join(' '));

const cmd = [];
const nodeFlags = [];
const filters = [];
const filtersExcl = {};
const filtersIncl = {};
let testEnv = 'node';
let isDev = false;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    // when running inside a dev environment, specifically @polkadot/dev
    case '--dev-packages-build':
      isDev = true;
      break;

    // environment, not passed-through
    case '--env':
      if (!['browser', 'node'].includes(args[++i])) {
        throw new Error(`Invalid --env ${args[i]}, expected 'browser' or 'node'`);
      }

      testEnv = args[i];
      break;

    // internal flags with no params
    case '--bail':
    case '--console':
      cmd.push(args[i]);
      break;

    // internal flags, with params
    case '--logfile':
      cmd.push(args[i]);
      cmd.push(args[++i]);
      break;

    // node flags that could have additional params
    case '--import':
    case '--loader':
    case '--require':
      nodeFlags.push(args[i]);
      nodeFlags.push(args[++i]);
      break;

    // any other non-flag arguments are passed-through
    default:
      if (args[i].startsWith('-')) {
        throw new Error(`Unknown flag ${args[i]} found`);
      }

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

      break;
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

try {
  const allFlags = `${importPath('@polkadot/dev/scripts/polkadot-exec-node-test.mjs')} ${[...cmd, ...files].join(' ')}`;

  if (isDev) {
    execNodeTsSync(`--require ./packages/dev-test/build/cjs/${testEnv}.js ${allFlags}`, nodeFlags, false, './packages/dev-ts/build/cached.js');
  } else {
    execNodeTsSync(`--require @polkadot/dev-test/${testEnv} ${allFlags}`, nodeFlags);
  }
} catch {
  process.exit(1);
}

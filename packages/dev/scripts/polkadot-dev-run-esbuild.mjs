#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import path from 'node:path';
import yargs from 'yargs';

import { __dirname, execSync, readdirSync, rimrafSync } from './util.mjs';

console.log('$ polkadot-dev-run-esbuild', process.argv.slice(2).join(' '));

const argv = yargs(process.argv.slice(2))
  .options({
    type: {
      description: 'The type of compilation, either cjs or esm',
      type: 'string'
    }
  })
  .strict()
  .argv;

const type = argv.type === 'cjs'
  ? 'cjs'
  : 'esm';
const outDir = `build-esbuild-${type}`;
const files = readdirSync('src', ['.ts', '.tsx']);

rimrafSync(outDir);

execSync(`yarn polkadot-exec-esbuild --tsconfig=${path.join(__dirname, '../config/tsconfig.esbuild.json')} --format=${type} --outdir=${outDir} ${files.join(' ')}`);

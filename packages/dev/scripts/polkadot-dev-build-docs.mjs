#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

import fs from 'node:fs';
import path from 'node:path';

import { copyDirSync, rimrafSync } from './util.mjs';

console.log('$ polkadot-dev-build-docs', process.argv.slice(2).join(' '));

let docRoot = path.join(process.cwd(), 'docs');

if (fs.existsSync(docRoot)) {
  docRoot = path.join(process.cwd(), 'build-docs');

  rimrafSync(docRoot);
  copyDirSync(path.join(process.cwd(), 'docs'), docRoot);
}

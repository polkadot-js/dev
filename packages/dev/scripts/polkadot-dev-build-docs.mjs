#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';

import { copySync } from './copy.mjs';

console.log('$ polkadot-dev-build-docs', process.argv.slice(2).join(' '));

const srcRoot = path.join(process.cwd(), 'docs');

if (fs.existsSync(srcRoot)) {
  const destRoot = path.join(process.cwd(), 'build-docs');

  rimraf.sync(destRoot);

  copySync(srcRoot, destRoot);
}

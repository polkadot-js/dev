#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import rimraf from 'rimraf';

console.log('$ polkadot-dev-build-docs', process.argv.slice(2).join(' '));

let docRoot = path.join(process.cwd(), 'docs');

if (fs.existsSync(docRoot)) {
  docRoot = path.join(process.cwd(), 'build-docs');

  rimraf.sync(docRoot);
  fse.copySync(path.join(process.cwd(), 'docs'), docRoot);
}

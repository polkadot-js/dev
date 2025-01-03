#!/usr/bin/env node
// Copyright 2017-2025 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';

import { copyDirSync, logBin, rimrafSync } from './util.mjs';

logBin('polkadot-dev-build-docs');

let docRoot = path.join(process.cwd(), 'docs');

if (fs.existsSync(docRoot)) {
  docRoot = path.join(process.cwd(), 'build-docs');

  rimrafSync(docRoot);
  copyDirSync(path.join(process.cwd(), 'docs'), docRoot);
}

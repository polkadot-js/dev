#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { copyDirSync, exitFatal } from './util.mjs';

const argv = process.argv.slice(2);
const args = [];
let cd = '';
let flatten = false;

for (let i = 0; i < argv.length; i++) {
  switch (argv[i]) {
    case '--cd':
      cd = argv[++i];
      break;
    case '--flatten':
      flatten = true;
      break;
    default:
      args.push(argv[i]);
      break;
  }
}

const sources = args.slice(0, args.length - 1);
const dest = args[args.length - 1];

console.log('$ polkadot-dev-copy-dir', args.join(' '));

if (!sources || !dest) {
  exitFatal('Expected at least one <source>... and one <destination> argument');
}

sources.forEach((src) =>
  copyDirSync(
    cd
      ? `${cd}/${src}`
      : src,
    cd
      ? `${cd}/${dest}${flatten ? '' : `/${src}`}`
      : `${dest}${flatten ? '' : `/${src}`}`
  )
);

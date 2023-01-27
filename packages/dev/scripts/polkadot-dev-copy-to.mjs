#!/usr/bin/env node
// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import path from 'path';

import { copyDirSync, execSync, mkdirpSync, rimrafSync } from './util.mjs';

const args = process.argv.slice(2);

console.log('$ polkadot-dev-copy-to', args.join(' '));

if (args.length !== 1) {
  throw new Error('Expected one <destination> argument');
}

const dest = path.join(process.cwd(), '..', args[0], 'node_modules');

if (!fs.existsSync(dest)) {
  throw new Error('Destination node_modules folder does not exist');
}

// build to ensure we actually have latest
execSync('yarn build');

// map across what is available and copy it
fs
  .readdirSync('packages')
  .map((dir) => {
    const pkgPath = path.join(process.cwd(), 'packages', dir);

    return [pkgPath, path.join(pkgPath, 'package.json')];
  })
  .filter(([, jsonPath]) => fs.existsSync(jsonPath))
  .map(([pkgPath, json]) => [JSON.parse(fs.readFileSync(json, 'utf8')).name, pkgPath])
  .forEach(([name, pkgPath]) => {
    console.log(`*** Copying ${name} to ${dest}`);

    const outDest = path.join(dest, name);

    // remove the destination
    rimrafSync(outDest);

    // create the root
    mkdirpSync(outDest);

    // copy the build output
    copyDirSync(path.join(pkgPath, 'build'), outDest);

    // copy node_modules, as available
    copyDirSync(path.join(pkgPath, 'node_modules'), path.join(outDest, 'node_modules'));
  });

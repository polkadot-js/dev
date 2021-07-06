// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import fs from 'fs';
import path from 'path';

function sanitizePkg (pkg) {
  return pkg.replace('@polkadot/', '');
}

function createName (input) {
  return `polkadot-${sanitizePkg(input)}`
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
}

export function createInput (pkg, index = 'index.js') {
  return `packages/${sanitizePkg(pkg)}/build/${index}`;
}

export function createOutput (_pkg, external, globals = {}) {
  const name = createName(_pkg);
  const pkg = sanitizePkg(_pkg);

  return {
    file: `packages/${pkg}/build/bundle/${name}.js`,
    format: 'iife',
    globals: external.reduce((all, pkg) => ({
      [pkg]: createName(pkg),
      ...all
    }), { ...globals }),
    name,
    preferConst: true
  };
}

export function createPlugins (entries = []) {
  return [
    alias({ entries }),
    json(),
    nodeResolve({ browser: true }),
    commonjs()
  ];
}

export function createBundle ({ entries = [], external, index = 'index.js', pkg }) {
  return {
    external,
    input: createInput(pkg, index),
    output: createOutput(pkg, external),
    plugins: createPlugins(
      external
        .filter((p) =>
          fs.existsSync(path.join(process.cwd(), 'packages', sanitizePkg(p)))
        )
        .reduce((all, p) => [
          ...all,
          {
            find: `${p}/packageInfo`,
            replacement: `../../${sanitizePkg(p)}/build/packageInfo.js`
          }
        ], [...entries])
    )
  };
}

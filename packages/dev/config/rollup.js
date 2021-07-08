// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import fs from 'fs';
import path from 'path';

// import polyfills from 'rollup-plugin-polyfill-node';
import polyfills from './rollup-polyfill-node';

function sanitizePkg (pkg) {
  return pkg.replace('@polkadot/', '');
}

function createName (input) {
  return `polkadot-${sanitizePkg(input)}`
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
}

export function createInput (pkg, _index) {
  const partialPath = `packages/${sanitizePkg(pkg)}/build`;
  const index = (
    _index ||
    fs.existsSync(path.join(process.cwd(), partialPath, 'bundle.js'))
      ? 'bundle.js'
      : (
        JSON.parse(fs.readFileSync(path.join(process.cwd(), partialPath, 'package.json'), 'utf8')).browser ||
        'index.js'
      )
  );

  return `${partialPath}/${index}`;
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
    intro: 'const global = window;',
    name,
    preferConst: true
  };
}

export function createPlugins (entries = [], polyfill = true) {
  return [
    alias({ entries }),
    json(),
    commonjs(),
    polyfill && polyfills(),
    nodeResolve({ browser: true })
  ].filter((p) => !!p);
}

export function createBundle ({ entries, external, index, pkg, polyfill }) {
  return {
    external,
    input: createInput(pkg, index),
    output: createOutput(pkg, external),
    plugins: createPlugins(entries, polyfill)
  };
}

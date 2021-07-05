// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';

function createName (input) {
  return `polkadot-${input.replace('@polkadot/', '')}`
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
}

export function createInput (pkg, index = 'index.js') {
  return `packages/${pkg}/build/${index}`;
}

export function createOutput (pkg, external, globals = {}) {
  const name = createName(pkg);

  return {
    file: `packages/${pkg}/build/bundle/${name}.js`,
    format: 'iife',
    globals: external.reduce((all, pkg) => ({
      ...all,
      [pkg]: createName(pkg)
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

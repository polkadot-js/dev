// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export function createOutput (name, outDir, globals) {
  return {
    file: `${outDir}/${name}.js`,
    format: 'iife',
    globals,
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

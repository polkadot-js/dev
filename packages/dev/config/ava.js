// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { importPath } from './util/mjs';

export default {
  extensions: {
    cjs: true,
    js: true,
    mjs: true,
    ts: 'module',
    tsx: 'module'
  },
  files: [
    'packages/**/src/**/*.spec.ts',
    'packages/**/src/**/*.spec.tsx'
  ],
  nodeArguments: [
    // Disable the experimental warning that follow
    '--no-warnings',
    // NOTE: Since we don't use extensions (added at compile-time), this flag is
    // quite useful to us.
    //
    // ExperimentalWarning: The Node.js specifier resolution flag is experimental.
    // It could change or be removed at any time.
    '--experimental-specifier-resolution=node',
    // NOTE: By using the ts-node/esm loader, this warning is displayed from the
    // intrernal usage of this toolset.
    //
    // ExperimentalWarning: --experimental-loader is an experimental feature.
    // This feature could change at any time
    `--loader=${importPath('@swc/register')}` // ts-node/esm
  ]
};

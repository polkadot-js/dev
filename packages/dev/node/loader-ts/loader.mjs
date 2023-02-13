// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted from: https://nodejs.org/api/esm.html#esm_transpiler_loader

import { transform } from '@swc/core';
import { fileURLToPath } from 'node:url';

const extensionsRegex = /\.tsx?$/;

/**
 * Load all TypeScript files, compile via swc on-the-fly
 **/
export async function load (url, context, nextLoad) {
  if (extensionsRegex.test(url)) {
    // used the chained loaders to retrieve
    const { source } = await nextLoad(url, { ...context, format: 'module' });
    // compile via swc - we can also use transformSync
    const { code } = await transform(source.toString(), {
      filename: fileURLToPath(url),
      jsc: {
        experimental: {
          keepImportAssertions: true
        },
        target: 'es2020'
      },
      sourceMaps: 'inline'
    });

    return {
      format: 'module',
      source: code
    };
  }

  return nextLoad(url, context);
}

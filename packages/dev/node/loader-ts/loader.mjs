// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { transform } from '@swc/core';
import { fileURLToPath } from 'node:url';

import { EXT_TS_REGEX } from './common.mjs';

/**
 * @typedef {{ format: 'commonjs' | 'module', shortCircuit?: boolean, source: string }} Loaded
 **/

/**
 * Load all TypeScript files, compile via swc on-the-fly
 *
 * @param {string} url - The url to resolve
 * @param {Record<string, unknown>} context - The context
 * @param {(url: string, context: Record<string, unknown>) => Promise<Loaded>} nextLoad - The next chained loader
 * @returns {Promise<Loaded>}
 **/
export async function load (url, context, nextLoad) {
  if (EXT_TS_REGEX.test(url)) {
    // used the chained loaders to retrieve
    const { source } = await nextLoad(url, {
      ...context,
      format: 'module'
    });

    // compile via swc - we can also use transformSync (no penalty either way)
    const { code } = await transform(source.toString(), {
      // we add the actual filename - this enables auto-jsx transforms
      filename: fileURLToPath(url),
      jsc: {
        experimental: {
          // import assertions, these are needed for later Node.js versions)
          keepImportAssertions: true
        },
        target: 'esnext'
      },
      sourceMaps: 'inline',
      swcrc: false
    });

    return {
      format: 'module',
      source: code
    };
  }

  return nextLoad(url, context);
}

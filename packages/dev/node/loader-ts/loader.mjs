// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { transform } from '@swc/core';
import { fileURLToPath } from 'node:url';

import { EXT_REGEX } from './common.mjs';

/**
 * @typedef {{ format: 'commonjs' | 'module', shortCircuit?: boolean, source: string }} Loaded
 **/

// options that are passed to the SWC compiler (note the use of
// import assertions, these are needed for later Node.js versions)
const SWC_OPTS = {
  jsc: {
    experimental: {
      keepImportAssertions: true
    },
    target: 'es2020'
  },
  sourceMaps: 'inline'
};

/**
 * Load all TypeScript files, compile via swc on-the-fly
 *
 * @param {string} url - The url to resolve
 * @param {Record<string, unknown>} context - The context
 * @param {(url: string, context: Record<string, unknown>) => Promise<Loaded>} nextLoad - The next chained loader
 * @returns {Promise<Loaded>}
 **/
export async function load (url, context, nextLoad) {
  if (EXT_REGEX.test(url)) {
    // used the chained loaders to retrieve
    const { source } = await nextLoad(url, { ...context, format: 'module' });
    // compile via swc - we can also use transformSync
    const { code } = await transform(source.toString(), {
      ...SWC_OPTS,
      filename: fileURLToPath(url)
    });

    return {
      format: 'module',
      source: code
    };
  }

  return nextLoad(url, context);
}

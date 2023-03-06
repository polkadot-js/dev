// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import { EXT_TS_REGEX } from './common.mjs';

/**
 * @typedef {{ format: 'commonjs' | 'module', shortCircuit?: boolean, source: string }} Loaded
 **/

/**
 * Load all TypeScript files, compile via tsc on-the-fly
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

    // compile via typescript
    const { outputText } = ts.transpileModule(source.toString(), {
      compilerOptions: {
        esModuleInterop: true,
        importHelpers: true,
        inlineSourceMap: true,
        jsx: url.endsWith('.tsx')
          ? 'react-jsx'
          : undefined,
        module: 'esnext',
        moduleResolution: 'node16',
        skipLibCheck: true,
        target: 'esnext'
      },
      fileName: fileURLToPath(url)
    });

    return {
      format: 'module',
      source: outputText
    };
  }

  return nextLoad(url, context);
}

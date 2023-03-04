// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import * as swc from '@swc/core';
// import { fileURLToPath } from 'node:url';
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
        jsx: 'react-jsx',
        module: 'esnext',
        moduleResolution: 'node16',
        target: 'esnext'
      }
    });

    // // compile via swc
    // const { code } = await swc.transform(source.toString(), {
    //   // we add the actual filename - this enables both ts and tsx transforms
    //   // (alternatively we can do the extension check and pass the options)
    //   filename: fileURLToPath(url),
    //   jsc: {
    //     experimental: {
    //       // import assertions, these are needed for later Node.js versions)
    //       keepImportAssertions: true
    //     },
    //     externalHelpers: true,
    //     target: 'esnext',
    //     transform: {
    //       react: {
    //         // this is non-default, so required to allow React 17+ style
    //         runtime: 'automatic'
    //       }
    //     }
    //   },
    //   module: {
    //     type: 'es6'
    //   },
    //   sourceMaps: 'inline',
    //   swcrc: false
    // });

    return {
      format: 'module',
      source: outputText
    };
  }

  return nextLoad(url, context);
}

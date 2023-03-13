// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import { EXT_TS_REGEX } from './common.mjs';

/** @typedef {{ format: 'commonjs' | 'module'; shortCircuit?: boolean; source: string }} Loaded */

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
          ? ts.JsxEmit.ReactJSX
          : undefined,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        skipLibCheck: true,
        // Aligns with scripts/polkadot-dev-build-ts & config/tsconfig
        target: ts.ScriptTarget.ES2020
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

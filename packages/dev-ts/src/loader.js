// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-check

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import { EXT_TS_REGEX } from './common.js';

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

    // we use a hash of the source to determine caching
    const sourceHash = `//# sourceHash=${crypto.createHash('sha256').update(source).digest('hex')}`;
    const compiledFile = url.includes('/src/')
      ? fileURLToPath(
        url
          .replace(/\.tsx?$/, '.js')
          .replace('/src/', '/build-loader/')
      )
      : null;

    if (compiledFile && fs.existsSync(compiledFile)) {
      const compiled = fs.readFileSync(compiledFile, 'utf-8');

      if (compiled.includes(sourceHash)) {
        return {
          format: 'module',
          source: compiled
        };
      }
    }

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

    if (compiledFile) {
      const compiledDir = path.dirname(compiledFile);

      if (!fs.existsSync(compiledDir)) {
        fs.mkdirSync(compiledDir, { recursive: true });
      }

      fs.writeFileSync(compiledFile, `${outputText}\n${sourceHash}`, 'utf-8');
    }

    return {
      format: 'module',
      source: outputText
    };
  }

  return nextLoad(url, context);
}

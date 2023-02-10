// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted from: https://nodejs.org/api/esm.html#esm_transpiler_loader

import { transform } from '@swc/core';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';

const baseURL = pathToFileURL(`${process.cwd()}/`).href;
const extensionsRegex = /\.ts$|\.tsx$/;
const extensions = ['.ts', '.tsx'];

export function resolve (specifier, context, nextResolve) {
  const { parentURL = baseURL } = context;

  if (extensionsRegex.test(specifier)) {
    // handle .ts extensions directly
    return {
      format: 'module',
      shortCircuit: true,
      url: new URL(specifier, parentURL).href
    };
  }

  // magic extension resolves
  const dir = path.dirname(fileURLToPath(parentURL));
  const file = (
    (
      // handle . imports for directories
      specifier === '.' &&
      extensions
        .map((e) => `index${e}`)
        .find((f) => fs.existsSync(path.join(dir, f)))
    ) ||
    (
      // tests to see if this is a file (without extension)
      extensions
        .map((e) => `${specifier}${e}`)
        .find((f) => fs.existsSync(path.join(dir, f)))
    ) ||
    (
      // test to see if this is a directory
      extensions
        .map((e) => `${specifier}/index${e}`)
        .find((f) => fs.existsSync(path.join(dir, f)))
    )
  );

  if (file) {
    return {
      format: 'module',
      shortCircuit: true,
      url: new URL(file, parentURL).href
    };
  }

  return nextResolve(specifier, context);
}

export async function load (url, context, nextLoad) {
  if (extensionsRegex.test(url)) {
    // used the chained loaders to retrieve
    const { source } = await nextLoad(url, { ...context, format: 'module' });

    // compile - we can also use transformSync
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

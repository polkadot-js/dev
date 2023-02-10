// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted from: https://nodejs.org/api/esm.html#esm_transpiler_loader

import { transformSync } from '@swc/core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const extensionsRegex = /\.ts$|\.tsx$/;
const extensions = ['.ts', '.tsx'];

export function resolve (specifier, context, defaultResolve) {
  if (extensionsRegex.test(specifier)) {
    // handle .ts extensions directly
    return {
      format: 'module',
      shortCircuit: true,
      url: new URL(specifier, context.parentURL).href
    };
  } else if (context.parentURL) {
    // magic extension resolves
    const dir = path.dirname(fileURLToPath(context.parentURL));
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
        url: new URL(file, context.parentURL).href
      };
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export function load (url, context, defaultLoad) {
  if (extensionsRegex.test(url)) {
    const filename = fileURLToPath(url);
    const source = fs.readFileSync(filename, 'utf-8');
    const output = transformSync(source, {
      filename,
      sourceMaps: 'inline'
    });

    return {
      format: 'module',
      shortCircuit: true,
      source: output.code
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
